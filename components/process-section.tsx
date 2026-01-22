import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  ClipboardList,
  Compass,
  Hammer,
  LineChart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Step = {
  step: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  outputs: string[];
  decision?: {
    label: string;
    note: string;
  };
};

const steps: Step[] = [
  {
    step: "STEP 01",
    title: "ヒアリング & 現状整理",
    icon: ClipboardList,
    desc:
      "現状の困りごと・理想・制約（予算/期間/担当者）を整理し、ゴールと優先順位を明確にします。",
    outputs: ["課題の言語化（箇条書き）", "優先順位（まずやる/後でやる）", "対応範囲の合意（やる/やらない）"],
    decision: {
      label: "ここで決める",
      note: "“何を作るか”より先に、“何を作らないか”を決めます。",
    },
  },
  {
    step: "STEP 02",
    title: "設計（最小構成の提案）",
    icon: Compass,
    desc:
      "既存ツールで解決できるなら開発しません。最小構成で効果が出る案を設計します。",
    outputs: ["最小構成の提案（ツール/導線/運用）", "見積もりレンジ（目安）", "2〜4週間の実行プラン"],
    decision: {
      label: "ここで判断",
      note: "開発が必要かどうか / 先にやるべき改善を判断します。",
    },
  },
  {
    step: "STEP 03",
    title: "実装（早く動かす）",
    icon: Hammer,
    desc:
      "LP/店舗サイト/フォーム/自動化/簡易システムなど、必要な範囲だけを実装。まず動く状態を作ります。",
    outputs: ["初期版の公開（最小機能）", "運用手順（簡易ドキュメント）", "計測/改善の土台（導線・数字）"],
  },
  {
    step: "STEP 04",
    title: "運用 & 改善（成果に寄せる）",
    icon: LineChart,
    desc:
      "導入して終わりにしない。現場の声と数字をもとに改善サイクルを回し、成果に寄せます。",
    outputs: ["改善案（優先順位付き）", "運用改善（ルール/入力/集計）", "導線改善（CV/予約/問い合わせ）"],
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "範囲を明確にします",
    desc: "対応範囲と優先順位を合意して進行。無限対応にならないよう設計します。",
  },
  {
    icon: Sparkles,
    title: "最小実装を優先します",
    desc: "小さく作って検証→拡張。ムダな開発を避け、最短で効果に近づけます。",
  },
];

function StepCard({ s }: { s: Step }) {
  const Icon = s.icon;

  return (
    <Card className="relative overflow-hidden rounded-3xl">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground">{s.step}</p>
            <CardTitle className="text-base tracking-tight sm:text-lg">
              {s.title}
            </CardTitle>
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-background shadow-sm">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
      </CardHeader>

      <CardContent className="grid gap-4">
        {s.decision && (
          <div className="rounded-2xl border bg-muted/40 p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-xl">
                {s.decision.label}
              </Badge>
              <p className="text-sm font-medium">意思決定ポイント</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.decision.note}</p>
          </div>
        )}

        <div className="rounded-2xl border bg-background p-4">
          <p className="text-sm font-medium">このステップのアウトプット</p>
          <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
            {s.outputs.map((o) => (
              <li key={o} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-foreground/70" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProcessSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-14 sm:py-18", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">進め方</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              迷わないために、手順と判断ポイントを明確にします
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              “何でもできます”は、進め方が曖昧だと不安になります。
              この支援では、範囲を先に決めて、小さく作って検証し、成果に寄せます。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/services">サービス詳細</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/contact">
                無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Steps */}
        <div className="grid gap-4 lg:grid-cols-2">
          {steps.map((s) => (
            <StepCard key={s.step} s={s} />
          ))}
        </div>

        {/* Guarantees + CTA */}
        <div className="mt-10 grid gap-4 md:grid-cols-3 md:items-stretch">
          <div className="md:col-span-2 grid gap-4">
            {guarantees.map((g) => (
              <Card key={g.title} className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-background">
                      <g.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{g.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{g.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <p className="text-sm font-medium">まずはここから</p>
              <p className="mt-2 text-sm text-muted-foreground">
                現状の困りごとを3つ書ければOK。
                最短の改善案を作って、必要なら実装まで進めます。
              </p>

              <div className="mt-5 grid gap-3">
                <Button asChild className="rounded-xl">
                  <Link href="/contact">
                    無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/survey">事前アンケート</Link>
                </Button>
              </div>

              <div className="mt-6 rounded-2xl bg-muted/50 p-4">
                <p className="text-xs font-medium text-muted-foreground">TIP</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  “開発が必要か”から一緒に判断できます。既存ツールで済むなら、開発しません。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* small note */}
        <div className="mt-8 text-xs text-muted-foreground">
          ※ 具体的な進め方・成果物・範囲は案件により調整します。無理に大きく作らず、最小構成で効果を検証します。
        </div>
      </div>
    </section>
  );
}
