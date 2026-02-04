import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import {
  diagnosisComparisons,
  diagnosisOutcomes,
} from "@/content/sections/diagnosis";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function DiagnosisSection({ className }: { className?: string }) {
  const lineUrl = site.line?.surveyUrl ?? "https://lin.ee/8uHdH0Y";
  const deliverableBubbles = [
    {
      lines: ["診断サマリー", "（現状/課題/優先事項）"],
    },
    {
      lines: ["推奨IT/サービス", "の提案"],
    },
    {
      lines: ["概算見積", "進行プラン"],
    },
    {
      lines: ["次のアクション", "提案"],
    },
  ];

  return (
    <section id="diagnosis" className={cn("py-6 sm:py-18", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary/80">-業務診断</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-xl">
                無料診断(条件あり)
              </Badge>
              <Badge variant="outline" className="rounded-xl">
                推奨IT+見積まで
              </Badge>
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-3xl">
              契約前に「業務診断」
            </h2>
            <p className="hidden sm:block mt-0.5 sm:mt-3 w-auto text-xs sm:text-base text-muted-foreground">
              お問い合わせや簡易ヒアリングとは違い、現状を詳細に把握し、
              推奨ITの提案と概算見積まで行う“診断”です。
            </p>
          </div>
        </div>

        <Separator className="my-4 sm:my-10" />

        {/* Outcomes */}
        <div className="hidden md:block">
          <ol className="grid gap-4 md:grid-cols-4">
            {diagnosisOutcomes.map((o, index) => {
              const step = String(index + 1).padStart(2, "0");
              return (
                <li
                  key={o.title}
                  className="relative md:pr-8 md:after:absolute md:after:right-3 md:after:top-5 md:after:h-px md:after:w-6 md:after:bg-border/70 md:last:after:hidden"
                >
                  <div className="grid gap-2">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                      STEP {step}
                    </span>
                  </div>
                    <p className="text-lg font-semibold">{o.title}</p>
                    <p className="text-sm leading-snug text-muted-foreground">{o.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {diagnosisOutcomes.map((o, index) => {
              const step = String(index + 1).padStart(2, "0");
              return (
                <div
                  key={o.title}
                  className="min-w-55 snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                      {step}
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">{o.title}</p>
                      <p className="text-xs leading-snug text-muted-foreground">{o.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">左右にスワイプで確認</p>
        </div>

        <div className="mt-8 hidden gap-3 sm:gap-4 md:grid md:grid-cols-2">
          {diagnosisComparisons.map((c) => (
            <Card key={c.title} className="relative overflow-hidden rounded-3xl">
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-bottom opacity-35 dark:hidden"
                style={{ backgroundImage: "url(/images/bg-2-light.png)" }}
              />
              <div
                className="pointer-events-none absolute inset-0 hidden bg-cover bg-bottom opacity-35 dark:block"
                style={{ backgroundImage: "url(/images/bg-2-dark.png)" }}
              />
              <CardHeader className="relative space-y-1 pt-1 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3>
                    <Badge variant="secondary" className="rounded-xl text-sm font-medium">
                      {c.title}
                    </Badge>
                  </h3>
                  {c.title.includes("業務診断") ? (
                    <Badge asChild variant="outline" className="rounded-xl">
                      <Link href="/niigata#free-conditions">条件により無料</Link>
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm leading-snug text-muted-foreground">{c.desc}</p>
              </CardHeader>
              <CardContent className="relative pt-0 text-sm text-muted-foreground">
                <ul className="grid gap-1.5 leading-snug">
                  {c.items.map((item) => (
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

        <div className="mt-8 grid gap-3 md:hidden">
          {diagnosisComparisons.map((c) => (
            <MobileDisclosure key={c.title} summary={c.title}>
              <div className="grid gap-2">
                <p className="text-sm text-foreground">{c.desc}</p>
                <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                  {c.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {c.title.includes("業務診断") ? (
                  <div className="pt-1">
                    <Badge asChild variant="outline" className="rounded-xl">
                      <Link href="/niigata#free-conditions">条件により無料</Link>
                    </Badge>
                  </div>
                ) : null}
              </div>
            </MobileDisclosure>
          ))}
        </div>

        <div className="mt-8">
          <div>
            <p className="text-sm font-medium text-primary/80">-診断で得られること</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
              <span className="hidden sm:block">内容が一目で分かる</span><span className="underline">4つ</span>の成果
            </h3>
          </div>

          <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
            {deliverableBubbles.map((item, index) => (
              <div
                key={item.lines.join("")}
                className="relative flex aspect-square min-h-10 items-center justify-center rounded-full border border-primary/25 bg-background/70 p-2 text-center sm:min-h-30 lg:min-h-40"
              >
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-8xl sm:text-[128px] font-semibold text-primary/10 lg:text-[192px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative z-5 text-sm font-semibold leading-snug text-foreground sm:text-base lg:text-xl">
                  {item.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 sm:mt-8 rounded-3xl border border-primary/20 bg-secondary/40 p-3 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <p className="text-sm font-medium">診断の第一歩はLINEから</p>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                相談内容が不鮮明でもOK。現状を共有いただければ、診断の進め方をご案内します。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <LineButton href={lineUrl} target="_blank" rel="noreferrer">
                LINEで相談 <ArrowRight className="sm:ml-2 h-4 w-4" />
              </LineButton>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/survey">相談について</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
