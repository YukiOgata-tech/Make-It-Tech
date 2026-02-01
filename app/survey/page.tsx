import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  surveyBenefits,
  surveyChatOutline,
  surveyPrerequisites,
  surveySteps,
} from "@/content/pages/survey";
import {
  ArrowRight,
  Clock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const lineUrl = site.line?.surveyUrl ?? "https://lin.ee/8uHdH0Y";

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
    <div className="pb-12 sm:pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-aurora opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-12 sm:pt-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <Badge variant="secondary" className="rounded-xl">
                  LINEで相談
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-xl border-primary/30 text-primary"
                >
                  チャット相談
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-xl border-primary/30 text-primary"
                >
                  条件により無料診断
                </Badge>
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:mt-5 sm:text-4xl lg:text-5xl">
                LINEで相談
                <span className="mt-2 block text-base font-medium text-muted-foreground sm:text-xl">
                  アンケートではなく、気軽なチャットで現状を整理します。
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {site.name}では、公式LINEで相談を受け付けています。ヒアリングを短く絞り、
                必要な情報だけを確認して無料診断と提案につなげます。
              </p>

              <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
                <LineButton
                  href={lineUrl}
                  className="flex-1 sm:flex-none"
                  target="_blank"
                  rel="noreferrer"
                >
                  LINEで相談 <ArrowRight className="ml-2 h-4 w-4" />
                </LineButton>
                <Button asChild variant="outline" className="flex-1 rounded-xl sm:flex-none">
                  <Link href="/contact">フォームで相談</Link>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground sm:mt-6 sm:gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2">
                  <Clock className="h-4 w-4 text-primary" />
                  初回ヒアリング目安: 30分
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  個人情報はポリシーに沿って管理
                </span>
              </div>
            </div>

            <Card className="rounded-3xl border border-border/60 bg-background/80 shadow-sm backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base">相談の流れ(簡易)</CardTitle>
                <p className="text-xs text-muted-foreground">
                  相談は、診断に必要な情報だけを確認します。
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                {surveySteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-border/70 bg-background/70 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{step.title}</p>
                        <p className="mt-1 text-xs leading-snug text-muted-foreground">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl border border-primary/20 bg-secondary/40 p-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        相談をスムーズにするコツ
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        既存の資料やスクリーンショットがあると診断がより正確になります。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Separator className="my-6 sm:my-10" />
      </div>

      {/* Benefits */}
      <section className="py-6 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-primary/80">-LINEを推奨する理由</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
              会話ベースだから、早く深く整理できる
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              アンケートではなくチャット相談。必要な情報を短く共有できます。
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {surveyBenefits.map((b) => {
              const Icon = b.icon;
              return (
                <Card key={b.title} className="rounded-3xl">
                  <CardContent className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm sm:text-lg font-medium mb-0 sm:mb-1">{b.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      {/* <section className="py-6 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary/80">-相談をスムーズに</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
                診断に必要な情報を先に整理します
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                曖昧なまま進めると提案がブレます。先に整理することで最短ルートを作れます。
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {surveyPrerequisites.map((p) => (
              <Card key={p.title} className="rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="grid gap-2">
                    {p.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Chat Outline */}
      <section className="py-6 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-primary/80">-相談内容の整理</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
              チャットで確認する内容
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              質問は絞っていますが、診断に必要な情報は押さえます。
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {surveyChatOutline.map((s) => (
              <Card key={s.title} className="relative overflow-hidden rounded-3xl">
                <div
                  className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 dark:hidden"
                  style={{ backgroundImage: "url(/images/bg-3-light.png)" }}
                />
                <div
                  className="pointer-events-none absolute inset-0 hidden bg-cover bg-center opacity-30 dark:block"
                  style={{ backgroundImage: "url(/images/bg-3-dark.png)" }}
                />
                <CardHeader className="relative pb-0">
                  <CardTitle className="text-sm sm:text-lg">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative text-sm text-muted-foreground">
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
        </div>
      </section>

      {/* Steps */}
      <section className="py-6 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-primary/80">-相談後の流れ</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
              最短で診断･提案までつなげます
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              チャット相談後、内容を整理して最短ルートを提案します。
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {surveySteps.map((step, index) => (
              <Card key={step.title} className="rounded-3xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <CardTitle className="text-sm">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {step.desc}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-primary/20 bg-secondary/40 p-5 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">診断の相談はLINEが最速</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    現状の困りごとを共有いただければ、診断の進め方をご案内します。
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <LineButton href={lineUrl} target="_blank" rel="noreferrer">
                  LINEで相談 <ArrowRight className="ml-2 h-4 w-4" />
                </LineButton>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/contact">フォームで相談</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            ※ LINEが使えない場合は、お問い合わせフォームで対応します。
          </div>
        </div>
      </section>
    </div>
  );
}
