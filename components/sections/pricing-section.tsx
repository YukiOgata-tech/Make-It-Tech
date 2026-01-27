import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { ArrowRight, Check, Sparkles, ShieldCheck, Timer, Wallet } from "lucide-react";

type PriceItem = {
  title: string;
  range: string;
  desc: string;
  tags: string[];
  includes: string[];
  note?: string;
};

const principles = [
  {
    icon: ShieldCheck,
    title: "範囲を先に決める",
    desc: "“何をやる/やらない”を最初に合意して、ムダな工数を防ぎます。",
  },
  {
    icon: Timer,
    title: "小さく始めて検証",
    desc: "最小構成でまず動かし、効果を見て拡張します。",
  },
  {
    icon: Wallet,
    title: "柔軟な見積もり",
    desc: "予算・期間・体制に合わせて、最も効果が高い案から提案します。",
  },
];

const items: PriceItem[] = [
  {
    title: "LP制作（1ページ）",
    range: "目安：¥80,000〜¥300,000",
    desc: "構成・コピー整理〜デザイン実装まで。問い合わせ導線を重視します。",
    tags: ["構成", "導線", "改善"],
    includes: ["ヒアリング", "構成案", "デザイン実装", "基本SEO", "軽微な修正（範囲内）"],
    note: "内容量、素材提供の有無、アニメーション量で変動します。",
  },
  {
    title: "店舗Webサイト（3〜6ページ程度）",
    range: "目安：¥150,000〜¥600,000",
    desc: "メニュー/アクセス/予約など、現場で更新できる形に整えます。",
    tags: ["店舗", "更新性", "SEO"],
    includes: ["ページ設計", "デザイン実装", "スマホ最適化", "基本SEO", "運用の型づくり"],
    note: "撮影・文章作成・ロゴ等は必要に応じて追加対応。",
  },
  {
    title: "フォーム＋管理シートの仕組み化",
    range: "目安：¥30,000〜¥150,000",
    desc: "問い合わせ/予約/応募などを一元化。通知や集計まで整備できます。",
    tags: ["低コスト", "現場運用", "仕組み化"],
    includes: ["入力項目設計", "フォーム作成", "スプレッドシート整備", "通知設定（必要に応じて）"],
    note: "既存運用の複雑さ・分岐条件により変動。",
  },
  {
    title: "自動化（通知・集計・連携）",
    range: "目安：¥50,000〜¥250,000",
    desc: "毎日の手作業を削減し、ミスも減らします（例：予約→通知→台帳更新）。",
    tags: ["自動化", "ミス削減", "連携"],
    includes: ["現状整理", "要件定義（軽量）", "自動化の実装", "テスト", "運用手順の簡易ドキュメント"],
    note: "連携先（LINE/メール/Google/外部SaaS）で難易度が変わります。",
  },
  {
    title: "業務改善・DX伴走（運用改善）",
    range: "目安：月額 ¥20,000〜（要相談）",
    desc: "導入して終わりにせず、KPIと現場の声で改善サイクルを回します。",
    tags: ["伴走", "改善", "運用"],
    includes: ["定例（回数は相談）", "改善案の提示", "優先順位付け", "小修正（範囲内）"],
    note: "支援範囲（Web/業務/自動化）と頻度で調整します。",
  },
];

function PriceCard({ item }: { item: PriceItem }) {
  return (
    <Card className="group relative overflow-hidden rounded-3xl">
      {/* subtle hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 left-1/2 h-64 w-[28rem] -translate-x-1/2 rounded-full bg-secondary/50 blur-3xl" />
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
          {principles.map((p, index) => (
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
          {items.map((it, index) => (
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
