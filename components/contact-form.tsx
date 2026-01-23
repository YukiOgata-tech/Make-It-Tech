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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ArrowRight, Check, ChevronDown, Copy, Mail } from "lucide-react";

const categories = [
  "Web制作（LP/店舗サイト/採用など）",
  "業務改善（フロー整理/属人化解消）",
  "ツール導入（LINE/フォーム/管理シート）",
  "自動化（通知/集計/連携）",
  "その他/相談して決めたい",
] as const;

const budgets = [
  "未定",
  "〜5万円",
  "5〜10万円",
  "10〜30万円",
  "30〜80万円",
  "80万円〜",
] as const;

const deadlines = [
  "未定",
  "できれば1〜2週間",
  "できれば1ヶ月以内",
  "できれば2〜3ヶ月以内",
  "中長期（相談）",
] as const;

const schema = z.object({
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
    .refine((v) => (categories as readonly string[]).includes(v), "カテゴリを選択してください"),

  budget: z.string().optional(),
  deadline: z.string().optional(),

  message: z
    .string()
    .min(20, "相談内容は20文字以上で入力してください")
    .max(2000, "相談内容は2000文字以内で入力してください"),

  // ✅ literal(true) + errorMap をやめ、boolean refineに変更
  consent: z.boolean().refine((v) => v === true, "プライバシーポリシーへの同意が必要です"),
  website: z.string().optional(),
  startedAt: z.coerce.number().min(1),
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
    <div className="grid gap-2">
      <Label>{label}</Label>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 text-left text-sm backdrop-blur",
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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      category: "",
      budget: "未定",
      deadline: "未定",
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
        message: "",
        consent: true,
        website: "",
        startedAt: Date.now(),
      });
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

  const { formState } = form;

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="text-lg">お問い合わせ</CardTitle>
        <p className="text-sm text-muted-foreground">
          要件が固まっていなくてもOKです。現状と理想を一緒に整理します。
        </p>
      </CardHeader>

      <CardContent className="grid gap-6">
        <div className="rounded-2xl border border-primary/20 bg-secondary/40 p-4">
          <p className="text-sm font-medium">早く見積もるコツ</p>
          <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              <span>「現状」「理想」「制約（予算/納期）」の3点だけでOK</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary" />
              <span>
                既存ツールで解決できるなら“作らない”提案もします
              </span>
            </li>
          </ul>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
          <div
            className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
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

          <div className="grid gap-2">
            <Label htmlFor="name">お名前</Label>
            <Input id="name" className="rounded-xl" {...form.register("name")} />
            <FieldError message={formState.errors.name?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              className="rounded-xl"
              {...form.register("email")}
            />
            <FieldError message={formState.errors.email?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company">会社名・屋号（任意）</Label>
            <Input
              id="company"
              className="rounded-xl"
              {...form.register("company")}
            />
          </div>

          <SelectLike
            label="相談カテゴリ"
            value={values.category}
            items={categories}
            onChange={(v) => form.setValue("category", v, { shouldValidate: true })}
            placeholder="例：Web制作 / 業務改善 / 自動化…"
            error={formState.errors.category?.message}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectLike
              label="予算感（任意）"
              value={values.budget}
              items={budgets}
              onChange={(v) => form.setValue("budget", v, { shouldValidate: true })}
            />
            <SelectLike
              label="希望納期（任意）"
              value={values.deadline}
              items={deadlines}
              onChange={(v) =>
                form.setValue("deadline", v, { shouldValidate: true })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">相談内容</Label>
            <Textarea
              id="message"
              rows={7}
              className="rounded-xl min-h-[180px] resize-y"
              placeholder="例：予約がLINEと電話で分散。フォームに統一して一覧管理したい。店舗サイトも合わせて整えたい…"
              {...form.register("message")}
            />
            <FieldError message={formState.errors.message?.message} />
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
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

          <Separator />

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
              {formState.isSubmitting ? "送信中..." : "送信する"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/survey">事前アンケート</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            ※ 送信後、内容を確認して折り返しご連絡します。
          </p>
        </form>

          <div className="rounded-2xl bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <p className="text-sm font-medium">返信目安</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {site.contact?.responseHours ?? "平日 10:00 - 19:00"}
            </p>
          </div>
      </CardContent>
    </Card>
  );
}
