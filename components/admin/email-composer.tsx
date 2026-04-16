"use client";

import React, { useCallback, useId, useMemo, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Send,
  ChevronDown,
  RotateCcw,
  Paperclip,
  X,
  ImageIcon,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  buildEmailHtml,
  type EmailTemplateParams,
  type EmailType,
} from "@/lib/admin-email-template";

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z
  .object({
    to: z.string().email("正しいメールアドレスを入力してください"),
    toName: z.string().max(100, "100文字以内で入力してください"),
    subject: z
      .string()
      .min(1, "件名を入力してください")
      .max(200, "200文字以内で入力してください"),
    type: z.enum(["reply", "sales", "custom"]),
    greeting: z
      .string()
      .min(1, "挨拶文を入力してください")
      .max(1000, "1000文字以内で入力してください"),
    body: z
      .string()
      .min(1, "本文を入力してください")
      .max(5000, "5000文字以内で入力してください"),
    ctaLabel: z.string().max(80, "80文字以内で入力してください").optional(),
    ctaUrl: z
      .string()
      .max(500)
      .optional()
      .refine(
        (val) => !val || val === "" || z.string().url().safeParse(val).success,
        { message: "正しいURLを入力してください" }
      ),
    closing: z.string().max(500, "500文字以内で入力してください").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.ctaLabel && data.ctaLabel.trim() && !data.ctaUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ctaUrl"],
        message: "CTAボタンを設定する場合はURLも入力してください",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

// ─── Type options ─────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: EmailType; label: string; desc: string }[] = [
  {
    value: "reply",
    label: "お問い合わせ返信",
    desc: "受け取ったお問い合わせへの返信",
  },
  { value: "sales", label: "ご提案", desc: "新規・既存顧客への営業メール" },
  { value: "custom", label: "お知らせ", desc: "その他の連絡・案内" },
];

// ─── Default greeting templates ───────────────────────────────────────────────

const GREETING_TEMPLATES: Record<EmailType, string> = {
  reply:
    "この度はお問い合わせいただきまして、誠にありがとうございます。\nMake It Tech（メイクイットテック）担当の緒方と申します。\n内容を確認いたしましたので、ご連絡申し上げます。",
  sales:
    "突然のご連絡をお許しください。\nMake It Tech（メイクイットテック）の緒方と申します。\n新潟を中心にDX支援・Web制作を手がけております。",
  custom:
    "平素より大変お世話になっております。\nMake It Tech（メイクイットテック）の緒方です。\n以下の件についてご連絡差し上げます。",
};

const CLOSING_DEFAULT =
  "ご不明な点がございましたら、お気軽にご返信ください。\n引き続きどうぞよろしくお願いいたします。\n\nMake It Tech　緒方 雄輝";

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && (
          <span className="ml-1 text-[11px] text-orange-500 font-semibold">
            必須
          </span>
        )}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

// ─── Select component (no Radix dep needed) ───────────────────────────────────

