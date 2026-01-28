import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExperienceDeck } from "@/components/sections/experience-deck";
import {
  aboutActivities,
  aboutHighlights,
  aboutOverviewItems,
} from "@/content/pages/about";

export const metadata: Metadata = {
  title: "事業所概要",
  description:
    "Make It Tech の事業概要。現在は新潟の中小事業者向けに、ITによるアプローチ、DX・業務支援を行います。",
  keywords: [
    "新潟", "niigata", "新潟市", "地域創生", "",
    "DX",
    "IT",
    "業務改善",
    "丁寧",
    "信頼",
    "Web制作",
    "事業所概要",
  ],
};

export default function AboutPage() {
  return (
    <>
      <Section
        eyebrow="事業所概要"
        title="Make It Techについて"
        description="現場で“本当に使える”仕組みを作ることを第一に、DX支援・業務改善を行います。"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-xl">
            事業所概要
          </Badge>
          <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
            2025年6月開始
          </Badge>
        </div>

        <div className="mt-6 grid gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-4">
          <div className="h-full rounded-2xl border border-border/60 bg-background/70 p-4 sm:rounded-3xl sm:p-5 lg:p-6">
            <p className="text-sm font-medium leading-snug">基本情報</p>
            <dl className="mt-3 grid gap-2 text-xs leading-snug sm:gap-3 sm:text-sm">
              {aboutOverviewItems.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-0.5 sm:grid-cols-[120px_1fr] sm:gap-1"
                >
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[11px] leading-snug text-muted-foreground sm:mt-4 sm:text-xs">
              ※ 所在地・連絡先は案件に応じてご案内します。
            </p>
          </div>

          <div className="h-full rounded-2xl border border-border/60 bg-background/70 p-4 sm:rounded-3xl sm:p-5 lg:p-6">
            <p className="text-sm font-medium leading-snug">支援の特徴</p>
            <div className="mt-3 grid gap-2 text-xs leading-snug text-muted-foreground sm:gap-3 sm:text-sm sm:leading-relaxed">
              {aboutHighlights.map((h) => (
                <div key={h.title} className="grid gap-0.5 sm:gap-1">
                  <p className="text-sm font-medium text-foreground">
                    {h.title}
                  </p>
                  <p className="text-muted-foreground">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="実績"
        title="対応実績の概要"
        description="昨年度からの支援実績をご参考ください。"
      >
        <ExperienceDeck />
      </Section>

      <Section
        eyebrow="代表プロフィール"
        title="尾形友輝"
        description="現場理解と実装力の両方を重視し、最短で成果につながる支援を行います。"
      >
        <div className="grid gap-2 sm:gap-3 md:grid-cols-[1fr_2fr] md:gap-4">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 sm:rounded-3xl sm:p-5 md:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold sm:h-14 sm:w-14">
                OT
              </div>
              <div>
                <p className="text-sm font-medium">代表取締役</p>
                <p className="text-lg font-semibold">尾形友輝</p>
              </div>
            </div>
            <Separator className="my-3 sm:my-4" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Web制作・業務改善・自動化の実務支援を中心に、現場が回る運用設計を重視。
              必要最小限の構成から始め、成果が見えた段階で拡張するスタイルです。
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 sm:rounded-3xl sm:p-5 md:p-6">
            <p className="text-sm font-medium leading-snug">支援スタンス</p>
            <div className="mt-3 grid gap-2 text-xs leading-snug text-muted-foreground sm:gap-3 sm:text-sm sm:leading-relaxed">
              <p>・作る前に整理し、必要なら実装へ。</p>
              <p>・既存ツールで解決できるなら、開発しません。</p>
              <p>・現場で運用できる形を最優先します。</p>
              <p>・成果が出た分だけ、次に投資できる設計へ。</p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="活動・メディア"
        title="現場の信頼を積み重ねるために"
        description="相談しやすさと透明性を重視し、情報発信にも取り組んでいます。"
      >
        <div className="grid gap-2 sm:gap-3 md:grid-cols-3 md:gap-4">
          {aboutActivities.map((a) => (
            <div
              key={a.title}
              className="h-full rounded-2xl border border-border/60 bg-background/70 p-4 sm:rounded-3xl sm:p-5 md:p-6"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary sm:h-10 sm:w-10">
                <a.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="mt-3 text-sm font-medium leading-snug sm:mt-4">
                {a.title}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed">
                {a.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <p className="text-sm font-medium">まずは話してみる</p>
              <p className="mt-2 text-sm text-muted-foreground">
                「現状の困りごと」だけでもOKです。無料相談で最短の改善案を整理します。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild className="rounded-xl">
                <Link href="/contact">無料相談へ</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/survey">LINEで相談</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
