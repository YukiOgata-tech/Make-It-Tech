"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const MEETING_OPTIONS = [
  { value: "online",    label: "Zoom",   fullLabel: "オンライン（Zoom）", desc: "場所を問わず" },
  { value: "in-person", label: "対面",   fullLabel: "対面（訪問）",       desc: "県内・交通費別" },
  { value: "either",    label: "どちらでも", fullLabel: "どちらでも可",   desc: "ご提案に従う" },
] as const;

type MeetingType = (typeof MEETING_OPTIONS)[number]["value"];

const schema = z.object({
  name:        z.string().min(1, "入力してください").max(80),
  email:       z.string().email("形式が正しくありません").max(200),
  company:     z.string().max(120).optional(),
  phone:       z.string().optional().refine(
                 (v) => !v || /^[0-9+()\-\s]{8,20}$/.test(v),
                 "形式が正しくありません"
               ),
  meetingType: z.enum(["online", "in-person", "either"], {
                 error: "選択してください",
               }),
  message:     z.string().min(10, "10文字以上で入力してください").max(2000),
  consent:     z.boolean().refine((v) => v === true, "同意が必要です"),
  website:     z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({
  label, htmlFor, required, error, hint, children,
}: {
  label: string; htmlFor: string; required?: boolean;
  error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={htmlFor} className="text-xs font-medium sm:text-sm">
        {label}
        {required && <span className="ml-1 text-[10px] font-semibold text-primary">必須</span>}
        {hint && !required && <span className="ml-1 text-[10px] text-muted-foreground">任意</span>}
      </Label>
      {children}
      {error && <p className="text-[10px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NiigataContactForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [done, setDone]                 = React.useState(false);
  const startedAt                       = React.useRef(Date.now());

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        name: "", email: "", company: "", phone: "",
        meetingType: undefined, message: "", consent: false, website: "",
      },
    });

  const selectedMeeting = watch("meetingType");

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res  = await fetch("/api/niigata-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, startedAt: startedAt.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "送信に失敗しました。時間をおいて再試行してください。");
        return;
      }
      setDone(true);
    } catch {
      toast.error("ネットワークエラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-8 text-center sm:rounded-3xl sm:px-6 sm:py-10">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
          <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <h3 className="text-base font-semibold sm:text-lg">送信が完了しました</h3>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          お問い合わせありがとうございます。内容確認のうえ、担当よりご連絡いたします。
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          平日 10:00〜19:00 の間にご返信します。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3 sm:gap-4">
      {/* honeypot */}
      <input type="text" tabIndex={-1} aria-hidden="true" className="sr-only" {...register("website")} />

      {/* 名前 + メール: 常に2列 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Field label="お名前" htmlFor="niigata-name" required error={errors.name?.message}>
          <Input id="niigata-name" type="text" placeholder="田中 太郎"
            autoComplete="name"
            className="h-8 rounded-lg px-2.5 text-xs sm:h-9 sm:rounded-xl sm:px-3 sm:text-sm"
            {...register("name")} />
        </Field>
        <Field label="メールアドレス" htmlFor="niigata-email" required error={errors.email?.message}>
          <Input id="niigata-email" type="email" placeholder="example@email.com"
            autoComplete="email"
            className="h-8 rounded-lg px-2.5 text-xs sm:h-9 sm:rounded-xl sm:px-3 sm:text-sm"
            {...register("email")} />
        </Field>
      </div>

      {/* 会社 + 電話: 常に2列 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Field label="会社名・屋号" htmlFor="niigata-company" hint=" " error={errors.company?.message}>
          <Input id="niigata-company" type="text" placeholder="株式会社〇〇"
            autoComplete="organization"
            className="h-8 rounded-lg px-2.5 text-xs sm:h-9 sm:rounded-xl sm:px-3 sm:text-sm"
            {...register("company")} />
        </Field>
        <Field label="電話番号" htmlFor="niigata-phone" hint=" " error={errors.phone?.message}>
          <Input id="niigata-phone" type="tel" placeholder="090-0000-0000"
            autoComplete="tel"
            className="h-8 rounded-lg px-2.5 text-xs sm:h-9 sm:rounded-xl sm:px-3 sm:text-sm"
            {...register("phone")} />
        </Field>
      </div>

      {/* 相談方法: 常に3列 */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium sm:text-sm">
          希望する相談方法
          <span className="ml-1 text-[10px] font-semibold text-primary">必須</span>
        </p>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {MEETING_OPTIONS.map((opt) => {
            const selected = selectedMeeting === opt.value;
            return (
              <button key={opt.value} type="button"
                onClick={() => setValue("meetingType", opt.value as MeetingType, { shouldValidate: true })}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg border px-2.5 py-2 text-left transition-colors sm:rounded-xl sm:px-3 sm:py-2.5",
                  selected
                    ? "border-primary/50 bg-primary/8 dark:bg-primary/10"
                    : "border-border bg-background hover:bg-muted/30"
                )}>
                <span className={cn(
                  "text-[11px] font-semibold leading-tight sm:text-xs",
                  selected ? "text-primary" : "text-foreground"
                )}>
                  {/* モバイルは短縮ラベル、sm以上はフルラベル */}
                  <span className="sm:hidden">{opt.label}</span>
                  <span className="hidden sm:inline">{opt.fullLabel}</span>
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
        {errors.meetingType && (
          <p className="text-[10px] font-medium text-destructive">{errors.meetingType.message}</p>
        )}
      </div>

      {/* 相談内容 */}
      <Field label="ご相談内容" htmlFor="niigata-message" required error={errors.message?.message}>
        <Textarea id="niigata-message" rows={4}
          placeholder="例：ホームページを作りたいのですが…"
          className="rounded-lg text-xs leading-relaxed resize-none sm:rounded-xl sm:text-sm sm:rows-5"
          {...register("message")} />
        <p className="text-[10px] text-muted-foreground">10文字以上・2000文字以内</p>
      </Field>

      {/* 同意 + 送信 */}
      <div className="flex flex-col gap-2.5">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input type="checkbox"
            className={cn(
              "mt-0.5 h-3.5 w-3.5 flex-shrink-0 rounded accent-primary sm:h-4 sm:w-4",
              errors.consent && "outline outline-destructive"
            )}
            {...register("consent")} />
          <span className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            <a href="/privacy" target="_blank" rel="noopener noreferrer"
               className="font-medium text-foreground underline underline-offset-2 hover:text-primary">
              プライバシーポリシー
            </a>
            に同意のうえ送信します
          </span>
        </label>
        {errors.consent && (
          <p className="text-[10px] font-medium text-destructive pl-6">{errors.consent.message}</p>
        )}

        <Button type="submit" disabled={isSubmitting}
          className="w-full gap-2 rounded-xl sm:w-auto sm:self-end sm:min-w-[140px]">
          {isSubmitting
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <ArrowRight className="h-3.5 w-3.5" />}
          {isSubmitting ? "送信中…" : "送信する"}
        </Button>
      </div>
    </form>
  );
}