function NativeSelect({
  id,
  value,
  onChange,
  options,
  className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

// ─── Preview pane ─────────────────────────────────────────────────────────────

function EmailPreview({ html }: { html: string }) {
  return (
    <div className="h-full min-h-[400px] overflow-hidden rounded-2xl border border-border bg-[#F4F5F7]">
      <iframe
        title="メールプレビュー"
        srcDoc={html}
        className="h-full w-full"
        style={{ minHeight: 400, border: "none" }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

// ─── Attachment types ─────────────────────────────────────────────────────────

interface AttachmentItem {
  filename: string;
  content: string;      // base64
  content_type: string;
  size: number;         // bytes
  preview: string | null; // object URL for images
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;   // 5 MB per file
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20 MB total
const MAX_FILES = 5;
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EmailComposer() {
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastSent, setLastSent] = useState<{
    to: string;
    subject: string;
  } | null>(null);

  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      to: "",
      toName: "",
      subject: "",
      type: "reply",
      greeting: GREETING_TEMPLATES.reply,
      body: "",
      ctaLabel: "",
      ctaUrl: "",
      closing: CLOSING_DEFAULT,
    },
  });

  const values = watch();

  // Auto-fill greeting template when type changes
  const handleTypeChange = useCallback(
    (newType: string) => {
      setValue("type", newType as EmailType, { shouldValidate: false });
      const current = values.greeting;
      const isTemplate = Object.values(GREETING_TEMPLATES).includes(current);
      if (isTemplate || !current.trim()) {
        setValue("greeting", GREETING_TEMPLATES[newType as EmailType]);
      }
    },
    [setValue, values.greeting]
  );

  const previewHtml = useMemo((): string => {
    const params: EmailTemplateParams = {
      toName: values.toName || "（宛先名未入力）",
      type: (values.type as EmailType) || "custom",
      greeting: values.greeting || "（挨拶文未入力）",
      body: values.body || "（本文未入力）",
      ctaLabel: values.ctaLabel || undefined,
      ctaUrl: values.ctaUrl || undefined,
      closing: values.closing || undefined,
    };
    return buildEmailHtml(params);
  }, [values]);

  // ── Attachment handlers ──────────────────────────────────────────────────────

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const current = attachments;

      const totalAfter =
        current.reduce((s, a) => s + a.size, 0) +
        fileArray.reduce((s, f) => s + f.size, 0);

      if (current.length + fileArray.length > MAX_FILES) {
        toast.error(`添付ファイルは最大 ${MAX_FILES} 件までです。`);
        return;
      }
      if (totalAfter > MAX_TOTAL_SIZE) {
        toast.error(`合計サイズが上限（${formatBytes(MAX_TOTAL_SIZE)}）を超えています。`);
        return;
      }

      const newItems: AttachmentItem[] = [];
      for (const file of fileArray) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`「${file.name}」は ${formatBytes(MAX_FILE_SIZE)} を超えています。`);
          continue;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`「${file.name}」は対応していないファイル形式です。`);
          continue;
        }
        // Already added?
        if (current.some((a) => a.filename === file.name && a.size === file.size)) {
          continue;
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Strip data URL prefix -> just the base64 part
            resolve(result.split(",")[1] ?? "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const preview = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null;

        newItems.push({
          filename: file.name,
          content: base64,
          content_type: file.type,
          size: file.size,
          preview,
        });
      }

      if (newItems.length > 0) {
        setAttachments((prev) => [...prev, ...newItems]);
      }
    },
    [attachments]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
        e.target.value = "";
      }
    },
    [processFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => {
      const item = prev[index];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSending(true);
    try {
      const payload = {
        ...data,
        attachments: attachments.map(({ filename, content, content_type }) => ({
          filename,
          content,
          content_type,
        })),
      };
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          json.error ?? "送信に失敗しました。時間をおいて再試行してください。"
        );
        return;
      }
      setLastSent({ to: data.to, subject: data.subject });
      toast.success(`「${data.subject}」を ${data.to} に送信しました。`);
    } catch {
      toast.error("ネットワークエラーが発生しました。");
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    reset();
    setLastSent(null);
    attachments.forEach((a) => { if (a.preview) URL.revokeObjectURL(a.preview); });
    setAttachments([]);
    toast.info("フォームをリセットしました。");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="secondary" className="rounded-xl">
            Admin Console
          </Badge>
          <h1 className="mt-3 flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
            <Mail className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
            メール送信
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            個別メールをデザインテンプレートで送信します。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs"
            onClick={() => setShowPreview((prev) => !prev)}
          >
            {showPreview ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {showPreview ? "プレビューを隠す" : "HTMLプレビュー"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            リセット
          </Button>
        </div>
      </div>

      {/* Last sent notice */}
      {lastSent && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            送信完了
          </p>
          <p className="mt-0.5 text-xs text-green-600 dark:text-green-500">
            {lastSent.to} へ「{lastSent.subject}」を送信しました。
          </p>
        </div>
      )}

      {/* Two-column layout on large screens */}
      <div
        className={cn(
          "grid gap-6",
          showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"
        )}
      >
        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-6"
          noValidate
        >
          {/* Section: 送信先 */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              送信先
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="宛先メールアドレス"
                htmlFor={id("to")}
                error={errors.to?.message}
                required
              >
                <Input
                  id={id("to")}
                  type="email"
                  placeholder="example@email.com"
                  className="rounded-xl"
                  {...register("to")}
                />
              </Field>
              <Field
                label="宛先名（敬称なし）"
                htmlFor={id("toName")}
                error={errors.toName?.message}
                hint="例: 田中太郎"
              >
                <Input
                  id={id("toName")}
                  type="text"
                  placeholder="田中太郎"
                  className="rounded-xl"
                  {...register("toName")}
                />
              </Field>
            </div>
          </div>

          <Separator />

          {/* Section: メール内容 */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              メール内容
            </p>
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="件名"
                  htmlFor={id("subject")}
                  error={errors.subject?.message}
                  required
                >
                  <Input
                    id={id("subject")}
                    type="text"
                    placeholder="例: お問い合わせへのご回答"
                    className="rounded-xl"
                    {...register("subject")}
                  />
                </Field>
                <Field
                  label="メール種別"
                  htmlFor={id("type")}
                  error={errors.type?.message}
                  required
                >
                  <NativeSelect
                    id={id("type")}
                    value={values.type}
                    onChange={handleTypeChange}
                    options={TYPE_OPTIONS.map((o) => ({
                      value: o.value,
                      label: `${o.label} — ${o.desc}`,
                    }))}
                  />
                </Field>
              </div>

              <Field
                label="挨拶文"
                htmlFor={id("greeting")}
                error={errors.greeting?.message}
                required
                hint="メール冒頭の挨拶・自己紹介文"
              >
                <Textarea
                  id={id("greeting")}
                  rows={4}
                  placeholder="平素よりお世話になっております。..."
                  className="rounded-xl resize-none text-sm leading-relaxed"
                  {...register("greeting")}
                />
              </Field>

              <Field
                label="本文"
                htmlFor={id("body")}
                error={errors.body?.message}
                required
                hint="メインメッセージ。ハイライトボックスに表示されます。"
              >
                <Textarea
                  id={id("body")}
                  rows={6}
                  placeholder="ご連絡いただいた件について、以下の通りご回答いたします。..."
                  className="rounded-xl resize-none text-sm leading-relaxed"
                  {...register("body")}
                />
              </Field>
            </div>
          </div>

          <Separator />

          {/* Section: CTAボタン（任意） */}
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              CTAボタン
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal">
                任意
              </span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="ボタンテキスト"
                htmlFor={id("ctaLabel")}
                error={errors.ctaLabel?.message}
                hint='例: "詳細を確認する"'
              >
                <Input
                  id={id("ctaLabel")}
                  type="text"
                  placeholder="詳細を確認する"
                  className="rounded-xl"
                  {...register("ctaLabel")}
                />
              </Field>
              <Field
                label="リンクURL"
                htmlFor={id("ctaUrl")}
                error={errors.ctaUrl?.message}
                hint="https:// から始まるURL"
              >
                <Input
                  id={id("ctaUrl")}
                  type="url"
                  placeholder="https://make-it-tech.com"
                  className="rounded-xl"
                  {...register("ctaUrl")}
                />
              </Field>
            </div>
          </div>

          <Separator />

          {/* Section: 締めの言葉（任意） */}
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              締めの言葉
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal">
                任意
              </span>
            </p>
            <Field
              label="締め文・署名"
              htmlFor={id("closing")}
              error={errors.closing?.message}
              hint="本文の後に表示される締めの言葉・署名など"
            >
              <Textarea
                id={id("closing")}
                rows={4}
                placeholder="引き続きよろしくお願いいたします。&#10;Make It Tech　緒方"
                className="rounded-xl resize-none text-sm leading-relaxed"
                {...register("closing")}
              />
            </Field>
          </div>

          <Separator />

          {/* Section: 添付ファイル（任意） */}
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              添付ファイル
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal">
                任意
              </span>
            </p>

            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="ファイルを追加"
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 transition-colors",
                isDragOver
                  ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                  : "border-border hover:border-orange-300 hover:bg-muted/40"
              )}
            >
              <Paperclip className="h-5 w-5 text-muted-foreground" />
              <p className="text-center text-xs text-muted-foreground">
                クリックまたはドラッグ＆ドロップでファイルを追加
              </p>
              <p className="text-center text-[10px] text-muted-foreground/70">
                画像（JPG/PNG/GIF/WebP）・PDF・TXT・DOCX　最大 {MAX_FILES} 件・1件 5MB まで
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(",")}
              className="sr-only"
              onChange={handleFileInputChange}
            />

            {/* Attachment list */}
            {attachments.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {attachments.map((att, i) => (
                  <li
                    key={`${att.filename}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2"
                  >
                    {att.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={att.preview}
                        alt={att.filename}
                        className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : att.content_type === "application/pdf" ? (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
                        <FileText className="h-5 w-5 text-red-500" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{att.filename}</p>
                      <p className="text-[10px] text-muted-foreground">{formatBytes(att.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      aria-label={`${att.filename} を削除`}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {attachments.length > 0 && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                {attachments.length} 件 /
                合計 {formatBytes(attachments.reduce((s, a) => s + a.size, 0))}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <p className="text-xs text-muted-foreground">
              {values.to ? (
                <>
                  送信先:{" "}
                  <span className="font-medium text-foreground">
                    {values.to}
                  </span>
                </>
              ) : (
                "宛先を入力してください"
              )}
            </p>
            <Button
              type="submit"
              disabled={isSending}
              className="rounded-xl gap-2 bg-orange-500 text-white hover:bg-orange-600 sm:min-w-[140px]"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSending ? "送信中…" : "メールを送信"}
            </Button>
          </div>
        </form>

        {/* ── Preview ── */}
        {showPreview && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                HTMLプレビュー
              </p>
              <Badge variant="outline" className="rounded-xl text-[10px]">
                リアルタイム
              </Badge>
            </div>
            <EmailPreview html={previewHtml} />
            <p className="text-[11px] text-muted-foreground">
              ※ フォームの変更がリアルタイムで反映されます。実際のメールクライアントで表示が異なる場合があります。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
