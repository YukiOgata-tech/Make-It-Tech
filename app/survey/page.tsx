import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { site } from "@/lib/site";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const lineUrl = site.line?.surveyUrl ?? "https://lin.ee/8uHdH0Y";

const benefits = [
  {
    title: "チャットで気軽に相談",
    desc: "アンケートではなく会話形式。必要な情報だけを短く共有できます。",
    icon: MessageCircle,
  },
  {
    title: "やりとりを一本化",
    desc: "質問や追加確認もLINE内で完結。対応が迷子になりません。",
    icon: ClipboardList,
  },
  {
    title: "資料や画像も送れる",
    desc: "スクショや既存資料があると、診断・提案の精度が上がります。",
    icon: Sparkles,
  },
];

const prerequisites = [
  {
    title: "現状の業務と課題",
    items: [
      "誰が・いつ・どの作業をしているか",
      "詰まりやすいポイント（手戻り/二重入力など）",
      "今使っているツールや仕組み",
    ],
  },
  {
    title: "理想の状態・目的",
    items: [
      "どの作業を減らしたいか",
      "達成したいゴール（予約数/対応速度/売上など）",
      "優先順位（今すぐ/あとで）",
    ],
  },
  {
    title: "制約・条件",
    items: [
      "予算感・希望納期",
      "担当できる人数や工数",
      "社内ルールや権限の制約",
    ],
  },
  {
    title: "既存資料・データ",
    items: [
      "既存のフォームやExcel/シート",
      "メニュー・料金・サービス情報",
      "予約/問い合わせの流れが分かる資料",
    ],
  },
];

const chatOutline = [
  {
    title: "現状と課題",
    items: [
      "今困っている作業や場面",
      "分散している窓口や作業",
      "改善したい理由・背景",
    ],
  },
  {
    title: "理想とゴール",
    items: [
      "こうなったら嬉しい状態",
      "優先したい成果（集客/効率/ミス削減）",
      "最低限必要な機能・条件",
    ],
  },
  {
    title: "制約・条件",
    items: [
      "予算・納期の希望",
      "担当者の稼働可能時間",
      "既存ルールや社内事情",
    ],
  },
  {
    title: "既存ツール・データ",
    items: [
      "今使っているツール（LINE/フォーム/シートなど）",
      "連携したいサービス",
      "データの保管場所",
    ],
  },
  {
    title: "支援範囲のイメージ",
    items: [
      "Web制作のみ / 業務改善のみ / 両方",
      "運用まで継続的に支援してほしいか",
      "まずは小さく試したいか",
    ],
  },
];

const steps = [
  {
    title: "LINE公式を追加",
    desc: "友だち追加後、すぐにチャット相談を開始できます。",
  },
  {
    title: "チャットで状況共有",
    desc: "現状・理想・制約を短く教えてください。必要なら追加質問します。",
  },
  {
    title: "診断と提案",
    desc: "内容を整理し、無料診断の進め方や概算の方向性をご案内します。",
  },
];

export const metadata: Metadata = {
  title: "LINEで相談",
  description:
    "LINE公式でチャット相談を受け付けています。アンケートではなく気軽な会話で現状を整理し、無料診断と提案につなげます。",
  keywords: [
    "新潟",
    "DX",
    "IT",
    "LINE相談",
    "無料診断",
    "業務診断",
    "業務改善",
  ],
};

export default function SurveyPage() {
  return (
    <>
      <div className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl text-xs sm:text-sm">
              LINEで相談
            </Badge>
            <Badge
              variant="outline"
              className="rounded-xl border-primary/30 text-primary text-xs sm:text-sm"
            >
              チャット相談
            </Badge>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            LINEで相談
            <span className="block text-muted-foreground">
              アンケートではなく、気軽なチャットで相談できます。
            </span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
            {site.name}では、公式LINEでチャット相談を受け付けています。
            気軽なやりとりで現状を整理し、条件により無料の業務診断と提案につなげます。
          </p>

          <div className="mt-5 grid gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
            <Button asChild className="rounded-xl">
              <Link href={lineUrl} target="_blank" rel="noreferrer">
                LINEで相談 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/contact">フォームで相談</Link>
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground sm:mt-6 sm:gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              初回ヒアリング目安：5〜10分
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              個人情報はプライバシーポリシーに基づき管理
            </span>
          </div>
        </div>
      </div>

      <Section
        eyebrow="LINEでやる理由"
        title="会話ベースで、早く深く整理できる"
        description="アンケートではなくチャット相談だから、必要な情報だけを素早く集められます。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.title} className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium">{b.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="min-w-[220px] snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">{b.title}</p>
                      <p className="text-xs leading-snug text-muted-foreground">{b.desc}</p>
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
        eyebrow="相談をスムーズに"
        title="診断に必要な情報を先に整理します"
        description="曖昧なまま進めると提案がブレます。先に整理することで最短ルートを作れます。"
      >
        <div className="hidden gap-4 md:grid md:grid-cols-2">
          {prerequisites.map((p) => (
            <Card key={p.title} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="grid gap-2">
                  {p.items.map((item) => (
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
          {prerequisites.map((p) => (
            <MobileDisclosure key={p.title} summary={p.title}>
              <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                {p.items.map((item) => (
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

      <Section
        eyebrow="相談内容の整理"
        title="チャットで確認する内容"
        description="質問は絞っていますが、診断に必要な情報は押さえます。"
      >
        <div className="hidden gap-4 md:grid md:grid-cols-2">
          {chatOutline.map((s) => (
            <Card key={s.title} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="grid gap-2">
                  {s.items.map((item) => (
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
          {chatOutline.map((s) => (
            <MobileDisclosure key={s.title} summary={s.title}>
              <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </MobileDisclosure>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-primary/20 bg-secondary/40 p-5 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">相談をスムーズにするコツ</p>
              <p className="mt-1 text-sm text-muted-foreground">
                既存の資料やスクリーンショットがあれば、送ってもらえると診断が速くなります。
                迷ったら「現状」「理想」「制約」だけでもOKです。
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="相談後の流れ"
        title="最短で診断・提案までつなげます"
        description="チャット相談後、内容を整理して最短ルートを提案します。"
      >
        <div className="hidden gap-4 md:grid md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">
                  {String(index + 1).padStart(2, "0")}. {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {step.desc}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="min-w-[220px] snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
              >
                <p className="text-sm font-medium">
                  {String(index + 1).padStart(2, "0")}. {step.title}
                </p>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">左右にスワイプして確認できます。</p>
        </div>

        <Separator className="my-8 sm:my-10" />

        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-medium">個人情報の取り扱いについて</p>
            <p className="mt-2 text-sm text-muted-foreground">
              入力いただいた情報は、診断と連絡のためにのみ使用します。詳しくは
              <Link href="/privacy" className="ml-1 underline underline-offset-2">
                プライバシーポリシー
              </Link>
              をご確認ください。
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3 md:justify-end">
            <Button asChild className="rounded-xl">
              <Link href={lineUrl} target="_blank" rel="noreferrer">
                LINEで相談 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/contact">フォームで相談</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          ※ LINEが使えない場合は、お問い合わせフォームで対応します。
        </div>
      </Section>
    </>
  );
}
