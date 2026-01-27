import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { ProcessSection } from "@/components/process-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import {
  ArrowRight,
  Bot,
  ClipboardList,
  Globe,
  Hammer,
  LineChart,
  Sparkles,
  Wrench,
} from "lucide-react";

const serviceAreas = [
  {
    title: "Web制作・導線設計",
    desc: "LP/店舗サイト/採用ページなど、目的から逆算して構成を作ります。",
    icon: Globe,
    items: ["構成とコピー整理", "CTA設計・改善", "更新しやすい設計"],
  },
  {
    title: "業務改善・見える化",
    desc: "属人化や非効率を整理し、引き継げる運用に整えます。",
    icon: ClipboardList,
    items: ["業務フロー整理", "入力ルール整備", "運用の型づくり"],
  },
  {
    title: "ツール導入・自動化",
    desc: "LINE/フォーム/シート/通知連携で、最小コストの仕組み化。",
    icon: Bot,
    items: ["問い合わせ一元化", "通知・集計の自動化", "運用負担の削減"],
  },
  {
    title: "小規模システム",
    desc: "必要最小限の機能から。管理画面や簡易DBも対応します。",
    icon: Wrench,
    items: ["要件整理・画面設計", "権限設計（必要に応じて）", "運用導線の整備"],
  },
  {
    title: "改善伴走・運用支援",
    desc: "導入して終わりにせず、数字と現場の声で改善します。",
    icon: LineChart,
    items: ["KPI/導線の改善", "小修正の継続対応", "優先順位の見直し"],
  },
];

const principles = [
  {
    title: "作る前に整理する",
    desc: "現状と理想を整理し、必要な範囲だけを見極めます。",
    icon: Sparkles,
  },
  {
    title: "最小構成で早く動かす",
    desc: "まず動く状態を作り、効果が見えたら拡張します。",
    icon: Hammer,
  },
  {
    title: "既存ツールで済むなら作らない",
    desc: "コストと期間を最適化するために“作らない”提案もします。",
    icon: ClipboardList,
  },
];

const deliverables = [
  {
    title: "Web/集客まわりでよく出る成果物",
    items: ["構成案・導線設計", "デザイン実装", "計測導線の整備", "更新しやすい構成"],
  },
  {
    title: "業務改善でよく出る成果物",
    items: ["業務フローの見える化", "フォーム/シートの設計", "通知・集計の自動化", "運用手順（簡易）"],
  },
];

const examples = [
  {
    title: "問い合わせが電話とLINEで分散している",
    desc: "フォーム統一＋通知自動化で窓口を一本化。",
  },
  {
    title: "Excelが属人化して引き継げない",
    desc: "入力ルールとビュー分離で運用を標準化。",
  },
  {
    title: "Webが古く、問い合わせ導線が弱い",
    desc: "目的に合わせて構成を再設計し、CTAを強化。",
  },
  {
    title: "IT導入したいが何から始めるべきか不明",
    desc: "現状整理→優先順位→最小実装の順で提案。",
  },
];

export const metadata: Metadata = {
  title: "サービス",
  description:
    "新潟の中小事業者向けに、DX・業務改善・Web制作・自動化を必要最小限の範囲で支援します。",
  keywords: [
    "新潟",
    "DX",
    "IT",
    "業務改善",
    "Web制作",
    "自動化",
    "低コスト",
    "アプリ開発",
    "信頼",
  ],
};

export default function ServicesPage() {
  return (
    <>
      <Section
        eyebrow="サービス"
        title="Web制作から業務改善・DXまで"
        description="“作る”より先に“整理”。必要なものだけを実装して、現場で運用できる形にします。"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-xl text-xs sm:text-sm">
            現場密着
          </Badge>
          <Badge
            variant="outline"
            className="rounded-xl border-primary/30 text-primary text-xs sm:text-sm"
          >
            最小構成で実装
          </Badge>
        </div>

        <div className="mt-5 grid gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
          <Button asChild className="rounded-xl">
            <Link href="/contact">
              無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/survey">LINEで相談</Link>
          </Button>
        </div>

        <Separator className="my-8 sm:my-10" />

        <div className="hidden gap-4 md:grid md:grid-cols-2">
          {serviceAreas.map((area) => {
            const Icon = area.icon;
            return (
              <Card key={area.title} className="rounded-3xl">
                <CardHeader className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{area.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{area.desc}</p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="grid gap-2">
                    {area.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-3 md:hidden">
          {serviceAreas.map((area) => {
            const Icon = area.icon;
            return (
              <MobileDisclosure key={area.title} summary={area.title}>
                <div className="grid gap-2">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-muted-foreground">{area.desc}</p>
                  </div>
                  <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                    {area.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </MobileDisclosure>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="支援スタイル"
        title="小さく始めて、成果に寄せる"
        description="不安になりやすいポイントを先に整理し、ムダな開発を避けます。"
      >
        <div className="hidden gap-4 md:grid md:grid-cols-3">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium">{p.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="min-w-[220px] snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs leading-snug text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">左右にスワイプして確認できます。</p>
        </div>
      </Section>

      <Section
        eyebrow="成果物のイメージ"
        title="対応範囲のイメージを先に共有します"
        description="案件ごとに違いますが、よく出る成果物を提示してズレを減らします。"
      >
        <div className="hidden gap-4 md:grid md:grid-cols-2">
          {deliverables.map((d) => (
            <Card key={d.title} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">{d.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="grid gap-2">
                  {d.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-3 md:hidden">
          {deliverables.map((d) => (
            <MobileDisclosure key={d.title} summary={d.title}>
              <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                {d.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </MobileDisclosure>
          ))}
        </div>
      </Section>

      <ProcessSection />

      <Section
        eyebrow="よくある相談"
        title="相談内容の例"
        description="同じ悩みでも、優先順位と最小構成で進め方が変わります。"
      >
        <div className="hidden gap-4 md:grid md:grid-cols-2">
          {examples.map((ex) => (
            <Card key={ex.title} className="rounded-3xl">
              <CardContent className="p-6">
                <p className="text-sm font-medium">{ex.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{ex.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {examples.map((ex) => (
              <div
                key={ex.title}
                className="min-w-[220px] snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
              >
                <p className="text-sm font-medium">{ex.title}</p>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{ex.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">左右にスワイプして確認できます。</p>
        </div>

        <div className="mt-8 rounded-3xl border border-primary/20 bg-secondary/40 p-5 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <p className="text-sm font-medium">まずは現状だけ共有してください</p>
              <p className="mt-2 text-sm text-muted-foreground">
                「困っていること」「理想」「制約」を共有してもらえれば、
                最短の改善案と進め方を提案します。
              </p>
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3 md:justify-end">
              <Button asChild className="rounded-xl">
                <Link href="/contact">
                  無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/survey">LINEで相談</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
