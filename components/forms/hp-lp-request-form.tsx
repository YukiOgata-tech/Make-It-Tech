"use client";

import * as React from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const requestTypes = ["ホームページ", "LP", "どちらが合うか相談したい"] as const;
const formTypes = ["おまかせで相談する", "希望を詳しく伝える"] as const;
const contactMethods = ["電話", "メール", "LINE", "問い合わせフォーム", "予約サイト"] as const;
const supportOptions = ["希望する", "相談したい", "不要"] as const;

const schema = z.object({
  formType: z.enum(formTypes),
  company: z.string().min(1, "会社名・屋号を入力してください").max(120),
  name: z.string().min(1, "担当者名を入力してください").max(80),
  email: z.string().email("メールアドレスの形式が正しくありません").max(200),
  phone: z.string().max(30).optional(),
  business: z.string().min(10, "事業内容は10文字以上で入力してください").max(2500),
  customers: z.string().min(1, "主な対象・お客様を入力してください").max(1500),
  requestType: z.enum(requestTypes),
  mainGoal: z.string().min(1, "サイトで実現したいことを入力してください").max(1500),
  services: z.string().min(1, "掲載したいサービス・商品を入力してください").max(2500),
  mustHave: z.string().min(1, "必ず掲載したい情報を入力してください").max(2500),
  strengths: z.string().min(1, "伝えたい強みや大切にしていることを入力してください").max(2000),
  faq: z.string().max(2000).optional(),
  links: z.string().max(2000).optional(),
  assets: z.string().min(1, "ロゴ・写真・資料の有無を入力してください").max(1000),
  contactMethods: z.array(z.string()).min(1, "問い合わせ先を1つ以上選択してください"),
  afterUpdates: z.string().max(1500).optional(),
  notes: z.string().max(2000).optional(),
  desiredPages: z.string().max(2000).optional(),
  designNotes: z.string().max(2000).optional(),
  deadline: z.string().max(500).optional(),
  support: z.enum(supportOptions),
  consent: z.boolean().refine((value) => value === true, "同意が必要です"),
  website: z.string().optional(),
  startedAt: z.number().min(1),
});

