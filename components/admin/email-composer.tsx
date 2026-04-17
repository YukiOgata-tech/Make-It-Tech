"use client";

import React, {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Plus,
  GripVertical,
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
  TYPE_LABELS,
  type EmailTemplateParams,
  type EmailType,
  type CtaButton,
} from "@/lib/admin-email-template";

// ─── Zod schema ───────────────────────────────────────────────────────────────

const FROM_OPTIONS = [
  {
    key: "default" as const,
    label: "no-reply@make-it-tech.com",
    desc: "自動返信・通知向け",
  },
  {
    key: "manual" as const,
    label: "info@make-it-tech.com",
    desc: "手動送信・個別対応向け",
  },
] as const;

type FromKey = (typeof FROM_OPTIONS)[number]["key"];

const schema = z.object({
  to: z.string().email("正しいメールアドレスを入力してください"),
  toName: z.string().max(100, "100文字以内で入力してください"),
  subject: z
    .string()
    .min(1, "件名を入力してください")
    .max(200, "200文字以内で入力してください"),
  type: z.enum(["reply", "sales", "notice", "custom"]),
  greeting: z
    .string()
    .min(1, "挨拶文を入力してください")
    .max(1000, "1000文字以内で入力してください"),
  body: z
    .string()
    .min(1, "本文を入力してください")
    .max(5000, "5000文字以内で入力してください"),
  closing: z.string().max(500, "500文字以内で入力してください").optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Type options ─────────────────────────────────────────────────────────────

const TYPE_OPTIONS = (
  Object.entries(TYPE_LABELS) as [EmailType, string][]
).map(([value, label]) => ({ value, label }));

// ─── Greeting templates ───────────────────────────────────────────────────────

const GREETING_TEMPLATES: Record<EmailType, string> = {
  reply:
    "この度はお問い合わせいただきまして、誠にありがとうございます。\nMake It Tech（メイクイットテック）の尾形友輝と申します。\n内容を確認いたしましたので、ご連絡申し上げます。",
  sales:
    "突然のご連絡をお許しください。\nMake It Tech（メイクイットテック）の尾形友輝と申します。\n新潟を中心にDX支援・Web制作を手がけております。",
  notice:
    "平素より大変お世話になっております。\nMake It Tech（メイクイットテック）の尾形友輝です。\n以下の件についてご連絡差し上げます。",
  custom:
    "平素より大変お世話になっております。\nMake It Tech（メイクイットテック）の尾形友輝です。\n以下の件についてご案内申し上げます。",
};

const CLOSING_DEFAULT = "Make It Tech　尾形友輝";

// ─── CTA color palette ────────────────────────────────────────────────────────

const CTA_COLORS: { label: string; value: string }[] = [
  { label: "オレンジ", value: "#E2673D" },
  { label: "ブルー",   value: "#2563EB" },
  { label: "グリーン", value: "#059669" },
  { label: "パープル", value: "#7C3AED" },
  { label: "ティール", value: "#0891B2" },
  { label: "ダーク",   value: "#1C2C34" },
];

const MAX_CTA = 4;

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#1C2C34" : "#ffffff";
}

// ─── Attachment config ────────────────────────────────────────────────────────

interface AttachmentItem {
  filename: string;
  content: string;
  content_type: string;
  size: number;
  preview: string | null;
}

const MAX_FILE_SIZE  = 5  * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const MAX_FILES      = 5;

// Accept string for file input
const ACCEPT_EXTS = [
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif",
  ".pdf",
  ".txt", ".csv",
  ".doc", ".docx",
  ".xls", ".xlsx",
  ".ppt", ".pptx",
  ".mdb", ".accdb",
  ".vsd", ".vsdx",
  ".pub",
  ".one",
].join(",");

const ALLOWED_MIME_PREFIXES = [
  "image/",
  "application/pdf",
  "text/",
  "application/msword",
  "application/vnd.openxmlformats-officedocument",
  "application/vnd.ms-",
  "application/vnd.visio",
  "application/onenote",
  "application/octet-stream", // Android の汎用タイプ
];

// 拡張子ベースの許可リスト（MIMEタイプが取れない場合のフォールバック）
const ALLOWED_EXTS = new Set([
  "jpg","jpeg","png","gif","webp","heic","heif",
  "pdf","txt","csv",
  "doc","docx","xls","xlsx","ppt","pptx",
  "mdb","accdb","vsd","vsdx","pub","one",
]);

function isMimeAllowed(mime: string, filename: string): boolean {
  // MIMEタイプが空 or 汎用の場合は拡張子で判定
  if (!mime || mime === "application/octet-stream") {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    return ALLOWED_EXTS.has(ext);
  }
  return ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p));
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function Field({
  label, htmlFor, error, required, hint, children,
}: {
  label: string; htmlFor: string; error?: string;
  required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && (
          <span className="ml-1 text-[11px] text-orange-500 font-semibold">必須</span>
        )}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

function NativeSelect({
  id, value, onChange, options, className,
}: {
  id: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; className?: string;
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
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function EmailPreview({ html }: { html: string }) {
  return (
    <div className="h-full min-h-[500px] overflow-hidden rounded-2xl border border-border bg-[#F1F3F5]">
      <iframe
        title="メールプレビュー"
        srcDoc={html}
        className="h-full w-full"
        style={{ minHeight: 500, border: "none" }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EmailComposer() {
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending]     = useState(false);
  const [fromKey, setFromKey]         = useState<FromKey>("manual");
  const [lastSent, setLastSent]       = useState<{ to: string; subject: string } | null>(null);

  // CTA buttons
  const [ctaButtons, setCtaButtons] = useState<(CtaButton & { id: string })[]>([]);

  // Attachments
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isDragOver, setIsDragOver]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uid = useId();
  const id  = (name: string) => `${uid}-${name}`;

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      to: "", toName: "", subject: "",
      type: "reply",
      greeting: GREETING_TEMPLATES.reply,
      body: "",
      closing: CLOSING_DEFAULT,
    },
  });

  const values = watch();

  // Auto-fill greeting when type changes
  const handleTypeChange = useCallback(
    (newType: string) => {
      setValue("type", newType as EmailType, { shouldValidate: false });
      const current = values.greeting;
      const isTemplate = Object.values(GREETING_TEMPLATES).some((t) => t === current);
      if (isTemplate || !current.trim()) {
        setValue("greeting", GREETING_TEMPLATES[newType as EmailType]);
      }
    },
    [setValue, values.greeting]
  );

  // ── Preview HTML ──────────────────────────────────────────────────────────

  const previewHtml = useMemo((): string => {
    const displayName = values.toName?.trim() || values.to || "（宛先未入力）";
    const params: EmailTemplateParams = {
      toName:          displayName,
      toEmail:         values.to,
      type:            (values.type as EmailType) || "custom",
      greeting:        values.greeting || "（挨拶文未入力）",
      body:            values.body     || "（本文未入力）",
      ctaButtons:      ctaButtons.length > 0 ? ctaButtons : undefined,
      closing:         values.closing  || undefined,
      attachmentCount: attachments.length,
    };
    return buildEmailHtml(params);
  }, [values, ctaButtons, attachments.length]);

  // ── CTA handlers ──────────────────────────────────────────────────────────

  const addCtaButton = () => {
    if (ctaButtons.length >= MAX_CTA) return;
    setCtaButtons((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "", url: "", color: CTA_COLORS[0].value },
    ]);
  };

  const updateCta = (btnId: string, key: keyof CtaButton, val: string) => {
    setCtaButtons((prev) =>
      prev.map((b) => (b.id === btnId ? { ...b, [key]: val } : b))
    );
  };

  const removeCta = (btnId: string) => {
    setCtaButtons((prev) => prev.filter((b) => b.id !== btnId));
  };

  // ── Attachment handlers ───────────────────────────────────────────────────

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const current = attachments;

      if (current.length + fileArray.length > MAX_FILES) {
        toast.error(`添付ファイルは最大 ${MAX_FILES} 件までです。`);
        return;
      }

      const totalAfter =
        current.reduce((s, a) => s + a.size, 0) +
        fileArray.reduce((s, f) => s + f.size, 0);

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
        if (!isMimeAllowed(file.type, file.name)) {
          toast.error(`「${file.name}」は対応していないファイル形式です。`);
          continue;
        }
        if (current.some((a) => a.filename === file.name && a.size === file.size)) continue;

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = () => resolve((reader.result as string).split(",")[1] ?? "");
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newItems.push({
          filename:     file.name,
          content:      base64,
          content_type: file.type,
          size:         file.size,
          preview:      file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        });
      }

      if (newItems.length > 0) setAttachments((prev) => [...prev, ...newItems]);
    },
    [attachments]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) { processFiles(e.target.files); e.target.value = ""; }
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

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // Validate CTA buttons
    for (const btn of ctaButtons) {
      if (!btn.label.trim()) { toast.error("CTAボタンのテキストを入力してください。"); return; }
      try { new URL(btn.url); } catch {
        toast.error(`CTAボタンのURLが正しくありません: ${btn.label}`); return;
      }
    }

    setIsSending(true);
    try {
      const payload = {
        ...data,
        fromKey,
        ctaButtons: ctaButtons.length > 0
          ? ctaButtons.map(({ label, url, color }) => ({ label, url, color }))
          : undefined,
        attachments: attachments.map(({ filename, content, content_type }) => ({
          filename, content, content_type,
        })),
      };
      const res  = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "送信に失敗しました。時間をおいて再試行してください。");
        return;
      }
      const fromLabel = FROM_OPTIONS.find((o) => o.key === fromKey)?.label ?? "";
      setLastSent({ to: data.to, subject: data.subject });
      toast.success(`「${data.subject}」を ${data.to} に送信しました。（送信元: ${fromLabel}）`);
    } catch {
      toast.error("ネットワークエラーが発生しました。");
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    reset();
    setLastSent(null);
    setCtaButtons([]);
    attachments.forEach((a) => { if (a.preview) URL.revokeObjectURL(a.preview); });
    setAttachments([]);
    toast.info("フォームをリセットしました。");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="secondary" className="rounded-xl">Admin Console</Badge>
          <h1 className="mt-3 flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
            <Mail className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
            メール送信
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            個別メールをデザインテンプレートで送信します。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm"
            className="rounded-xl gap-1.5 text-xs"
            onClick={() => setShowPreview((prev) => !prev)}>
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? "プレビューを隠す" : "HTMLプレビュー"}
          </Button>
          <Button type="button" variant="outline" size="sm"
            className="rounded-xl gap-1.5 text-xs"
            onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            リセット
          </Button>
        </div>
      </div>

      {/* Last sent notice */}
      {lastSent && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">送信完了</p>
          <p className="mt-0.5 text-xs text-green-600 dark:text-green-500">
            {lastSent.to} へ「{lastSent.subject}」を送信しました。
          </p>
        </div>
      )}

      {/* Layout */}
      <div className={cn("grid gap-6", showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1")}>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-6"
          noValidate
        >
          {/* 送信元 */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">送信元アドレス</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {FROM_OPTIONS.map((opt) => {
                const selected = fromKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFromKey(opt.key)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/30"
                        : "border-border bg-background hover:border-border/80 hover:bg-muted/30"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-semibold",
                      selected ? "text-orange-600 dark:text-orange-400" : "text-foreground"
                    )}>
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* 送信先 */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">送信先</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="宛先メールアドレス" htmlFor={id("to")} error={errors.to?.message} required>
                <Input id={id("to")} type="email" placeholder="example@email.com"
                  className="rounded-xl" {...register("to")} />
              </Field>
              <Field label="宛先名（敬称なし）" htmlFor={id("toName")} error={errors.toName?.message}
                hint="未入力の場合はメールアドレスを表示">
                <Input id={id("toName")} type="text" placeholder="田中太郎"
                  className="rounded-xl" {...register("toName")} />
              </Field>
            </div>
          </div>

          <Separator />

          {/* メール内容 */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">メール内容</p>
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="件名" htmlFor={id("subject")} error={errors.subject?.message} required>
                  <Input id={id("subject")} type="text" placeholder="例: お問い合わせへのご回答"
                    className="rounded-xl" {...register("subject")} />
                </Field>
                <Field label="メール種別" htmlFor={id("type")} error={errors.type?.message} required>
                  <NativeSelect id={id("type")} value={values.type}
                    onChange={handleTypeChange}
                    options={TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
                </Field>
              </div>

              <Field label="挨拶文" htmlFor={id("greeting")} error={errors.greeting?.message}
                required hint="メール冒頭の挨拶・自己紹介文">
                <Textarea id={id("greeting")} rows={4}
                  placeholder="平素よりお世話になっております。..."
                  className="rounded-xl resize-none text-sm leading-relaxed"
                  {...register("greeting")} />
              </Field>

              <Field label="本文" htmlFor={id("body")} error={errors.body?.message}
                required hint="メインメッセージ">
                <Textarea id={id("body")} rows={6}
                  placeholder="ご連絡いただいた件について、以下の通りご回答いたします。..."
                  className="rounded-xl resize-none text-sm leading-relaxed"
                  {...register("body")} />
              </Field>
            </div>
          </div>

          <Separator />

          {/* CTAボタン */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                CTAボタン
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal">任意・最大{MAX_CTA}個</span>
              </p>
              <Button type="button" variant="outline" size="sm"
                className="h-7 rounded-lg gap-1 px-2.5 text-[11px]"
                disabled={ctaButtons.length >= MAX_CTA}
                onClick={addCtaButton}>
                <Plus className="h-3 w-3" />
                追加
              </Button>
            </div>

            {ctaButtons.length === 0 && (
              <p className="text-xs text-muted-foreground">ボタンなし（追加するには「追加」を押してください）</p>
            )}

            <div className="flex flex-col gap-3">
              {ctaButtons.map((btn, i) => {
                const fg = contrastColor(btn.color);
                return (
                  <div key={btn.id}
                    className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <GripVertical className="h-3.5 w-3.5" />
                        ボタン {i + 1}
                      </div>
                      {/* Color swatches */}
                      <div className="flex items-center gap-1">
                        {CTA_COLORS.map((c) => (
                          <button key={c.value} type="button"
                            title={c.label}
                            onClick={() => updateCta(btn.id, "color", c.value)}
                            className={cn(
                              "h-5 w-5 rounded-full border-2 transition-transform",
                              btn.color === c.value
                                ? "scale-125 border-foreground"
                                : "border-transparent hover:scale-110"
                            )}
                            style={{ background: c.value }}
                          />
                        ))}
                      </div>
                      <button type="button" onClick={() => removeCta(btn.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        type="text"
                        placeholder="ボタンテキスト"
                        className="rounded-lg h-8 text-xs"
                        value={btn.label}
                        onChange={(e) => updateCta(btn.id, "label", e.target.value)}
                      />
                      <Input
                        type="url"
                        placeholder="https://..."
                        className="rounded-lg h-8 text-xs"
                        value={btn.url}
                        onChange={(e) => updateCta(btn.id, "url", e.target.value)}
                      />
                    </div>

                    {/* Button preview */}
                    {btn.label && (
                      <div className="mt-3 flex justify-center">
                        <span
                          className="inline-block rounded-[10px] px-5 py-2.5 text-xs font-bold"
                          style={{ background: btn.color, color: fg }}>
                          {btn.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* 締め文 */}
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              締めの言葉
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal">任意</span>
            </p>
            <Field label="締め文・署名" htmlFor={id("closing")} error={errors.closing?.message}
              hint="本文の後に表示される締めの言葉・署名">
              <Textarea id={id("closing")} rows={2}
                placeholder="Make It Tech　尾形友輝"
                className="rounded-xl resize-none text-sm leading-relaxed"
                {...register("closing")} />
            </Field>
          </div>

          <Separator />

          {/* 添付ファイル */}
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              添付ファイル
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal">任意</span>
            </p>

            {/* Drop zone */}
            <div
              role="button" tabIndex={0} aria-label="ファイルを追加"
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-5 transition-colors",
                isDragOver
                  ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                  : "border-border hover:border-orange-300 hover:bg-muted/40"
              )}>
              <Paperclip className="h-5 w-5 text-muted-foreground" />
              <p className="text-center text-xs text-muted-foreground">
                クリックまたはドラッグ＆ドロップでファイルを追加
              </p>
              <p className="text-center text-[10px] text-muted-foreground/70">
                画像・PDF・Word/Excel/PowerPoint・CSV など ／ 最大 {MAX_FILES} 件・1件 5MB まで
              </p>
            </div>
            <input ref={fileInputRef} type="file" multiple accept={ACCEPT_EXTS}
              className="sr-only" onChange={handleFileInputChange} />

            {/* Attachment list */}
            {attachments.length > 0 && (
              <>
                <ul className="mt-3 flex flex-col gap-2">
                  {attachments.map((att, i) => (
                    <li key={`${att.filename}-${i}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2">
                      {att.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={att.preview} alt={att.filename}
                          className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
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
                      <button type="button" onClick={() => removeAttachment(i)}
                        aria-label={`${att.filename} を削除`}
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {attachments.length} 件 / 合計 {formatBytes(attachments.reduce((s, a) => s + a.size, 0))}
                  &nbsp;·&nbsp; 受信者にはメール下部に添付通知が表示されます
                </p>
              </>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <p className="text-xs text-muted-foreground">
              {values.to ? (
                <>送信先: <span className="font-medium text-foreground">{values.to}</span></>
              ) : (
                "宛先を入力してください"
              )}
            </p>
            <Button type="submit" disabled={isSending}
              className="rounded-xl gap-2 bg-orange-500 text-white hover:bg-orange-600 sm:min-w-[140px]">
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSending ? "送信中…" : "メールを送信"}
            </Button>
          </div>
        </form>

        {/* ── Preview ── */}
        {showPreview && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">HTMLプレビュー</p>
              <Badge variant="outline" className="rounded-xl text-[10px]">リアルタイム</Badge>
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
