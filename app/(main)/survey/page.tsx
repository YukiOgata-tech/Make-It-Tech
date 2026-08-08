import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { SiLine } from "react-icons/si";
import { site } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LineButton } from "@/components/ui/line-button";
import {
  surveyExamples,
  surveyFaqs,
  surveyHighlights,
  surveySteps,
} from "@/content/pages/survey";

const lineUrl = site.line?.surveyUrl ?? "https://lin.ee/8uHdH0Y";

export const metadata: Metadata = {
  title: "LINEでIT・Webのちょっとした相談 | Make It Tech",
  description:
    "Make It Techの公式LINEでは、Webサイトの修正、ITツールの設定、業務改善、システムやアプリの相談まで、細かい困りごとをいつでも受け付けています。",
  keywords: [
    "LINE相談",
    "IT相談",
    "Web相談",
    "ホームページ修正",
    "業務改善",
    "新潟",
  ],
};

export default function SurveyPage() {
  return (
    <div className="overflow-hidden pb-12 sm:pb-20">
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-aurora opacity-55" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
        <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#06C755]/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-9 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14 lg:px-8 lg:py-20">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-[#06C755]/30 bg-[#06C755]/10 px-3 py-1 text-[#048a3c] dark:text-[#7beaa7]"
            >
              <span className="mr-1.5 size-2 rounded-full bg-[#06C755]" />
              公式LINEで受付中
            </Badge>

            <h1 className="mt-5 max-w-2xl text-[2.15rem] font-semibold leading-[1.12] tracking-tight sm:mt-6 sm:text-5xl sm:leading-[1.1] lg:text-[3.5rem]">
              ちょっと聞きたい、
              <span className="mt-1 block text-[#05a849] dark:text-[#70e89e]">
                をLINEで。
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              WebサイトやITツール、日々の業務の小さな困りごとまで。
              相談内容がまとまっていなくても、気になったときにそのままメッセージしてください。
            </p>

            <div className="mt-7 sm:mt-8">
              <LineButton
                href={lineUrl}
                size="lg"
                className="h-12 w-full rounded-2xl px-7 text-base sm:w-auto"
                target="_blank"
                rel="noreferrer"
              >
                LINEで相談をはじめる
                <ArrowRight className="ml-1 size-4" />
              </LineButton>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="size-3.5 text-[#06C755]" />
                送信は24時間いつでもOK・返信は平日10:00〜19:00目安
              </p>
            </div>

            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline decoration-border underline-offset-4 transition hover:text-foreground"
            >
              LINEを使えない方はお問い合わせフォームへ
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-[#06C755]/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/90 shadow-2xl shadow-black/10 backdrop-blur">
              <div className="flex items-center gap-3 border-b border-border/60 bg-[#06C755] px-5 py-4 text-white">
                <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#06C755] shadow-sm">
                  <SiLine className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{site.name}</p>
                  <p className="text-[11px] text-white/80">通常は営業時間内に返信します</p>
                </div>
              </div>

              <div className="min-h-[320px] bg-secondary/25 px-4 py-6 sm:px-5">
                <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-[#06C755] px-4 py-3 text-sm leading-6 text-white shadow-sm">
                  ホームページの文章を少しだけ直したいのですが、相談できますか？
                </div>
                <p className="mt-1 text-right text-[10px] text-muted-foreground">10:24</p>

                <div className="mt-5 flex items-end gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#06C755] text-white">
                    <MessageCircle className="size-4" />
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-bl-sm border border-border/60 bg-background px-4 py-3 text-sm leading-6 shadow-sm">
                    もちろんです！URLと気になる箇所を送ってください。内容を確認します。
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2.5 text-xs text-muted-foreground shadow-sm">
                  <span className="flex-1">メッセージを入力</span>
                  <Send className="size-4 text-[#06C755]" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-2 hidden items-center gap-2 rounded-2xl border border-border/60 bg-background/95 px-4 py-3 text-xs font-medium shadow-lg backdrop-blur sm:flex">
              <Sparkles className="size-4 text-primary" />
              こんな小さな相談でもOK
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#05a849] dark:text-[#70e89e]">
              TALK TO US
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              どんな内容でも、まずはひとこと
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              大きな依頼だけでなく、部分的な修正や設定、アイデア段階の相談も受け付けています。
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:mt-9 lg:grid-cols-3">
            {surveyExamples.map((example) => (
              <div
                key={example}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur"
              >
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#06C755]/12 text-[#05a849] dark:text-[#70e89e]">
                  <MessageCircle className="size-3.5" />
                </div>
                <p className="text-sm leading-6">{example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-secondary/20 py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {surveyHighlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <Card
                  key={highlight.title}
                  className="rounded-3xl border-border/60 bg-background/75 shadow-sm"
                >
                  <CardContent className="flex gap-4 px-5 py-2 sm:block sm:px-6 sm:py-1">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#06C755]/12 text-[#05a849] dark:text-[#70e89e]">
                      <Icon className="size-5" />
                    </div>
                    <div className="sm:mt-5">
                      <h3 className="text-base font-semibold">{highlight.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        {highlight.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#05a849] dark:text-[#70e89e]">
                HOW IT WORKS
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                相談は3ステップ
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                長い入力フォームはありません。LINEを追加して、気になることを送るだけです。
              </p>
            </div>

            <ol className="grid gap-3">
              {surveySteps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2.75rem_1fr] gap-4 rounded-2xl border border-border/60 bg-background/70 p-4 sm:grid-cols-[3rem_1fr] sm:p-5"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#06C755] text-sm font-semibold text-white shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-border/60 bg-background/70 p-5 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              よくある質問
            </h2>
            <div className="mt-5 divide-y divide-border/60">
              {surveyFaqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <span className="mt-0.5 text-lg leading-none text-[#05a849] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl pr-8 text-sm leading-7 text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#06C755] px-5 py-9 text-white shadow-xl shadow-[#06C755]/15 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border-[40px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/75">気になった今が、相談どき。</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                まずはLINEで話してみませんか？
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">
                依頼内容が決まっていなくても大丈夫です。状況に合わせて、次にできることを一緒に考えます。
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-2xl bg-white px-7 text-base text-[#048a3c] shadow-lg hover:bg-white/90 md:w-auto"
            >
              <Link href={lineUrl} target="_blank" rel="noreferrer">
                <SiLine className="size-5" aria-hidden="true" />
                LINEで相談する
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
