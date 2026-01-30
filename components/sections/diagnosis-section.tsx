import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import {
  diagnosisComparisons,
  diagnosisDeliverables,
  diagnosisFreeConditions,
  diagnosisOutcomes,
} from "@/content/sections/diagnosis";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

export function DiagnosisSection({ className }: { className?: string }) {
  const lineUrl = site.line?.surveyUrl ?? "https://lin.ee/8uHdH0Y";

  return (
    <section id="diagnosis" className={cn("py-6 sm:py-18", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary/80">業務診断</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-xl">
                無料診断（条件あり）
              </Badge>
              <Badge variant="outline" className="rounded-xl">
                推奨IT + 見積まで
              </Badge>
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
              条件により無料で受けられる「業務診断」
            </h2>
            <p className="mt-0.5 sm:mt-3 max-w-2xl text-sm text-muted-foreground">
              無料診断は条件によりご利用いただけます。お問い合わせや簡易ヒアリングとは違い、現状を詳細に把握し、
              推奨ITの提案と概算見積まで行う“診断”です。
            </p>
          </div>

          {/* <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-xl">
              <Link href={lineUrl} target="_blank" rel="noreferrer">
                LINEで業務診断を相談 <ArrowRight className="sm:ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/contact">お問い合わせ</Link>
            </Button>
          </div> */}
        </div>

        <Separator className="my-4 sm:my-10" />

        {/* Outcomes */}
        <div className="hidden gap-2 sm:gap-4 md:grid md:grid-cols-2">
          {diagnosisOutcomes.map((o) => {
            const Icon = o.icon;
            return (
              <Card key={o.title} className="rounded-3xl">
                <CardHeader className="space-y-0 sm:p-2">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary sm:h-10 sm:w-10">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="grid gap-1">
                      <CardTitle className="text-base">{o.title}</CardTitle>
                      <p className="text-sm leading-snug text-muted-foreground">{o.desc}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {diagnosisOutcomes.map((o) => {
              const Icon = o.icon;
              return (
                <div
                  key={o.title}
                  className="min-w-55 snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
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
                    <Badge variant="outline" className="rounded-xl">
                      条件により無料
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
              </div>
            </MobileDisclosure>
          ))}
        </div>

        <div className="mt-8 hidden gap-3 lg:grid lg:grid-cols-[1.2fr_1fr]">
          <Card className="relative overflow-hidden rounded-3xl">
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-bottom opacity-35 dark:hidden"
              style={{ backgroundImage: "url(/images/bg-2-light.png)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 hidden bg-cover bg-bottom opacity-35 dark:block"
              style={{ backgroundImage: "url(/images/bg-2-dark.png)" }}
            />
            <CardHeader className="relative pt-1 pb-0 sm:px-6">
              <CardTitle className="text-xl">診断で得られること</CardTitle>
            </CardHeader>
            <CardContent className="relative pt-0 text-sm text-muted-foreground">
              <ul className="grid gap-1 leading-snug">
                {diagnosisDeliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ClipboardCheck className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-3xl">
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-bottom opacity-35 dark:hidden"
              style={{ backgroundImage: "url(/images/bg-2-light.png)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 hidden bg-cover bg-bottom opacity-35 dark:block"
              style={{ backgroundImage: "url(/images/bg-2-dark.png)" }}
            />
            <CardHeader className="relative pt-1 pb-0 sm:px-6">
              <CardTitle className="text-xl">無料条件(目安)</CardTitle>
            </CardHeader>
            <CardContent className="relative pt-0 text-sm text-muted-foreground">
              <ul className="grid gap-1 leading-snug">
                {diagnosisFreeConditions.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                ※ 条件や範囲は案件ごとに異なります。詳細は相談時にご案内します。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-3 lg:hidden">
          <MobileDisclosure summary="診断で得られること">
            <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
              {diagnosisDeliverables.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </MobileDisclosure>

          <MobileDisclosure summary="無料になる条件(目安)">
            <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
              {diagnosisFreeConditions.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              ※ 条件や範囲は案件ごとに異なります。詳細は相談時にご案内します。
            </p>
          </MobileDisclosure>
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
              <Button asChild className="rounded-xl">
                <Link href={lineUrl} target="_blank" rel="noreferrer">
                  LINEで相談 <ArrowRight className="sm:ml-2 h-4 w-4" />
                </Link>
              </Button>
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
