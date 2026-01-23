import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/site";
import {
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Sparkles,
  Video,
} from "lucide-react";

const overviewItems = [
  { label: "屋号", value: "Make It Tech" },
  { label: "開始", value: "2025年" },
  { label: "代表取締役", value: "尾形友輝" },
  { label: "事業内容", value: "Web制作 / 業務改善 / 自動化 / DX支援" },
  { label: "拠点", value: "新潟県（詳細は打合せ時に共有）" },
  { label: "連絡先", value: site.contact.email },
];

const highlights = [
  {
    title: "現場起点のDX支援",
    desc: "課題整理から運用まで、現場で“回る形”を最短で作ります。",
    icon: Sparkles,
  },
  {
    title: "小さく始めて検証",
    desc: "最小構成で効果を確認し、必要な分だけ拡張します。",
    icon: ClipboardCheck,
  },
  {
    title: "地域密着・相談重視",
    desc: "新潟県内の中小事業者に寄り添った支援を前提に設計します。",
    icon: Building2,
  },
];

const timeline = [
  {
    period: "2018 - 2019",
    title: "現場の課題整理・業務改善支援",
    desc: "店舗・小規模事業の業務フロー整理や入力ルール設計を担当（ダミー）。",
  },
  {
    period: "2020 - 2022",
    title: "Web制作・フォーム設計の実務",
    desc: "集客LPや問い合わせ導線の改善、フォーム統合の実装を経験（ダミー）。",
  },
  {
    period: "2023 - 2024",
    title: "小規模DXの伴走支援",
    desc: "LINE/シート/自動化の運用設計を中心に成果改善を支援（ダミー）。",
  },
  {
    period: "2025 -",
    title: "Make It Tech として事業開始",
    desc: "新潟県内の中小事業者向けに、DX推進・業務改善支援を本格展開。",
  },
];

const activities = [
  {
    title: "YouTube出演",
    desc: "就活neo というYouTubeコンテンツに出演。",
    icon: Video,
  },
  {
    title: "現場ヒアリング",
    desc: "現状の困りごとを整理し、改善の優先順位を短時間で可視化。",
    icon: CalendarCheck,
  },
  {
    title: "支援スタイル",
    desc: "無理に開発せず、既存ツールで解決できるなら“作らない”判断も。",
    icon: ClipboardCheck,
  },
];

export const metadata: Metadata = {
  title: "事業所概要",
  description:
    "Make It Tech の事業所概要。新潟の中小事業者向けに、丁寧で信頼重視のDX・業務改善支援を行います。",
  keywords: [
    "新潟",
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
            2025年開始
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm">
                {overviewItems.map((item) => (
                  <div
                    key={item.label}
                    className="grid gap-1 sm:grid-cols-[120px_1fr]"
                  >
                    <dt className="text-muted-foreground">{item.label}</dt>
                    <dd className="font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                ※ 所在地・連絡先は案件に応じてご案内します。
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {highlights.map((h) => (
              <Card key={h.title} className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <h.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{h.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {h.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="代表プロフィール"
        title="尾形友輝"
        description="現場理解と実装力の両方を重視し、最短で成果につながる支援を行います。"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
                  OT
                </div>
                <div>
                  <p className="text-sm font-medium">代表取締役</p>
                  <p className="text-lg font-semibold">尾形友輝</p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                Web制作・業務改善・自動化の実務支援を中心に、現場が回る運用設計を重視。
                必要最小限の構成から始め、成果が見えた段階で拡張するスタイルです。
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">支援スタンス</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <p>・作る前に整理し、必要なら実装へ。</p>
              <p>・既存ツールで解決できるなら、開発しません。</p>
              <p>・現場で運用できる形を最優先します。</p>
              <p>・成果が出た分だけ、次に投資できる設計へ。</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="経歴（仮）"
        title="これまでの歩み"
        description="以下は仮の内容です。正式版は確認後に差し替えます。"
      >
        <div className="grid gap-4">
          {timeline.map((t) => (
            <Card key={t.title} className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
                    {t.period}
                  </Badge>
                  <p className="text-sm font-medium">{t.title}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="活動・メディア"
        title="現場の信頼を積み重ねるために"
        description="相談しやすさと透明性を重視し、情報発信にも取り組んでいます。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {activities.map((a) => (
            <Card key={a.title} className="rounded-3xl">
              <CardContent className="p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                  <a.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-medium">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
              </CardContent>
            </Card>
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
                <Link href="/survey">事前アンケート</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