type FormValues = z.infer<typeof schema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function NativeSelect({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-border/70 bg-background/70 px-3 pr-10 text-sm outline-none transition focus:border-primary",
            error && "border-destructive"
          )}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function HpLpRequestForm() {
  const startedAtRef = React.useRef(Date.now());
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      formType: "おまかせで相談する",
      company: "",
      name: "",
      email: "",
      phone: "",
      business: "",
      customers: "",
      requestType: "どちらが合うか相談したい",
      mainGoal: "",
      services: "",
      mustHave: "",
      strengths: "",
      faq: "",
      links: "",
      assets: "",
      contactMethods: ["メール"],
      afterUpdates: "",
      notes: "",
      desiredPages: "",
      designNotes: "",
      deadline: "",
      support: "相談したい",
      consent: true,
      website: "",
      startedAt: startedAtRef.current,
    },
    mode: "onTouched",
  });

  const values = form.watch();
  const isFull = values.formType === "希望を詳しく伝える";

  React.useEffect(() => {
    form.setValue("startedAt", startedAtRef.current, { shouldValidate: false });
  }, [form]);

  function toggleContactMethod(method: string) {
    const current = new Set(form.getValues("contactMethods"));
    if (current.has(method)) {
      current.delete(method);
    } else {
      current.add(method);
    }
    form.setValue("contactMethods", Array.from(current), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(data: FormValues) {
    try {
      const response = await fetch("/api/hp-lp-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        ...form.getValues(),
        company: "",
        name: "",
        email: "",
        phone: "",
        business: "",
        customers: "",
        mainGoal: "",
        services: "",
        mustHave: "",
        strengths: "",
        faq: "",
        links: "",
        assets: "",
        afterUpdates: "",
        notes: "",
        desiredPages: "",
        designNotes: "",
        deadline: "",
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

  const { errors, isSubmitting } = form.formState;

  return (
    <>
      {isSubmitting ? (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-background/95 px-6 py-5 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p className="text-sm font-medium">送信中...</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm surface-card sm:p-6 lg:p-8">
        <div className="grid gap-3 border-b border-border/60 pb-5">
          <p className="text-sm font-semibold text-primary">無料試作のご相談</p>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            まずは事業内容と掲載したい内容を教えてください
          </h2>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <p className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              試作を見てから判断
            </p>
            <p className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              採用しなければ原則費用なし
            </p>
            <p className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              追加機能は別途お見積り
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-5">
          <div className="absolute -left-2500 top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <Label htmlFor="website">Website</Label>
            <Input id="website" autoComplete="off" tabIndex={-1} {...form.register("website")} />
          </div>
          <input type="hidden" {...form.register("startedAt", { valueAsNumber: true })} />

          <div className="grid gap-4 md:grid-cols-2">
            <NativeSelect
              label="相談方法"
              value={values.formType}
              options={formTypes}
              onChange={(value) => form.setValue("formType", value as FormValues["formType"])}
            />
            <NativeSelect
              label="制作したいもの"
              value={values.requestType}
              options={requestTypes}
              onChange={(value) => form.setValue("requestType", value as FormValues["requestType"])}
              error={errors.requestType?.message}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="company">会社名・屋号</Label>
              <Input id="company" {...form.register("company")} />
              <FieldError message={errors.company?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="name">担当者名</Label>
              <Input id="name" {...form.register("name")} />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" {...form.register("email")} />
              <FieldError message={errors.email?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">電話番号（任意）</Label>
              <Input id="phone" type="tel" {...form.register("phone")} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="business">業種・事業内容</Label>
              <Textarea id="business" rows={4} placeholder="例：新潟市で美容室を運営しています。カット、カラー、ヘッドスパを提供しています。" {...form.register("business")} />
              <FieldError message={errors.business?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="customers">主な対象・お客様</Label>
              <Textarea id="customers" rows={3} placeholder="例：30〜50代女性、近隣に住む方、落ち着いた雰囲気を求める方。" {...form.register("customers")} />
              <FieldError message={errors.customers?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mainGoal">サイトで実現したいこと</Label>
              <Textarea id="mainGoal" rows={3} placeholder="例：新規予約を増やしたい。初めて見る方にも安心感を伝えたい。" {...form.register("mainGoal")} />
              <FieldError message={errors.mainGoal?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="services">掲載したいサービス・商品</Label>
              <Textarea id="services" rows={4} placeholder="メニュー、料金、特徴などを分かる範囲で入力してください。" {...form.register("services")} />
              <FieldError message={errors.services?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mustHave">必ず掲載したい情報</Label>
              <Textarea id="mustHave" rows={4} placeholder="営業時間、住所、料金、実績、代表挨拶、FAQなど。" {...form.register("mustHave")} />
              <FieldError message={errors.mustHave?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="strengths">伝えたい強み・大切にしていること</Label>
              <Textarea id="strengths" rows={3} placeholder="人柄、品質、価格、地域密着、実績、スピードなど。" {...form.register("strengths")} />
              <FieldError message={errors.strengths?.message} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="faq">お客様からよく聞かれること（任意）</Label>
              <Textarea id="faq" rows={3} {...form.register("faq")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="links">既存サイト・SNS・予約ページなど（任意）</Label>
              <Textarea id="links" rows={3} placeholder="Instagram、LINE、Googleマップ、予約サイトなどのURLがあれば入力してください。" {...form.register("links")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="assets">ロゴ・写真・資料の有無</Label>
              <Textarea id="assets" rows={3} placeholder="例：ロゴあり、店内写真あり、紙のメニュー表あり。" {...form.register("assets")} />
              <FieldError message={errors.assets?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="afterUpdates">公開後に更新したい内容（任意）</Label>
              <Textarea id="afterUpdates" rows={3} placeholder="お知らせ、写真、料金、ブログなど。" {...form.register("afterUpdates")} />
            </div>
          </div>

          {isFull ? (
            <div className="grid gap-4 rounded-2xl border border-border/70 bg-background/60 p-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="desiredPages">希望するページ・構成</Label>
                <Textarea id="desiredPages" rows={3} placeholder="トップ、サービス、料金、実績、会社概要、お問い合わせなど。" {...form.register("desiredPages")} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="designNotes">デザイン・色・参考サイトの希望</Label>
                <Textarea id="designNotes" rows={3} placeholder="参考サイトURL、好きな雰囲気、避けたい印象など。" {...form.register("designNotes")} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="deadline">希望公開時期</Label>
                <Input id="deadline" placeholder="例：6月末まで、急ぎではない" {...form.register("deadline")} />
              </div>
              <NativeSelect
                label="公開後のサポート"
                value={values.support}
                options={supportOptions}
                onChange={(value) => form.setValue("support", value as FormValues["support"])}
              />
            </div>
          ) : (
            <NativeSelect
              label="公開後のサポート"
              value={values.support}
              options={supportOptions}
              onChange={(value) => form.setValue("support", value as FormValues["support"])}
            />
          )}

          <div className="grid gap-2">
            <Label>サイトに掲載したい連絡方法</Label>
            <div className="flex flex-wrap gap-2">
              {contactMethods.map((method) => {
                const active = values.contactMethods.includes(method);
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleContactMethod(method)}
                    className={cn(
                      "rounded-xl border border-border/70 px-3 py-2 text-sm transition",
                      active ? "border-border bg-muted text-foreground" : "bg-background/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.contactMethods?.message} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="notes">その他、ご要望・補足（任意）</Label>
            <Textarea id="notes" rows={3} placeholder="不安点、避けたい内容、補足など。" {...form.register("notes")} />
          </div>

          <Separator />

          <div className="grid gap-2">
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" {...form.register("consent")} />
              <span className="text-muted-foreground">
                無料試作の内容は、採用・お支払い前に公開、複製、第三者提供、他社への制作依頼資料として利用できないことを確認し、
                <Link href="/privacy" className="text-foreground underline underline-offset-4">プライバシーポリシー</Link>
                に同意します。
              </span>
            </label>
            <FieldError message={errors.consent?.message} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "送信する"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              送信先: info@make-it-tech.com
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
