import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { ProcessSection } from "@/components/sections/process-section";
import { ServiceAreaSwap } from "@/components/sections/service-area-swap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import {
  serviceAreas,
  serviceDeliverables,
  serviceExamples,
  servicePrinciples,
} from "@/content/pages/services";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "サービス",
  description:
    "新潟の中小事業者向けに、DX・業務改善・LPやWeb制作・自動化を必要最小限の範囲で支援します。",
  keywords: [
    "新潟",
    "DX",
    "IT",
    "業務改善",
    "Web制作",
    "自動化",
    "低コスト",
    "アプリ開発",
    "信頼",
    "LP制作",
    "中小事業者",
    "個人事業主",
  ],
};

export default function ServicesPage() {
  return (
    <>
      <Section
        eyebrow="サービス"
        title="Web制作から業務改善･DXまで"
        description="“作る”より先に“整理”。必要なものだけを実装して、現場で運用できる形にします。"
      >
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Badge variant="secondary" className="rounded-xl text-xs sm:text-sm">
            現場密着
          </Badge>
          <Badge
            variant="outline"
            className="rounded-xl border-primary/30 text-primary text-xs sm:text-sm"
          >
            最小構成で実装
          </Badge>
        </div>

        <Separator className="my-4 sm:my-10" />

        <ServiceAreaSwap />

        <div className="grid gap-3 md:hidden">
          {serviceAreas.map((area) => {
            const Icon = area.icon;
            return (
              <div
                key={area.title}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/70"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-cover bg-bottom opacity-30 dark:hidden"
                  style={{ backgroundImage: "url(/images/bg-3-light.png)" }}
                />
                <div
                  className="pointer-events-none absolute inset-0 hidden bg-cover bg-bottom opacity-30 dark:block"
                  style={{ backgroundImage: "url(/images/bg-3-dark.png)" }}
                />
                <MobileDisclosure
                  summary={area.title}
                  className="relative z-10 border-0 bg-transparent"
                >
                  <div className="grid gap-2">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm text-muted-foreground">{area.desc}</p>
                    </div>
                    <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                      {area.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </MobileDisclosure>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="支援スタイル"
        title="小さく始めて、成果に寄せる"
        description="不安になりやすいポイントを先に整理し、ムダな開発を避けます。"
      >
        <div className="hidden gap-4 md:grid md:grid-cols-3">
          {servicePrinciples.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="rounded-3xl">
                <CardContent className="px-6 py-1">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="grid gap-1">
                      <p className="text-lg font-medium">{p.title}</p>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {servicePrinciples.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="min-w-55 snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs leading-snug text-muted-foreground">{p.desc}</p>
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
        eyebrow="成果物のイメージ"
        title="対応範囲のイメージを先に共有します"
        description="案件ごとに違いますが、よく出る成果物を提示してズレを減らします。"
      >
        <div className="hidden gap-6 md:grid md:grid-cols-2">
          {serviceDeliverables.map((d, index) => {
            const bgImage =
              index === 0 ? "/images/bg-design-01.png" : "/images/bg-design-02.png";
            return (
              <Card key={d.title} className="relative overflow-hidden rounded-3xl">
                <div
                  className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25 dark:opacity-15 -z-10"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
                <CardHeader className="relative mb-0">
                  <CardTitle className="text-xl font-extrabold">-- {d.title} --</CardTitle>
                </CardHeader>
                <CardContent className="relative text-md dark:text-white">
                  <ul className="grid gap-1">
                    {d.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-0 h-2 w-2 rounded-full " />
                        <span className="font-bold">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="grid gap-3 md:hidden">
          {serviceDeliverables.map((d) => (
            <MobileDisclosure key={d.title} summary={d.title}>
              <ul className="grid gap-1.5 text-sm leading-snug text-muted-foreground">
                {d.items.map((item) => (
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

      <ProcessSection />

      <Section
        eyebrow="よくある相談"
        title="相談内容の例"
      >
        <div className="hidden gap-4 md:grid md:grid-cols-2">
          {serviceExamples.map((ex) => (
            <Card key={ex.title} className="rounded-3xl">
              <CardContent className="px-6 py-0.5">
                <p className="text-lg font-bold">- {ex.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{ex.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="md:hidden">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {serviceExamples.map((ex) => (
              <div
                key={ex.title}
                className="min-w-55 snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
              >
                <p className="text-sm font-medium">{ex.title}</p>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{ex.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">左右にスワイプして確認できます。</p>
        </div>

        <div className="mt-4 sm:mt-8 rounded-3xl border border-primary/20 bg-secondary/40 p-5 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <p className="text-md sm:text-2xl font-medium">まずは現状だけ共有してください!
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                「困っていること･理想･制約」を共有してもらえれば、
                最短の改善案と進め方を提案します。
              </p>
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3 md:justify-end">
              <Button asChild className="rounded-xl">
                <Link href="/contact">
                  お問合せへ <ArrowRight className="sm:ml-2 h-4 w-4" />
                </Link>
              </Button>
              <LineButton href="/survey">LINEで相談</LineButton>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
