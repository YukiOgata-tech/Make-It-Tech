import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProcessSection } from "@/components/sections/process-section";
import { ServiceHeroImage } from "@/components/sections/service-hero-image";
import { ServiceAreaSwap } from "@/components/sections/service-area-swap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  serviceExamples,
  servicePrinciples,
} from "@/content/pages/services";
import { ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "新潟のIT・DX支援・Web制作",
  },
  description:
    "新潟の中小事業者向けに、DX・業務改善・LPやWeb制作・自動化を必要最小限の範囲で支援します。",
  keywords: [
    "新潟", "niigata","ベンチャー","生成AI","AI","人工知能",
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
      <section className="py-3 sm:py-16">
        <Container>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div>
              <div>
                <p className="text-sm font-medium text-primary/80">-サービス</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-3xl">
                  Web制作からDX支援まで、必要な形で対応します
                </h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-md">
                  HP/LP制作、アプリ、社内システム、ツール導入、補助金まわりまで、目的に合わせて支援範囲を組み立てます。
                </p>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3 sm:mt-5 sm:block">
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
                <ServiceHeroImage className="aspect-[3/2] w-24 shrink-0 sm:hidden" />
              </div>
            </div>

            <ServiceHeroImage className="hidden aspect-[3/2] w-full lg:block" />
          </div>

          <Separator className="my-4 sm:my-10" />

          <ServiceAreaSwap />
        </Container>
      </section>

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
        eyebrow="制作・支援実績"
        title="実際の制作・支援内容は実績ページで確認できます"
        description="サービスの詳細な成果物一覧ではなく、実際にどのような相談・制作・改善に対応しているかを実績として掲載しています。"
      >
        <div className="border-y border-border/70 bg-background/80 p-4 sm:rounded-3xl sm:border sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-base font-semibold sm:text-xl">
                Web制作、システム開発、DX支援の具体例を掲載しています
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                依頼前にイメージしやすいよう、公開できる範囲で制作・支援実績をまとめています。
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button asChild className="rounded-xl">
                <Link href="/works">
                  実績を見る <ArrowRight className="sm:ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/contact">
                  相談する <ExternalLink className="sm:ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
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
