"use client";

import * as React from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import {
  contactBudgets,
  contactCategories,
  contactDeadlines,
  contactPhoneTimes,
} from "@/content/forms/contact";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ArrowRight, Check, ChevronDown, Copy, Mail } from "lucide-react";

const DRAFT_STORAGE_KEY = "mit_contact_draft";
const DRAFT_PREF_KEY = "mit_contact_draft_pref";
const DEFAULT_TTL_HOURS = 12;

type DraftPreference = {
  ttlHours: number;
};

const draftOptions = [
  { label: "保存しない", value: 0 },
  { label: "1時間", value: 1 },
  { label: "6時間", value: 6 },
  { label: "12時間", value: 12 },
  { label: "24時間", value: 24 },
];

const schema = z
  .object({
    name: z
      .string()
      .min(1, "お名前を入力してください")
      .max(80, "お名前は80文字以内で入力してください"),
    email: z
      .string()
      .email("メールアドレスの形式が正しくありません")
      .max(200, "メールアドレスは200文字以内で入力してください"),
    company: z.string().max(120, "会社名・屋号は120文字以内で入力してください").optional(),

    // ✅ enumオプションを使わず、文字列＋含有チェックに変更
    category: z
      .string()
      .min(1, "カテゴリを選択してください")
      .refine((v) => (contactCategories as readonly string[]).includes(v), "カテゴリを選択してください"),

    budget: z.string().optional(),
    deadline: z.string().optional(),
    phone: z
      .string()
      .optional()
      .refine(
        (value) => !value || /^[0-9+()\-\s]{8,20}$/.test(value),
        "電話番号の形式が正しくありません"
      ),
    phoneTime: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value || (contactPhoneTimes as readonly string[]).includes(value),
        "都合の良い時間帯を選択してください"
      ),

    message: z
      .string()
      .min(20, "相談内容は20文字以上で入力してください")
      .max(2000, "相談内容は2000文字以内で入力してください"),

    // ✅ literal(true) + errorMap をやめ、boolean refineに変更
    consent: z.boolean().refine((v) => v === true, "プライバシーポリシーへの同意が必要です"),
    website: z.string().optional(),
    startedAt: z.number().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.phone?.trim() && !data.phoneTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneTime"],
        message: "都合の良い時間帯を選択してください",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function SelectLike({
  label,
  value,
  items,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value?: string;
  items: readonly string[];
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="grid gap-0.5 sm:gap-2">
      <Label>{label}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 text-left text-sm backdrop-blur sm:h-11",
              "hover:bg-primary/5 transition",
              error && "border-destructive"
            )}
          >
            <span className={cn(!value && "text-muted-foreground")}>
              {value ?? placeholder ?? "選択してください"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[--radix-dropdown-menu-trigger-width] rounded-xl"
        >
          {items.map((it) => (
            <DropdownMenuItem
              key={it}
              onClick={() => onChange(it)}
              className="cursor-pointer"
            >
              {it}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <FieldError message={error} />
    </div>
  );
}

export function ContactForm() {
  const startedAtRef = React.useRef(Date.now());
  const saveTimeoutRef = React.useRef<number | null>(null);
  const [draftTtlHours, setDraftTtlHours] = React.useState(DEFAULT_TTL_HOURS);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [draftReady, setDraftReady] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      category: "",
      budget: "未定",
      deadline: "未定",
      phone: "",
      phoneTime: "",
      message: "",
      consent: true, // 実運用は false 推奨（任意）
      website: "",
      startedAt: startedAtRef.current,
    },
    mode: "onTouched",
  });

  React.useEffect(() => {
    form.setValue("startedAt", startedAtRef.current, { shouldValidate: false });
  }, [form]);

  // ⚠ eslint警告の元。機能的にはOKだが、気になるなら useWatch に変えられる（後述）
  const values = form.watch();
  const hasPhone = Boolean(values.phone?.trim());

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const storedPref = window.localStorage.getItem(DRAFT_PREF_KEY);
    if (storedPref) {
      try {
        const parsed = JSON.parse(storedPref) as DraftPreference;
        if (typeof parsed.ttlHours === "number") {
          setDraftTtlHours(parsed.ttlHours);
        }
      } catch {
        // ignore invalid pref
      }
    }

    const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          savedAt: number;
          ttlHours: number;
          values: Partial<FormValues>;
        };
        const ttlHours = Number.isFinite(parsed.ttlHours)
          ? parsed.ttlHours
          : DEFAULT_TTL_HOURS;
        const expiresAt = parsed.savedAt + ttlHours * 60 * 60 * 1000;
        if (ttlHours > 0 && expiresAt > Date.now()) {
          form.reset({
            ...form.getValues(),
            ...parsed.values,
            startedAt: Date.now(),
          });
        } else {
          window.localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }

    setDraftReady(true);
  }, [form]);

  React.useEffect(() => {
    if (!draftReady) return;
    if (typeof window === "undefined") return;

    if (draftTtlHours <= 0) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    if (!form.formState.isDirty) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      const { startedAt: _startedAt, ...rest } = form.getValues();
      const payload = {
        savedAt: Date.now(),
        ttlHours: draftTtlHours,
        values: rest,
      };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    }, 600);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [draftReady, draftTtlHours, form, values, form.formState.isDirty]);

  React.useEffect(() => {
    if (!hasPhone && values.phoneTime) {
      form.setValue("phoneTime", "", { shouldValidate: false });
    }
  }, [form, hasPhone, values.phoneTime]);

  const template = React.useMemo(() => {
    return [
      "【相談カテゴリ】",
      values.category || "（未選択）",
      "",
      "【現状】",
      "例：問い合わせが電話/LINE/紙で分散している",
      "",
      "【理想】",
      "例：フォームに統一して、一覧で管理したい",
      "",
      "【制約（任意）】",
      `予算：${values.budget ?? "未定"}`,
      `希望納期：${values.deadline ?? "未定"}`,
    ].join("\n");
  }, [values.category, values.budget, values.deadline]);

  async function onSubmit(data: FormValues) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "送信に失敗しました。");
      }

      toast.success("送信しました", {
        description: "内容を確認して折り返しご連絡します。",
      });

      form.reset({
        ...data,
        name: "",
        email: "",
        company: "",
        phone: "",
        phoneTime: "",
        message: "",
        consent: true,
        website: "",
        startedAt: Date.now(),
      });

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (error) {
      console.error(error);
      toast.error("送信に失敗しました", {
        description: "時間をおいて再度お試しください。",
      });
    }
  }

  function copyTemplate() {
    navigator.clipboard.writeText(template);
    toast.message("テンプレをコピーしました", {
      description: "そのまま相談内容に貼り付けて使えます。",
    });
  }

  const updateDraftPref = (ttlHours: number) => {
    setDraftTtlHours(ttlHours);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DRAFT_PREF_KEY, JSON.stringify({ ttlHours }));
      if (ttlHours <= 0) {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    form.reset({
      ...form.getValues(),
      name: "",
      email: "",
      company: "",
      category: "",
      budget: "未定",
      deadline: "未定",
      phone: "",
      phoneTime: "",
      message: "",
      consent: true,
      website: "",
      startedAt: Date.now(),
    });
  };

  const { formState } = form;

  return (
    <>
      {formState.isSubmitting ? (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-background/95 px-6 py-5 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p className="text-sm font-medium">送信中...</p>
            <p className="text-xs text-muted-foreground">しばらくお待ちください</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 text-card-foreground shadow-sm surface-card sm:gap-4 sm:p-5 md:gap-6 md:rounded-3xl md:border md:bg-card md:p-6">
      <div className="grid gap-1.5 md:gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg">お問い合わせ</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
            onClick={() => setSettingsOpen(true)}
          >
            入力保存の設定
          </Button>
        </div>
      </div>

      {settingsOpen ? (
        <div className="fixed inset-0 z-70 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            aria-label="閉じる"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-border/70 bg-background/95 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">入力内容の一時保存</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  端末内に一時保存して、途中から再開できます。保存時間を変更したり無効化できます。
                </p>
              </div>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSettingsOpen(false)}
              >
                閉じる
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {draftOptions.map((option) => {
                const active = draftTtlHours === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3 text-sm transition",
                      active
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                    )}
                    onClick={() => updateDraftPref(option.value)}
                  >
                    <span>{option.label}</span>
                    {active ? <span className="text-xs text-primary">選択中</span> : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                現在の保存期間: {draftTtlHours === 0 ? "保存しない" : `${draftTtlHours}時間`}
              </p>
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={clearDraft}>
                下書きを削除
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:gap-4 md:gap-6">
        <div className="hidden rounded-2xl border border-primary/20 bg-secondary/40 p-3 sm:p-4 md:block">
          <p className="text-sm font-medium">早く見積もるコツ</p>
          <ul className="mt-2 grid gap-1.5 text-xs text-muted-foreground sm:gap-2 sm:text-sm">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              <span>「現状･理想･制約(予算/納期)」の3点だけでOK</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              <span>
                既存ツールで解決できるなら“作らない”提案もします
              </span>
            </li>
          </ul>
        </div>

        <div className="md:hidden">
          <MobileDisclosure summary="早く見積もるコツ">
            <ul className="grid gap-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                <span>「現状･理想･制約(予算/納期)」の3点だけでOK</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                <span>既存ツールで解決できるなら“作らない”提案もします</span>
              </li>
            </ul>
          </MobileDisclosure>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 sm:gap-5">
          <div
            className="absolute -left-2500 top-auto h-px w-px overflow-hidden"
            aria-hidden="true"
          >
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              autoComplete="off"
              tabIndex={-1}
              {...form.register("website")}
            />
          </div>
          <input type="hidden" {...form.register("startedAt", { valueAsNumber: true })} />

          <div className="grid gap-1 sm:gap-2">
            <Label htmlFor="name">お名前</Label>
            <Input
              id="name"
              className="rounded-xl text-sm sm:text-base"
              {...form.register("name")}
            />
            <FieldError message={formState.errors.name?.message} />
          </div>

          <div className="grid gap-1 sm:gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              className="rounded-xl text-sm sm:text-base"
              {...form.register("email")}
            />
            <FieldError message={formState.errors.email?.message} />
          </div>

          <div className="grid gap-1 sm:gap-2">
            <Label htmlFor="phone">電話番号(任意)</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="rounded-xl text-sm sm:text-base"
              placeholder="例: 090-1234-5678"
              {...form.register("phone")}
            />
            <FieldError message={formState.errors.phone?.message} />
          </div>

          {hasPhone && (
            <SelectLike
              label="都合の良い時間帯"
              value={values.phoneTime}
              items={contactPhoneTimes}
              onChange={(v) =>
                form.setValue("phoneTime", v, { shouldValidate: true })
              }
              placeholder="例:午前/午後/夕方"
              error={formState.errors.phoneTime?.message}
            />
          )}

          <div className="grid gap-1 sm:gap-2">
            <Label htmlFor="company">会社名･屋号(任意)</Label>
            <Input
              id="company"
              className="rounded-xl text-sm sm:text-base"
              {...form.register("company")}
            />
          </div>

          <SelectLike
            label="相談カテゴリ"
            value={values.category}
            items={contactCategories}
            onChange={(v) => form.setValue("category", v, { shouldValidate: true })}
            placeholder="例：Web制作 / 業務改善 / 自動化…"
            error={formState.errors.category?.message}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectLike
              label="予算感(任意)"
              value={values.budget}
              items={contactBudgets}
              onChange={(v) => form.setValue("budget", v, { shouldValidate: true })}
            />
            <SelectLike
              label="希望納期(任意)"
              value={values.deadline}
              items={contactDeadlines}
              onChange={(v) =>
                form.setValue("deadline", v, { shouldValidate: true })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">相談内容</Label>
            <Textarea
              id="message"
              rows={5}
              className="min-h-30 rounded-xl resize-y text-sm sm:min-h-45 sm:text-base"
              placeholder="入力欄（例：予約がLINEと電話で分散。店舗サイトも合わせて整えたい…）"
              {...form.register("message")}
            />
            <FieldError message={formState.errors.message?.message} />
          </div>

          <div className="hidden rounded-2xl border border-border/70 bg-background/70 p-4 md:block">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">相談テンプレ（コピペ用）</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  迷ったらこれをコピーして、相談内容に貼り付けてください。
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={copyTemplate}
              >
                <Copy className="mr-2 h-4 w-4" />
                コピー
              </Button>
            </div>

            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-secondary/30 p-3 text-xs text-muted-foreground">
            {template}
            </pre>
          </div>

          <div className="md:hidden">
            <MobileDisclosure summary="相談テンプレ（コピペ用）">
              <div className="grid gap-3">
                <p className="text-xs text-muted-foreground">
                  迷ったらこれをコピーして、相談内容に貼り付けてください。
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl w-full"
                  onClick={copyTemplate}
                >
                  <Copy className="mr-1 sm:mr-2 h-4 w-4" />
                  コピー
                </Button>
                <pre className="whitespace-pre-wrap rounded-xl bg-secondary/30 p-3 text-xs text-muted-foreground">
                {template}
                </pre>
              </div>
            </MobileDisclosure>
          </div>

          <Separator className="my-1 sm:my-0" />

          <div className="grid gap-2">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                {...form.register("consent")}
              />
              <span className="text-muted-foreground">
                <Link href="/privacy" className="text-foreground hover:underline">
                  プライバシーポリシー
                </Link>
                に同意します
              </span>
            </label>
            <FieldError message={formState.errors.consent?.message} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-xl" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "送信中..." : "送信する"} <ArrowRight className="sm:ml-2 h-4 w-4" />
            </Button>

            <LineButton href="/survey">LINEで相談</LineButton>
          </div>

          <p className="text-xs text-muted-foreground">
            ※ 送信後、内容を確認して折り返しご連絡します。
          </p>
        </form>
      </div>
      </div>
    </>
  );
}
