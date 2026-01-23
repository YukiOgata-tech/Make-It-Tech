import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Timer } from "lucide-react";

const bullets = [
  "LP / 店舗サイト / コーポレート / アプリケーション制作（導線設計まで）",
  "LINE公式・フォーム・管理シート・自動化（低コスト）",
  "業務の見える化 → 改善案 → 実装 → 運用まで一貫対応",
  "“作る前に整理”で、無駄な開発を避けて最短で成果へ",
];

const trust = [
  { icon: ShieldCheck, title: "範囲を明確化", desc: "対応範囲・優先順位を最初に決める" },
  { icon: Timer, title: "小さく始める", desc: "まずは最短の“効く改善”から" },
  { icon: Sparkles, title: "実装から運用まで対応", desc: "ツール導入や開発〜管理と運用代行まで" },
];

function Glow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-aurora opacity-80" />
      <div className="absolute inset-0 bg-grid opacity-30" />
    </div>
  );
}

export function Hero({ className }: { className?: string }) {
  return (
    <section className={cn("relative overflow-hidden pt-12 sm:pt-16", className)}>
      <Glow />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 sm:px-6 sm:pb-20 lg:grid-cols-2 lg:items-center lg:px-8">
        {/* Left */}
        <FadeIn className="relative" delay={0.05}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">
              IT活用・業務改善 総合支援
            </Badge>
            <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
              実装型 / 現場密着
            </Badge>
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            Web制作からITによる業務改善・<span className="text-gradient">DX</span>まで。
            <span className="block text-muted-foreground">
              “現場で回る仕組み”を最短で作ります。
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {site.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/contact">
                無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/services">対応できることを見る</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-3">
            {bullets.map((b) => (
              <div key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2">
              <ShieldCheck className="h-4 w-4" />
              対応範囲は事前に合意して進行
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2">
              <Timer className="h-4 w-4" />
              まずは2週間〜の小さな改善もOK
            </span>
          </div>
        </FadeIn>

        {/* Right */}
        <FadeIn className="relative lg:justify-self-end" delay={0.12}>
          <Card className="rounded-3xl border bg-card/70 shadow-sm backdrop-blur">
            <CardContent className="p-6 sm:p-7">
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
                  <p className="text-sm font-medium">問い合わせ・予約が分散（電話/LINE/紙）</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    → フォーム統一＋自動通知＋管理シートで一元化
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-medium">Excelが属人化して引き継げない</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    → 入力ルール＋ビュー分離＋運用手順の整備
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-medium">IT導入したいが何から？</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    → 目標/KPI→優先順位→最小実装のロードマップ
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-3 sm:grid-cols-3">
                {trust.map((t) => (
                  <div key={t.title} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <t.icon className="h-4 w-4 text-primary" />
                    <p className="mt-2 text-sm font-medium">{t.title}</p>
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
                    <Link href="/survey">事前アンケート</Link>
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
