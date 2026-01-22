import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Hammer,
  LineChart,
  Sparkles,
  Wrench,
} from "lucide-react";

type Offer = {
  title: string;
  range: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  includes: string[];
  notes: string[];
};

const offers: Offer[] = [
  {
    title: "Web制作（LP / 店舗サイト / 採用ページ）",
    range: "目安：¥20,000〜¥600,000",
    icon: Sparkles,
    summary:
      "目的（集客/採用/告知）から逆算して、構成→デザイン→実装まで。最短で“問い合わせにつながる形”を作ります。",
    includes: ["ヒアリング", "構成案", "デザイン実装", "スマホ最適化", "基本SEO"],
    notes: ["ページ数/素材の有無/アニメーション量で変動", "文章・撮影など制作物は別途の場合あり"],
  },
  {
    title: "フォーム＋管理（アンケート/予約/問い合わせの一元化）",
    range: "目安：¥30,000〜¥150,000",
    icon: ClipboardList,
    summary:
      "入力→通知→台帳管理までを整えて、現場で回る運用に。ミス削減と対応スピードを上げます。",
    includes: ["項目設計", "フォーム作成", "管理表整備", "通知設定（必要に応じて）", "簡易運用手順"],
    notes: ["分岐・権限・通知先が増えるほど変動", "既存運用の複雑さで調整"],
  },
  {
    title: "自動化（通知/集計/連携）",
    range: "目安：¥50,000〜¥250,000",
    icon: Wrench,
    summary:
      "日々の手作業を減らして、ミスと工数を削減。小さく作って、効果が出たら拡張します。",
    includes: ["現状整理", "最小要件", "実装", "テスト", "簡易ドキュメント"],
    notes: ["連携先（LINE/メール/外部SaaS）で変動", "監視・再実行が必要なら別途"],
  },
  {
    title: "業務改善・DX伴走（運用まで）",
    range: "目安：月額 ¥20,000〜（要相談）",
    icon: LineChart,
    summary:
      "導入して終わりにしない。現場の声と数字をもとに改善サイクルを回して成果に寄せます。",
    includes: ["定例（頻度は相談）", "改善案提示", "優先順位付け", "小修正（範囲内）", "運用ルール整備"],
    notes: ["頻度/範囲（Web/業務/自動化）で変動", "大規模改修は別途見積もり"],
  },
  {
    title: "小規模システム（管理画面/会員/簡易DBなど）",
    range: "目安：¥150,000〜（要相談）",
    icon: Hammer,
    summary:
      "要件を絞って“必要最低限の機能”から。運用負担が増えない設計を優先します。",
    includes: ["要件整理", "画面設計", "実装", "権限の考慮（必要に応じて）", "運用導線の整備"],
    notes: ["ログイン/権限/決済などで変動", "外部サービス費用は原則お客様負担"],
  },
];

const principles = [
  {
    title: "範囲を先に決める",
    desc: "「やる/やらない」を合意して、無限修正にならないようにします。",
  },
  {
    title: "最小構成で早く動かす",
    desc: "小さく作って検証→成果が出たら拡張。ムダな開発を避けます。",
  },
  {
    title: "既存ツールで済むなら作らない",
    desc: "コストと期間を最適化するため、“作らない”提案もします。",
  },
];

export function OfferSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-14 sm:py-18", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">サービス / 料金の目安</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              できることと、価格レンジをまとめて提示します
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              固定プランは置かず、内容に合わせて柔軟に見積もります。
              まずは「現状・理想・制約」を整理して、最短の改善案を提案します。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/services">詳細を見る</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/contact">
                無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Principles */}
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((p) => (
            <Card key={p.title} className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-background">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Offers */}
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {offers.map((o) => {
            const Icon = o.icon;
            return (
              <Card key={o.title} className="rounded-3xl overflow-hidden">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid gap-2">
                      <CardTitle className="text-base tracking-tight sm:text-lg">
                        {o.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-xl">
                          {o.range}
                        </Badge>
                        <Badge variant="outline" className="rounded-xl">
                          目安
                        </Badge>
                      </div>
                    </div>

                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-background shadow-sm">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {o.summary}
                  </p>
                </CardHeader>

                <CardContent className="grid gap-4">
                  <div className="rounded-2xl border bg-background p-4">
                    <p className="text-sm font-medium">含まれること（例）</p>
                    <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                      {o.includes.map((x) => (
                        <li key={x} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-foreground/70" />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border bg-muted/40 p-4">
                    <p className="text-sm font-medium">変動要因（例）</p>
                    <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                      {o.notes.map((x) => (
                        <li key={x} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-foreground/70" />
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

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
                    ※ 上記は目安です。範囲を合意してから見積もります。
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-10 rounded-3xl border bg-muted/40 p-6 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium">迷ったら、まず「困りごと」だけでOK</p>
              <p className="mt-2 text-sm text-muted-foreground">
                開発が必要かどうかも含めて判断します。既存ツールで済むなら、開発しません。
                まずは現状を共有してください。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-xl">
                <Link href="/contact">
                  無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/survey">事前アンケート</Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            <span>
              詳細条件や注意事項は <Link href="/terms" className="underline underline-offset-2">利用規約</Link> /
              <Link href="/privacy" className="underline underline-offset-2 ml-1">プライバシー</Link> をご確認ください。
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
