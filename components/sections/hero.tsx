import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/motion";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { heroBullets, heroTrust } from "@/content/sections/hero";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Timer } from "lucide-react";

function Glow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-aurora opacity-80" />
      <div className="absolute inset-0 bg-grid opacity-30" />
    </div>
  );
}

export function Hero({ className }: { className?: string }) {
  const bulletPreview = heroBullets.slice(0, 2);
  const bulletRest = heroBullets.slice(2);

  return (
    <section className={cn("relative overflow-hidden pt-10 sm:pt-16", className)}>
      <Glow />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-3 sm:gap-10 sm:px-6 sm:pb-20 lg:grid-cols-2 lg:items-center lg:px-8">
        {/* Left */}
        <FadeIn className="relative" delay={0.05}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl text-xs sm:text-sm">
              IT活用・業務改善 総合支援
            </Badge>
            <Badge
              variant="outline"
              className="rounded-xl border-primary/30 text-primary text-xs sm:text-sm"
            >
              実装型 / 現場密着
            </Badge>
            <Badge
              variant="outline"
              className="rounded-xl border-primary/30 text-primary text-xs sm:text-sm"
            >
              補助金・助成金 対応可
            </Badge>
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:mt-5 sm:text-5xl">
            Web制作からITによる業務改善・<span className="text-gradient">DX</span>まで。
            <span className="block text-muted-foreground text-xl sm:text-2xl">
              “現場で回るシステム”を提供します。
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            {site.description}
          </p>

          <div className="mt-6 grid gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/contact">
                無料相談へ <ArrowRight className="sm:ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/services">対応できることを見る</Link>
            </Button>
          </div>

          <div className="mt-6 hidden gap-3 md:grid">
            {heroBullets.map((b) => (
              <div key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{b}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <span>IT導入補助金・小規模事業者持続化補助金などの申請サポート</span>
            </div>
          </div>

          <div className="mt-6 grid gap-2 md:hidden">
            {bulletPreview.map((b) => (
              <div key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {bulletRest.length ? (
            <div className="mt-3 md:hidden">
              <MobileDisclosure summary="対応内容をもっと見る">
              <div className="grid gap-2">
                {bulletRest.map((b) => (
                  <div key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </MobileDisclosure>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:mt-8 sm:gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2 sm:px-3 sm:py-2">
              <ShieldCheck className="h-4 w-4" />
              対応範囲は事前に合意して進行
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2 sm:px-3 sm:py-2">
              <Timer className="h-4 w-4" />
              まずは2週間〜の小さな改善もOK
            </span>
          </div>
        </FadeIn>

        {/* Right */}
        <FadeIn className="relative hidden lg:block lg:justify-self-end" delay={0.12}>
          <Card className="relative overflow-hidden rounded-3xl border bg-card/70 shadow-sm backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[url('/images/bg-light.png')] bg-cover bg-center opacity-50 dark:bg-[url('/images/bg-dark.png')]" />
            <CardContent className="relative p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold tracking-tight">よくある課題 → 解決の方向性</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    “まず整理”して、必要なら実装へ。ムダな開発を避けます。
                  </p>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <h3 className="text-sm font-medium">問い合わせ・予約が分散（電話/LINE/紙）</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    → フォーム統一＋自動通知＋管理シートで一元化
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <h3 className="text-sm font-medium">Excelが属人化して引き継げない</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    → 入力ルール＋ビュー分離＋運用手順の整備
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <h3 className="text-sm font-medium">IT導入したいが何から？</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    → 目標/KPI→優先順位→最小実装のロードマップ
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-3 sm:grid-cols-3">
                {heroTrust.map((t) => (
                  <div key={t.title} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <t.icon className="h-4 w-4 text-primary" />
                    <h3 className="mt-2 text-sm font-medium">{t.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-muted/60 p-4">
                <p className="text-sm font-medium">次の一手（おすすめ）</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  まずは「現状の困りごと」と「理想」を整理して、最短の改善案を作ります。
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild size="sm" className="rounded-xl">
                    <Link href="/contact">相談する</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-xl">
                    <Link href="/survey">LINEで相談</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* subtle border */}
          <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] border opacity-50" />
        </FadeIn>
      </div>
    </section>
  );
}
