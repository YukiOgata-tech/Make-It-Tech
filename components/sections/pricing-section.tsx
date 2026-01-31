import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { pricingItems, pricingPrinciples, type PriceItem } from "@/content/sections/pricing-section";
import { ArrowRight, Check, Sparkles } from "lucide-react";

function PriceCard({ item }: { item: PriceItem }) {
  return (
    <Card className="group relative overflow-hidden rounded-3xl">
      {/* subtle hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 left-1/2 h-64 w-md -translate-x-1/2 rounded-full bg-secondary/50 blur-3xl" />
      </div>

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <CardTitle className="text-base tracking-tight sm:text-lg">
              {item.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <Badge key={t} variant="secondary" className="rounded-xl">
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <p className="text-sm font-medium">{item.range}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="hidden rounded-2xl border border-border/70 bg-background/70 p-4 md:block">
          <p className="text-sm font-medium">含まれること（例）</p>
          <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
            {item.includes.map((x) => (
              <li key={x} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:hidden">
          <MobileDisclosure summary="含まれること（例）">
            <ul className="grid gap-2">
              {item.includes.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </MobileDisclosure>
        </div>

        {item.note && (
          <p className="text-xs text-muted-foreground">
            ※ {item.note}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-xl">
            <Link href="/contact">
              この内容で相談 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/pricing">料金ページへ</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          ※ 上記は目安です。要件・期間・素材提供の有無により変動します。まずは状況を伺って最適案をご提案します。
        </p>
      </CardContent>
    </Card>
  );
}

export function PricingSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-14 sm:py-18", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary/80">料金の目安</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              “プラン”ではなく、内容に合わせて柔軟に見積もります
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              ITは案件ごとに必要な範囲が違うため、固定プランは置きません。
              代わりに「よくある依頼」の価格レンジを提示し、範囲を擦り合わせてから最短の案をご提案します。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/pricing">詳細を見る</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/contact">無料相談へ</Link>
            </Button>
          </div>
        </div>

        {/* Principles */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {pricingPrinciples.map((p, index) => (
            <FadeIn key={p.title} delay={0.05 * index}>
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <p className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" />
                  </p>
                  <p className="mt-4 text-sm font-medium">{p.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <Separator className="my-10" />

        {/* Price list */}
        <div className="grid gap-4 lg:grid-cols-2">
          {pricingItems.map((it, index) => (
            <FadeIn key={it.title} delay={0.05 * index}>
              <PriceCard item={it} />
            </FadeIn>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <p className="text-sm font-medium">最短で見積もるために</p>
              <p className="mt-2 text-sm text-muted-foreground">
                「現状の困りごと」「理想」「制約（予算/期間/担当者）」を共有してください。
                まずは“開発が必要かどうか”から一緒に判断できます。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild className="rounded-xl">
                <Link href="/contact">
                  相談する <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/survey">LINEで相談</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
