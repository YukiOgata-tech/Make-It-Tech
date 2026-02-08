import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { processGuarantees, processSteps, type ProcessStep } from "@/content/sections/process";
import { ArrowRight } from "lucide-react";

function CardBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/bg-light.png')] bg-cover bg-center opacity-15 saturate-80 brightness-110 dark:bg-[url('/images/bg-dark.png')] dark:opacity-18 dark:brightness-90"
      />
    </>
  );
}

function StepCard({ s, compact = false }: { s: ProcessStep; compact?: boolean }) {
  const Icon = s.icon;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border bg-card/85 shadow-sm backdrop-blur",
        compact ? "rounded-2xl" : "rounded-3xl"
      )}
    >
      <CardBackdrop />
      <CardHeader className={cn(compact ? "space-y-2 px-4" : "space-y-3 p-5 sm:px-6 ")}>
        <div className="relative flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.step}</p>
            <CardTitle className="text-base tracking-tight sm:text-lg font-extrabold text-slate-950 dark:text-white">
              {s.title}
            </CardTitle>
          </div>

          <div
            className={cn(
              "inline-flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-sm",
              compact ? "h-9 w-9" : "h-10 w-10"
            )}
          >
            <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
          </div>
        </div>

        <p
          className={cn(
            "text-slate-700 dark:text-slate-200",
            compact ? "text-xs leading-snug" : "text-sm leading-relaxed"
          )}
        >
          {s.desc}
        </p>
      </CardHeader>

      <CardContent className={cn("relative grid", compact ? "gap-3 p-4 pt-0" : "gap-4 p-5 pt-0 sm:p-6 sm:pt-0")}>
        {s.decision && (
          <div className="hidden rounded-2xl border border-primary/10 bg-secondary/30 p-4 md:block">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-xl">
                {s.decision.label}
              </Badge>
              <p className="text-sm font-medium">意思決定ポイント</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.decision.note}</p>
          </div>
        )}

        <div className="hidden rounded-2xl border border-border/70 bg-background/70 p-4 md:block">
          <p className="text-sm font-medium">アウトプット</p>
          <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
            {s.outputs.map((o) => (
              <li key={o} className="flex items-start gap-1 sm:gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 md:hidden">
          {s.decision ? (
            <MobileDisclosure summary="意思決定ポイント">
              <div className="grid gap-2">
                <Badge variant="secondary" className="w-fit rounded-xl">
                  {s.decision.label}
                </Badge>
                <p>{s.decision.note}</p>
              </div>
            </MobileDisclosure>
          ) : null}
          <MobileDisclosure summary="アウトプット">
            <ul className="grid gap-2">
              {s.outputs.map((o) => (
                <li key={o} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </MobileDisclosure>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProcessSection({ className }: { className?: string }) {
  return (
    <section id="process" className={cn("py-14 sm:py-18", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary/80">-進め方</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-3xl">
              迷わないために、手順と判断ポイントを明確にします
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
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
                無料相談へ <ArrowRight className="sm:ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="my-3 sm:my-10" />

        {/* Steps */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-2">
          {processSteps.map((s, index) => (
            <FadeIn key={s.step} delay={0.05 * index}>
              <StepCard s={s} />
            </FadeIn>
          ))}
        </div>
        <div className="lg:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {processSteps.map((s) => (
              <div key={s.step} className="min-w-70 snap-center">
                <StepCard s={s} compact />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">左右にスワイプで確認</p>
        </div>

        {/* Guarantees + CTA */}
        <div className="mt-10 hidden gap-4 md:grid md:grid-cols-3 md:items-stretch">
          <div className="grid gap-4 md:col-span-2">
            {processGuarantees.map((g) => (
              <Card key={g.title} className="relative overflow-hidden rounded-3xl border bg-card/85 shadow-sm backdrop-blur">
                <CardBackdrop />
                <CardContent className="relative p-3 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <g.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{g.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{g.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="relative overflow-hidden rounded-3xl border bg-card/85 shadow-sm backdrop-blur">
            <CardBackdrop />
            <CardContent className="relative p-6 gap-3">
              <p className="text-sm font-medium">まずはここから</p>
              <p className="mt-2 text-sm text-muted-foreground">
                現状の困りごとを3つ書ければOK。
                最短の改善案を作って、必要なら実装まで進めます。
              </p>

              <div className="mt-5 grid gap-3">
                <Button asChild className="rounded-xl">
                  <Link href="/contact">
                    お問合せ <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <LineButton href="/survey">LINEで相談</LineButton>
              </div>

              <div className="mt-3 sm:mt-6 rounded-2xl bg-secondary/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">TIP</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  “開発が必要か”から一緒に判断できます。既存ツールで済むなら、開発しません。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 grid gap-3 md:hidden">
          {processGuarantees.map((g) => (
            <div
              key={g.title}
              className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-4"
            >
              <CardBackdrop />
              <div className="relative flex items-start gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                  <g.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{g.title}</p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">{g.desc}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-4">
            <CardBackdrop />
            <div className="relative">
              <p className="text-sm font-medium leading-snug">まずはここから</p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                現状の困りごとを3つ書ければOK。最短の改善案を作って、必要なら実装まで進めます。
              </p>

              <div className="mt-4 grid gap-2">
                <Button asChild className="rounded-xl">
                  <Link href="/contact">
                    お問合せへ <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <LineButton href="/survey">LINEで相談</LineButton>
              </div>

              <MobileDisclosure summary="TIP" className="mt-2">
                <p className="text-sm text-muted-foreground">
                  “開発が必要か”から一緒に判断できます。既存ツールで済むなら、開発しません。
                </p>
              </MobileDisclosure>
            </div>
          </div>
        </div>

        {/* small note */}
        <div className="mt-4 sm:mt-8 text-xs text-muted-foreground">
          ※ 具体的な進め方・成果物・範囲は案件により調整します。無理に大きく作らず、最小構成で効果を検証します。
        </div>
      </div>
    </section>
  );
}
