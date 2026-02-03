"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_FILES = 10;
const MAX_TOTAL_MB = 20;
const MAX_IMAGE_MB = 1.5;
const MAX_IMAGE_DIMENSION = 1800;

const schema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  company: z.string().min(1, "会社名・屋号を入力してください"),
  phone: z.string().optional(),
  industry: z.string().min(1, "業種を入力してください"),
  teamSize: z.string().min(1, "規模を入力してください"),
  currentProcess: z.string().min(10, "現状の業務内容を10文字以上で入力してください"),
  currentTools: z.string().min(1, "使用ツールを入力してください"),
  volume: z.string().min(1, "件数や頻度を入力してください"),
  stakeholders: z.string().min(1, "関わる人数を入力してください"),
  issues: z.string().min(20, "課題を20文字以上で入力してください"),
  goals: z.string().min(10, "理想・ゴールを10文字以上で入力してください"),
  successMetrics: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  decisionMaker: z.string().optional(),
  constraints: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Attachment = {
  file: File;
  originalSize: number;
  compressed: boolean;
};

const steps = [
  {
    id: "basic",
    title: "基本情報",
    desc: "事業の概要と担当者情報を入力してください。",
    fields: ["name", "email", "company", "phone", "industry", "teamSize"] as const,
  },
  {
    id: "current",
    title: "現状把握",
    desc: "対象業務の現状をできるだけ具体的に教えてください。",
    fields: ["currentProcess", "currentTools", "volume", "stakeholders"] as const,
  },
  {
    id: "issues",
    title: "課題と理想",
    desc: "困っている点と、実現したい状態を整理します。",
    fields: ["issues", "goals", "successMetrics"] as const,
  },
  {
    id: "constraints",
    title: "制約・補足",
    desc: "制約条件や補足情報、添付ファイルを入力します。",
    fields: ["budget", "deadline", "decisionMaker", "constraints", "notes"] as const,
  },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function DiagnosisForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [formError, setFormError] = useState("");
  const [compressing, setCompressing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      industry: "",
      teamSize: "",
      currentProcess: "",
      currentTools: "",
      volume: "",
      stakeholders: "",
      issues: "",
      goals: "",
      successMetrics: "",
      budget: "",
      deadline: "",
      decisionMaker: "",
      constraints: "",
      notes: "",
    },
    mode: "onTouched",
  });

  const step = steps[stepIndex];
  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / steps.length) * 100),
    [stepIndex]
  );

  const totalAttachmentSizeMb = useMemo(() => {
    const total = attachments.reduce((sum, item) => sum + item.file.size, 0);
    return total / (1024 * 1024);
  }, [attachments]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setFormError("");

    const incoming = Array.from(files);
    if (attachments.length + incoming.length > MAX_FILES) {
      setFormError(`添付は最大${MAX_FILES}件までです。`);
      return;
    }

    setCompressing(true);
    try {
      const processed = await Promise.all(
        incoming.map(async (file) => {
          if (!IMAGE_TYPES.includes(file.type)) {
            return { file, originalSize: file.size, compressed: false };
          }

          const compressedFile = await imageCompression(file, {
            maxSizeMB: MAX_IMAGE_MB,
            maxWidthOrHeight: MAX_IMAGE_DIMENSION,
            useWebWorker: true,
          });

          return {
            file: compressedFile,
            originalSize: file.size,
            compressed: true,
          };
        })
      );

      const nextTotal =
        attachments.reduce((sum, item) => sum + item.file.size, 0) +
        processed.reduce((sum, item) => sum + item.file.size, 0);

      if (nextTotal / (1024 * 1024) > MAX_TOTAL_MB) {
        setFormError(`添付の合計は${MAX_TOTAL_MB}MB以内にしてください。`);
        return;
      }

      setAttachments((prev) => [...prev, ...processed]);
    } catch {
      setFormError("ファイルの処理に失敗しました。");
    } finally {
      setCompressing(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const goNext = async () => {
    const fields = step.fields as readonly (keyof FormValues)[];
    const isValid = await form.trigger(fields);
    if (!isValid) return;
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (values: FormValues) => {
    setFormError("");

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });
      attachments.forEach((item) => {
        formData.append("files", item.file, item.file.name);
      });

      const response = await fetch("/api/intake", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "送信に失敗しました。");
      }

      const payload = await response.json();
      const id = payload?.id as string | undefined;
      router.push(`/intake/complete${id ? `?id=${encodeURIComponent(id)}` : ""}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "送信に失敗しました。");
    }
  };

  const { formState } = form;

  return (
    <>
      {formState.isSubmitting ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-background/95 px-6 py-5 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p className="text-sm font-medium">送信中...</p>
            <p className="text-xs text-muted-foreground">しばらくお待ちください</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-border/60 bg-background/70 p-4 shadow-sm surface-card sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-primary/80">業務診断フォーム</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
              {step.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-secondary/40 px-4 py-3 text-sm">
            <p className="text-xs text-muted-foreground">進捗</p>
            <p className="text-base font-semibold">{progress}%</p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border/50">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {steps.map((s, index) => (
            <Badge
              key={s.id}
              variant={index === stepIndex ? "default" : "secondary"}
              className={cn("rounded-xl text-xs", index === stepIndex && "bg-primary text-primary-foreground")}
            >
              {index + 1}. {s.title}
            </Badge>
          ))}
        </div>

        <Separator className="my-6" />

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          {step.id === "basic" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">お名前</Label>
                <Input id="name" {...form.register("name")} />
                <FieldError message={formState.errors.name?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" type="email" {...form.register("email")} />
                <FieldError message={formState.errors.email?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">会社名・屋号</Label>
                <Input id="company" {...form.register("company")} />
                <FieldError message={formState.errors.company?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">電話番号（任意）</Label>
                <Input id="phone" type="tel" {...form.register("phone")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="industry">業種</Label>
                <Input id="industry" {...form.register("industry")} />
                <FieldError message={formState.errors.industry?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teamSize">従業員規模</Label>
                <Input id="teamSize" placeholder="例: 1〜5名 / 6〜20名" {...form.register("teamSize")} />
                <FieldError message={formState.errors.teamSize?.message} />
              </div>
            </div>
          ) : null}

          {step.id === "current" ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentProcess">対象業務の内容</Label>
                <Textarea id="currentProcess" rows={4} {...form.register("currentProcess")} />
                <FieldError message={formState.errors.currentProcess?.message} />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="currentTools">現在使っているツール</Label>
                  <Input id="currentTools" placeholder="例: LINE / Googleスプレッドシート" {...form.register("currentTools")} />
                  <FieldError message={formState.errors.currentTools?.message} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="volume">件数・頻度</Label>
                  <Input id="volume" placeholder="例: 1日30件 / 週100件" {...form.register("volume")} />
                  <FieldError message={formState.errors.volume?.message} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stakeholders">関わる人数・担当</Label>
                <Input id="stakeholders" placeholder="例: 店長1名 + スタッフ2名" {...form.register("stakeholders")} />
                <FieldError message={formState.errors.stakeholders?.message} />
              </div>
            </div>
          ) : null}

          {step.id === "issues" ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issues">困っていること</Label>
                <Textarea id="issues" rows={5} {...form.register("issues")} />
                <FieldError message={formState.errors.issues?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goals">理想の状態</Label>
                <Textarea id="goals" rows={4} {...form.register("goals")} />
                <FieldError message={formState.errors.goals?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="successMetrics">成功と判断する指標（任意）</Label>
                <Input id="successMetrics" placeholder="例: 対応時間を30%削減" {...form.register("successMetrics")} />
              </div>
            </div>
          ) : null}

          {step.id === "constraints" ? (
            <div className="grid gap-4">
              <div className="grid gap-2 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="budget">予算感（任意）</Label>
                  <Input id="budget" placeholder="例: 30万円〜" {...form.register("budget")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deadline">希望納期（任意）</Label>
                  <Input id="deadline" placeholder="例: 3ヶ月以内" {...form.register("deadline")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="decisionMaker">決裁者（任意）</Label>
                  <Input id="decisionMaker" placeholder="例: 代表 / 店長" {...form.register("decisionMaker")} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="constraints">制約・注意点（任意）</Label>
                <Textarea id="constraints" rows={3} {...form.register("constraints")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">補足事項（任意）</Label>
                <Textarea id="notes" rows={3} {...form.register("notes")} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="attachments">資料・画像添付（任意）</Label>
                <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  <p>画像は自動で軽量化されます。添付条件は後で調整可能です。</p>
                  <p className="mt-1 text-xs">最大 {MAX_FILES} 件 / 合計 {MAX_TOTAL_MB}MB（暫定）</p>
                </div>
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                />
                {compressing ? (
                  <p className="text-xs text-muted-foreground">画像を軽量化しています...</p>
                ) : null}
              </div>

              {attachments.length > 0 ? (
                <div className="grid gap-2 rounded-2xl border border-border/60 bg-background/70 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>添付ファイル {attachments.length} 件</span>
                    <span>合計 {totalAttachmentSizeMb.toFixed(1)}MB</span>
                  </div>
                  <ul className="grid gap-2">
                    {attachments.map((item, index) => (
                      <li
                        key={`${item.file.name}-${index}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.file.name}</p>
                          <p className="text-muted-foreground">
                            {Math.round(item.file.size / 1024)} KB
                            {item.compressed ? " (圧縮済み)" : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => removeAttachment(index)}
                        >
                          削除
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>所要時間目安: 15分以内</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stepIndex > 0 ? (
                <Button type="button" variant="outline" className="rounded-xl" onClick={goBack}>
                  戻る
                </Button>
              ) : null}
              {stepIndex < steps.length - 1 ? (
                <Button type="button" className="rounded-xl" onClick={goNext}>
                  次へ
                </Button>
              ) : (
                <Button type="submit" className="rounded-xl" disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? "送信中..." : "送信する"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
