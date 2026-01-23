import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    title: "スマホで短時間に回答",
    desc: "フォームよりも気軽に、会話感覚で必要項目を埋められます。",
    icon: MessageCircle,
  },
  {
    title: "やりとりが一本化",
    desc: "相談とアンケートを同じ窓口で管理でき、連絡が迷子になりません。",
    icon: ClipboardList,
  },
  {
    title: "資料や画像も送れる",
    desc: "スクショや既存資料があると、提案精度が一気に上がります。",
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

const surveyOutline = [
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
    desc: "友だち追加後、アンケート案内が自動で届きます。",
  },
  {
    title: "アンケートに回答",
    desc: "目安は5〜10分。必要なら途中で保存して続きができます。",
  },
  {
    title: "内容を確認して提案",
    desc: "内容を整理して、最短の改善案と進め方をご提案します。",
  },
];

export const metadata: Metadata = {
  title: "事前アンケート",
  description:
    "LINEで事前アンケートに回答し、現状を整理して最短でDX・業務改善の提案につなげます。",
  keywords: [
    "新潟",
    "DX",
    "IT",
    "事前アンケート",
    "LINE",
    "業務改善",
    "相談",
  ],
};

export default function SurveyPage() {
  return (
    <>
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">
              事前アンケート
            </Badge>
            <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
              LINEで回答
            </Badge>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            アンケートはLINEで。
            <span className="block text-muted-foreground">
              相談前の“現状整理”を最短で終わらせます。
            </span>
          </h1>

          <p className="mt-3 max-w-3xl text-base text-muted-foreground">
            {site.name}では、事前アンケートをLINE公式で行います。
            スマホで短時間に回答できるため、相談のスタートが早くなり、提案の精度も上がります。
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl">
              <Link href={lineUrl} target="_blank" rel="noreferrer">
                LINEでアンケートを始める <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/contact">まずは相談だけ</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              回答目安：5〜10分
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
        title="回答しやすさと、提案精度を両立"
        description="アンケートは“短く・深く”。必要な情報を最短で集めます。"
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
      </Section>

      <Section
        eyebrow="前提知識・条件"
        title="実際の業務に必要な情報を先に整理します"
        description="曖昧なまま進めると、見積もりや提案がブレます。先に整理することで最短ルートを作れます。"
      >
        <div className="grid gap-4 md:grid-cols-2">
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
      </Section>

      <Section
        eyebrow="アンケート内容"
        title="LINEで聞く内容はここまで"
        description="質問は絞っていますが、提案に必要な情報は全て押さえます。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {surveyOutline.map((s) => (
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

        <div className="mt-10 rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">回答をスムーズにするコツ</p>
              <p className="mt-1 text-sm text-muted-foreground">
                既存の資料やスクリーンショットがあれば、送ってもらえると提案が速くなります。
                迷ったら「現状」「理想」「制約」だけでもOKです。
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="回答後の流れ"
        title="最短で提案までつなげます"
        description="アンケート回答後、内容を整理して最短ルートを提案します。"
      >
        <div className="grid gap-4 md:grid-cols-3">
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

        <Separator className="my-10" />

        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-medium">個人情報の取り扱いについて</p>
            <p className="mt-2 text-sm text-muted-foreground">
              入力いただいた情報は、提案と連絡のためにのみ使用します。詳しくは
              <Link href="/privacy" className="ml-1 underline underline-offset-2">
                プライバシーポリシー
              </Link>
              をご確認ください。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button asChild className="rounded-xl">
              <Link href={lineUrl} target="_blank" rel="noreferrer">
                LINEでアンケートを始める <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/contact">相談だけしたい</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          ※ LINEが使えない場合は、メール（{site.contact.email}）でも対応します。
        </div>
      </Section>
    </>
  );
}
