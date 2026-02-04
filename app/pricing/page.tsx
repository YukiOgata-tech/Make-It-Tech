import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import {
  pricingExamples,
  pricingExtras,
  pricingFaqs,
  pricingPrinciples,
} from "@/content/pages/pricing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";


export const metadata: Metadata = {
  title: "料金",
  description:
    "DX･IT支援に対応した料金目安。固定プランはなく、内容に合わせて柔軟に見積もります。",
  keywords: [
    "新潟", "DX", "IT", "料金", "地方創生",
    "見積", "低コスト", "業務改善", "Web制作", "LP制作", "自動化", "無料診断", "業務効率化", "LINE公式", "Google Workspace", "クラウドツール", "AI", "チャットボット",
  ],
};

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div>
      <p className="text-xs sm:text-sm font-medium text-primary/80">{eyebrow}</p>
      <h2 className="mt-1 sm:mt-2 text-xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {desc && (
        <p className="mt-1.5 sm:mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">{desc}</p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const exampleNav = pricingExamples.map((ex, index) => ({
    id: `example-${index + 1}`,
    label: ex.title,
  }));

  return (
    <div className="pt-4 pb-4 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-4 sm:mb-10">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary" className=" rounded-xl">
              料金の目安
            </Badge>
            <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
              柔軟見積もり
            </Badge>
          </div>

          <h1 className="mt-4 text-xl font-semibold tracking-tight sm:text-3xl">
            “プラン”ではなく、内容に合わせて見積もります
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground">
            ITは案件ごとに、
            「よくある依頼」の価格レンジを表示しています。
          </p>

          <div className="mt-3 sm:mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/contact">
                無料相談へ <ArrowRight className="sm:ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/services">対応範囲について</Link>
            </Button>
          </div>
        </div>

        {/* Principles */}
        <section id="principles" className="scroll-mt-24">
          <SectionTitle
            eyebrow="-考え方"
            title="不透明さをなくすための3つの約束"
          />
          <div className="mt-4 grid gap-2 sm:mt-8 sm:gap-3 md:grid-cols-3 md:gap-4">
            {pricingPrinciples.map((p) => (
              <div
                key={p.title}
                className="flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-2 sm:rounded-3xl sm:p-4 md:p-5"
              >
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary sm:h-9 sm:w-9 md:h-10 md:w-10">
                  <p.icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{p.title}</p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground sm:text-sm">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-4 sm:my-12" />

        {/* Examples */}
        <section id="examples" className="scroll-mt-24">
          <SectionTitle
            eyebrow="-目安"
            title="よくある依頼の価格レンジ"
            desc="内容･期間･素材提供の有無などで変動します。まずは状況を伺って最適案をご提案します。"
          />

          <div className="mt-3 md:hidden">
            <div className="grid gap-1.5 text-[12px] text-primary/90">
              {exampleNav.map((item, index) => (
                <Link
                  key={item.id}
                  href={`#${item.id}`}
                  className="group inline-flex items-center gap-1 underline underline-offset-4 decoration-primary/30 transition hover:text-primary hover:decoration-primary"
                >
                  {index + 1}. {item.label}
                  <ArrowRight className="h-3 w-3 translate-y-[1px] opacity-70 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 sm:mt-8 grid gap-4 lg:grid-cols-2">
            {pricingExamples.map((ex, index) => {
              const exampleId = `example-${index + 1}`;
              return (
              <Card
                key={ex.title}
                id={exampleId}
                className="relative scroll-mt-24 overflow-hidden rounded-3xl border bg-card/70 shadow-sm backdrop-blur"
              >
                <div className="pointer-events-none absolute inset-0 bg-[url('/images/bg-light.png')] bg-cover bg-center opacity-50 dark:bg-[url('/images/bg-dark.png')]" />
                <div className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/2 translate-x-[-20%] rotate-6 bg-white/15 blur-xl hero-sheen" />
                <CardHeader className="relative space-y-1 sm:space-y-3">
                  <div className="flex items-start justify-between gap-1 sm:gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg tracking-tight">
                        {ex.title}
                      </CardTitle>
                      <p className="mt-0.5 sm:mt-2 text-sm font-medium">{ex.range}</p>
                    </div>

                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-sm">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{ex.summary}</p>
                </CardHeader>

                <CardContent className="relative grid gap-4">
                  <div className="hidden rounded-2xl border border-border/70 bg-background/70 p-4 md:block">
                    <p className="text-sm font-medium">含まれること(例)</p>
                    <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                      {ex.includes.map((x) => (
                        <li key={x} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="hidden rounded-2xl border border-primary/10 bg-secondary/30 p-4 md:block">
                    <p className="text-sm font-medium">金額が変わりやすい要因(例)</p>
                    <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                      {ex.dependsOn.map((x) => (
                        <li key={x} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary/60" />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-3 md:hidden">
                    <MobileDisclosure summary="含まれること(例)">
                      <ul className="grid gap-2">
                        {ex.includes.map((x) => (
                          <li key={x} className="flex items-start gap-1 text-xs">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </MobileDisclosure>
                    <MobileDisclosure summary="金額が変わりやすい要因(例)">
                      <ul className="grid gap-2">
                        {ex.dependsOn.map((x) => (
                          <li key={x} className="flex items-start gap-1 text-xs">
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary/60" />
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </MobileDisclosure>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="rounded-xl">
                      <Link href="/contact">
                        この内容で相談 <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <LineButton href="/survey">LINEで相談</LineButton>
                  </div>

                <p className="text-xs text-muted-foreground">
                  ※ 上記は目安で、内容合意の上で見積もります。
                </p>
              </CardContent>
            </Card>
              );
            })}
          </div>
        </section>

        <Separator className="my-4 sm:my-12" />

        {/* Extras / Notes */}
        <section id="extras" className="scroll-mt-24">
          <SectionTitle
            eyebrow="-補足"
            title="追加事項･作らない判断"
          />

          <div className="mt-2 grid gap-2 sm:mt-8 sm:gap-3 md:grid-cols-2 md:gap-4">
            {pricingExtras.map((b) => (
              <div
                key={b.title}
                className="h-full rounded-2xl border border-border/60 bg-background/70 p-3 sm:rounded-3xl sm:p-4 md:p-5"
              >
                <p className="text-sm font-medium leading-snug">{b.title}</p>
                <ul className="mt-2 grid gap-1.5 text-xs leading-snug text-muted-foreground sm:mt-3 sm:gap-2 sm:text-sm">
                  {b.items.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-4 md:my-12" />

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24">
          <SectionTitle
            eyebrow="FAQ"
            title="よくある質問"
            desc="不安になりやすい点を先に解消します。"
          />

          <div className="mt-4 sm:mt-8 grid gap-4 lg:grid-cols-3 lg:items-start">
            <div className="lg:col-span-2">
              <Accordion type="single" collapsible className="w-full">
                {pricingFaqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`item-${i}`}>
                    <AccordionTrigger className="text-left">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:rounded-3xl sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm font-medium leading-snug">見積もりを早くする3点セット</p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground sm:mt-2 sm:text-sm">
                これが分かると提案が速いです。
              </p>

              <div className="mt-1 grid gap-1.5 text-xs leading-snug text-muted-foreground sm:mt-4 sm:gap-2 sm:text-sm">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>現状と要件</span>
                </div>
                <div className="flex items-start gap-2">
                  <Timer className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>理想(どうしたいか)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>制約(予算/納期/担当者)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="contact" className="scroll-mt-24">
          <div className="mt-4 sm:mt-12 rounded-3xl border border-primary/20 bg-secondary/40 p-3 sm:p-8">
            <div className="grid gap-4 md:grid-cols-3 md:items-center">
              <div className="md:col-span-2">
                <p className="text-sm font-medium">要件が不明確でも大丈夫です</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  「開発が必要かどうか」から一緒に判断できます。まずは現状を共有してください。
                </p>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-3 md:justify-end">
                <Button asChild className="rounded-xl">
                  <Link href="/contact">
                    お問合せへ <ArrowRight className="ml-0 sm:ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <LineButton href="/survey">LINEで相談</LineButton>
              </div>
            </div>
          </div>

          <p className="mt-3 sm:mt-6 text-xs text-muted-foreground">
            ※ 金額や納期は内容により変動します。詳細は事前合意の上で進行致します。
          </p>
        </section>
      </div>
    </div>
  );
}
