import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Bot,
  Globe,
  LayoutGrid,
  LineChart,
  ShieldCheck,
  Workflow,
} from "lucide-react";

type Service = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
};

type ServiceGroup = {
  label: string;
  headline: string;
  note: string;
  items: Service[];
};

const groups: ServiceGroup[] = [
  {
    label: "Web",
    headline: "見た目だけで終わらないWeb制作",
    note: "LP・店舗サイト・コーポレート。導線設計と更新しやすさを重視します。",
    items: [
      {
        title: "LP制作（集客・採用・告知）",
        desc: "1ページで価値が伝わる構成に。CTA最適化・計測導線も設計。",
        icon: LayoutGrid,
        tags: ["構成", "導線", "改善"],
      },
      {
        title: "店舗Webサイト",
        desc: "メニュー/アクセス/予約を整理。検索・マップ導線も整備します。",
        icon: Globe,
        tags: ["店舗", "SEO", "更新性"],
      },
    ],
  },
  {
    label: "業務改善",
    headline: "まずは“見える化”から。最小コストで効く仕組み化",
    note: "無駄な開発を避け、LINE/フォーム/シートで最短の改善を狙います。",
    items: [
      {
        title: "業務フロー整理・属人化解消",
        desc: "現状→課題→優先順位を短時間で整理。引き継ぎ可能な形へ。",
        icon: Workflow,
        tags: ["見える化", "標準化"],
      },
      {
        title: "ツール導入（LINE/フォーム/シート）",
        desc: "問い合わせ・予約・集計を一元化。現場で回る運用に落とし込み。",
        icon: Bot,
        tags: ["低コスト", "現場運用"],
      },
    ],
  },
  {
    label: "DX/運用",
    headline: "導入して終わりにしない。運用と改善で成果に寄せる",
    note: "数字と現場の声をもとに、改善サイクルを回して“結果”に繋げます。",
    items: [
      {
        title: "自動化（通知・集計・連携）",
        desc: "手作業を減らす。ミスを減らす。毎日の作業をラクにします。",
        icon: ShieldCheck,
        tags: ["自動化", "ミス削減"],
      },
      {
        title: "改善PDCA（KPI設計・導線改善）",
        desc: "何が効いたかを可視化し、次の一手を最短で打てる状態に。",
        icon: LineChart,
        tags: ["KPI", "改善"],
      },
    ],
  },
];

function ServiceCard({ item }: { item: Service }) {
  const Icon = item.icon;

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
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-sm leading-relaxed text-muted-foreground">
        {item.desc}

        <div className="mt-5">
          <Link
            href="/contact"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            相談する <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function ServicesSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-14 sm:py-18", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary/80">
              サービス
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              ITのこと、まるごと相談できます
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Web制作・業務改善・DX支援を、必要な範囲だけ切り出して実装します。
              「何からやるべきか」から一緒に整理できます。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/services">サービス詳細</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/contact">無料相談へ</Link>
            </Button>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Groups */}
        <div className="grid gap-10">
          {groups.map((g) => (
            <div key={g.label} className="grid gap-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-xl border-primary/20 text-primary/80" variant="outline">
                      {g.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{g.note}</p>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">
                    {g.headline}
                  </h3>
                </div>

                <Link
                  href="/contact"
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  この領域で相談する <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {g.items.map((item, index) => (
                  <FadeIn key={item.title} delay={0.05 * index}>
                    <ServiceCard item={item} />
                  </FadeIn>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <p className="text-sm font-medium">迷ったらここから</p>
              <p className="mt-2 text-sm text-muted-foreground">
                「現状の困りごと」「理想」「制約（予算/期間/担当者）」を
                ざっくり共有してもらえれば、最短の改善案を提案します。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
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
        </div>
      </div>
    </section>
  );
}
