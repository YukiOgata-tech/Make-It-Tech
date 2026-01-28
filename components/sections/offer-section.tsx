import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { offerPrinciples, offers } from "@/content/sections/offer";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

export function OfferSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-6 sm:py-18", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary/80">サービス/料金の目安</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
              可能範囲と価格レンジをまとめて提示します
            </h2>
            <p className="mt-0.5 sm:mt-3 max-w-2xl text-base text-muted-foreground">
              固定プランは置かず、内容に合わせて柔軟に見積もります。
              まずは「現状･理想･制約」を整理して、最短の改善案を提案します。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/services">詳細を見る</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/contact">
                お問合せへ <ArrowRight className="sm:ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="my-4 sm:my-10" />

        {/* Principles */}
        <div className="hidden gap-2 sm:gap-4 md:grid md:grid-cols-3">
          {offerPrinciples.map((p) => (
            <Card key={p.title} className="rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:items-start">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary sm:h-10 sm:w-10">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {offerPrinciples.map((p) => (
              <div
                key={p.title}
                className="min-w-55 snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
              >
                <p className="text-sm font-medium">{p.title}</p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">左右にスワイプで確認</p>
        </div>

        {/* Offers */}
        <div className="mt-8 hidden gap-4 lg:grid lg:grid-cols-2">
          {offers.map((o, index) => {
            const Icon = o.icon;
            return (
              <FadeIn key={o.title} delay={0.05 * index}>
                <Card className="relative overflow-hidden rounded-3xl">
                  <div className="pointer-events-none absolute inset-0 bg-[url('/images/bg-light.png')] bg-cover bg-center opacity-50 dark:bg-[url('/images/bg-dark.png')]" />
                  <CardHeader className="relative space-y-1.5 sm:space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid gap-2">
                        <CardTitle className="text-base tracking-tight sm:text-lg">
                          {o.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-xl">
                            {o.range}
                          </Badge>
                          <Badge variant="outline" className="rounded-xl">
                            目安
                          </Badge>
                        </div>
                      </div>

                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-sm sm:h-10 sm:w-10">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="text-sm leading-snug text-muted-foreground">
                      {o.summary}
                    </p>
                  </CardHeader>

                  <CardContent className="relative grid gap-2 sm:gap-3">
                    <div className="hidden rounded-2xl border border-border/70 bg-background/70 p-4 md:block">
                      <p className="text-sm font-medium">含まれること(例)</p>
                      <ul className="mt-1.5 grid gap-1.5 text-sm leading-snug text-muted-foreground">
                        {o.includes.map((x) => (
                          <li key={x} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="hidden rounded-2xl border border-primary/10 bg-secondary/30 p-4 md:block">
                      <p className="text-sm font-medium">変動要因(例)</p>
                      <ul className="mt-1.5 grid gap-1.5 text-sm leading-snug text-muted-foreground">
                        {o.notes.map((x) => (
                          <li key={x} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary/60" />
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="hidden flex-wrap gap-3 md:flex">
                      <Button asChild className="rounded-xl">
                        <Link href="/contact">
                          この内容で相談 <ArrowRight className="sm:ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/pricing">料金ページへ</Link>
                      </Button>
                    </div>

                    <p className="hidden text-xs text-muted-foreground md:block">
                      ※ 上記は目安です。範囲を合意してから見積もります。
                    </p>

                    <div className="md:hidden">
                      <MobileDisclosure summary="詳細を見る">
                        <div className="grid gap-2">
                          <div className="grid gap-2">
                            <p className="text-sm font-medium">含まれること(例)</p>
                            <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                              {o.includes.map((x) => (
                                <li key={x} className="flex items-start gap-2">
                                  <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                                  <span>{x}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid gap-2">
                            <p className="text-sm font-medium">変動要因(例)</p>
                            <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                              {o.notes.map((x) => (
                                <li key={x} className="flex items-start gap-2">
                                  <span className="mt-1 h-2 w-2 rounded-full bg-primary/60" />
                                  <span>{x}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid gap-3">
                            <Button asChild className="rounded-xl">
                              <Link href="/contact">
                                この内容で相談 <ArrowRight className="sm:ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-xl">
                              <Link href="/pricing">料金ページへ</Link>
                            </Button>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            ※ 上記は目安です。範囲を合意してから見積もります。
                          </p>
                        </div>
                      </MobileDisclosure>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>

        <div className="mt-6 md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3">
            {offers.map((o) => {
              const Icon = o.icon;
              return (
                <div
                  key={o.title}
                  className="relative min-w-65 snap-center overflow-hidden rounded-3xl border border-border/70 bg-background/80 p-4"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[url('/images/bg-light.png')] bg-cover bg-center opacity-50 dark:bg-[url('/images/bg-dark.png')]" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid gap-1">
                        <p className="text-sm font-medium">{o.title}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-xl text-xs">
                            {o.range}
                          </Badge>
                          <Badge variant="outline" className="rounded-xl text-xs">
                            目安
                          </Badge>
                        </div>
                      </div>
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <p className="mt-2 text-xs leading-snug text-muted-foreground">
                      {o.summary}
                    </p>

                    <div className="mt-3">
                      <MobileDisclosure summary="詳細を見る">
                        <div className="grid gap-2">
                          <div className="grid gap-2">
                            <p className="text-sm font-medium">含まれること(例)</p>
                            <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                              {o.includes.map((x) => (
                                <li key={x} className="flex items-start gap-2">
                                  <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                                  <span>{x}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid gap-2">
                            <p className="text-sm font-medium">変動要因(例)</p>
                            <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                              {o.notes.map((x) => (
                                <li key={x} className="flex items-start gap-2">
                                  <span className="mt-1 h-2 w-2 rounded-full bg-primary/60" />
                                  <span>{x}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid gap-2">
                            <Button asChild className="rounded-xl">
                              <Link href="/contact">
                                この内容で相談 <ArrowRight className="sm:ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-xl">
                              <Link href="/pricing">料金ページへ</Link>
                            </Button>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            ※ 上記は目安です。範囲を合意してから見積もります。
                          </p>
                        </div>
                      </MobileDisclosure>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">左右にスワイプで確認</p>
        </div>

        {/* Bottom note */}
        <div className="mt-5 sm:mt-10 rounded-3xl border border-primary/20 bg-secondary/40 py-4 px-6 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium">まずは「困りごと」だけでOK</p>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                開発の必要性も含めて判断します。既存ツールで済むなら、開発しません。
                まずは現状を共有してください。
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-3">
              <Button asChild className="rounded-xl">
                <Link href="/contact">
                  お問合せへ <ArrowRight className="sm:ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/survey">LINEで相談</Link>
              </Button>
            </div>
          </div>

          <div className="mt-3 sm:mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            <span>
              詳細や注意事項は <Link href="/terms" className="underline underline-offset-2">利用規約</Link> /
              <Link href="/privacy" className="underline underline-offset-2 ml-1">プライバシー</Link> をご確認ください。
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
