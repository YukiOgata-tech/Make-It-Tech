import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  AtSign,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarClock,
  ChartNoAxesCombined,
  Code2,
  Cpu,
  Map,
  Presentation,
  Radio,
  RefreshCw,
  Route,
  Search,
  UsersRound,
  Waypoints,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { site } from "@/lib/site";

const pagePath = "/services/fde";
const pageUrl = `${site.url}${pagePath}`;
const pageTitle = "FDE・現場伴走型のIT・AI・DX支援";
const pageDescription =
  "Make It TechのFDE活動紹介。経営・業務の現場に入り、課題整理からAI・システムの設計、実装、定着、改善まで伴走します。現在サイト上で一般募集は行っていません。";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    title: `${pageTitle} | ${site.searchName}`,
    description: pageDescription,
    url: pageUrl,
    siteName: site.searchName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/images/hero-dx-fde-network.png",
        width: 1448,
        height: 1086,
        alt: "Make It TechのFDE・IT・AI・DX支援",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | ${site.searchName}`,
    description: pageDescription,
    images: ["/images/hero-dx-fde-network.png"],
  },
};

type IconItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const fdeProcess: IconItem[] = [
  {
    title: "現場・業務を理解する",
    description: "経営課題、実際の業務、既存ツール、関係者の動きを整理します。",
    icon: Search,
  },
  {
    title: "進め方を設計する",
    description: "優先順位を決め、必要な技術と小さく検証できる進め方を設計します。",
    icon: Waypoints,
  },
  {
    title: "実際に実装する",
    description: "AI、Web、業務システム、自動化などを必要な形で構築します。",
    icon: Code2,
  },
  {
    title: "現場への定着まで伴走する",
    description: "運用ルールを整え、利用状況を見ながら改善を続けます。",
    icon: UsersRound,
  },
];

const deliverables: IconItem[] = [
  {
    title: "現状業務・課題マップ",
    description: "業務の流れ、重複作業、属人化、情報の分断を見える形にします。",
    icon: Map,
  },
  {
    title: "実装ロードマップ",
    description: "優先度、効果、難易度を整理し、実行順序と検証方法を設計します。",
    icon: Route,
  },
  {
    title: "PoC・プロトタイプ",
    description: "本格導入前に、業務で試せる最小構成の仕組みをつくります。",
    icon: Cpu,
  },
  {
    title: "AI・業務システム",
    description: "生成AI、自動化、管理画面、データ連携などを業務に合わせて実装します。",
    icon: BrainCircuit,
  },
  {
    title: "運用ルール・手順書",
    description: "担当者が変わっても使い続けられるよう、判断基準と運用方法を整えます。",
    icon: BookOpenCheck,
  },
  {
    title: "改善指標・バックログ",
    description: "導入後に確認する指標と、次に改善する項目を継続管理できる形にします。",
    icon: ChartNoAxesCombined,
  },
];

const activityAreas: IconItem[] = [
  {
    title: "経営と現場の接続",
    description: "経営上の目的を、現場で実行できる具体的な仕組みに変換します。",
    icon: BriefcaseBusiness,
  },
  {
    title: "AI・技術の選定",
    description: "流行ではなく、課題と運用条件に合う技術を選びます。",
    icon: Cpu,
  },
  {
    title: "業務への組み込み",
    description: "既存の仕事を踏まえ、無理なく使える導線と役割を設計します。",
    icon: Workflow,
  },
  {
    title: "導入後の改善",
    description: "利用状況や事業の変化を確認し、実装と運用を更新します。",
    icon: RefreshCw,
  },
];

function ArticleHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description?: string;
}) {
  return (
    <header>
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs">
        {number}
      </p>
      <h2 className="mt-1.5 text-xl font-semibold leading-tight tracking-tight sm:mt-3 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-3xl text-xs leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-8">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export default function FdePage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}/#service`,
    name: "FDE・現場伴走型のIT・AI・DX支援",
    url: pageUrl,
    description: pageDescription,
    serviceType: [
      "Forward Deployed Engineering",
      "FDE支援",
      "AI導入支援",
      "DX支援",
      "業務システム開発",
    ],
    provider: { "@id": `${site.url}/#organization` },
    areaServed: [
      { "@type": "AdministrativeArea", name: "新潟県" },
      { "@type": "Country", name: "日本" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="overflow-hidden">
        <header className="border-b border-border/70 bg-background">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-12">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground transition hover:text-foreground sm:text-xs"
            >
              <ArrowLeft className="size-3.5" /> サービス一覧へ
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6">
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-teal-600/20 bg-teal-600/8 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300 sm:h-8 sm:text-[11px]">
                <Radio className="size-3.5" /> FDE ACTIVITY
              </span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                現在活動中・サイトでの一般募集なし
              </span>
            </div>

            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-primary sm:mt-6 sm:text-xs">
              Forward Deployed Engineer
            </p>
            <h1 className="mt-1.5 max-w-4xl text-2xl font-semibold leading-tight tracking-tight sm:mt-3 sm:text-4xl lg:text-5xl">
              FDE・現場伴走型のIT・AI・DX支援
            </h1>
            <p className="mt-3 max-w-3xl text-xs leading-6 text-muted-foreground sm:mt-5 sm:text-base sm:leading-8">
              経営や業務の現場に入り、課題の整理だけで終わらず、必要な仕組みの設計・実装と現場定着まで進める活動です。Make It Techでは、個別案件や協業の中でFDE型の支援を行っています。
            </p>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:gap-10 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
          <article className="min-w-0 divide-y divide-border/70 rounded-2xl border border-border/70 bg-background p-3 shadow-sm sm:rounded-[2rem] sm:p-8">
            <section id="about" className="scroll-mt-32 pb-8 sm:pb-14">
              <ArticleHeading
                number="01 / FDEとは"
                title="提案と開発の間に入り、現場で動くところまで担当する"
              />
              <div className="mt-4 space-y-3 text-xs leading-6 text-foreground sm:mt-6 sm:space-y-4 sm:text-base sm:leading-8">
                <p>
                  FDEは、事業や業務の現場に入り、関係者と会話しながら課題を把握し、必要な技術を選び、実際の実装まで行う役割です。あらかじめ決められた仕様だけを開発するのではなく、現場で得た情報を設計へ反映します。
                </p>
                <p>
                  また、仕組みを納品して終わるのではなく、利用方法や役割分担を整え、現場で使われる状態を確認しながら改善を続けます。そのため、案件によって扱う技術や成果物は異なります。
                </p>
              </div>

              <dl className="mt-5 divide-y divide-border/60 rounded-xl border border-border/70 sm:mt-8 sm:rounded-2xl">
                <div className="grid gap-1 p-3 sm:grid-cols-[9rem_1fr] sm:gap-5 sm:p-5">
                  <dt className="text-[10px] font-semibold text-muted-foreground sm:text-sm">一般的なコンサルティング</dt>
                  <dd className="text-xs leading-5 sm:text-sm sm:leading-6">課題分析や方針・計画の提案が中心</dd>
                </div>
                <div className="grid gap-1 p-3 sm:grid-cols-[9rem_1fr] sm:gap-5 sm:p-5">
                  <dt className="text-[10px] font-semibold text-muted-foreground sm:text-sm">一般的な受託開発</dt>
                  <dd className="text-xs leading-5 sm:text-sm sm:leading-6">決められた要件・仕様に基づく開発が中心</dd>
                </div>
                <div className="grid gap-1 bg-primary/[0.035] p-3 sm:grid-cols-[9rem_1fr] sm:gap-5 sm:p-5">
                  <dt className="text-[10px] font-semibold text-primary sm:text-sm">FDE型の支援</dt>
                  <dd className="text-xs leading-5 sm:text-sm sm:leading-6">現場理解、設計、実装、定着、改善を往復しながら進める</dd>
                </div>
              </dl>
            </section>

            <section id="process" className="scroll-mt-32 py-8 sm:py-14">
              <ArticleHeading
                number="02 / 進め方"
                title="FDE業務で行うこと"
                description="案件ごとに必要な工程を選び、事業と現場の状況に合わせて進めます。"
              />
              <ol className="mt-5 divide-y divide-border/60 border-y border-border/70 sm:mt-8">
                {fdeProcess.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="grid grid-cols-[2rem_1fr] gap-2 py-3 sm:grid-cols-[3rem_12rem_1fr] sm:items-center sm:gap-4 sm:py-5">
                      <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground sm:size-10 sm:rounded-xl">
                        <Icon className="size-4 sm:size-5" />
                      </span>
                      <h3 className="text-sm font-semibold leading-tight sm:text-base">
                        <span className="mr-1.5 text-[9px] text-muted-foreground sm:hidden">0{index + 1}</span>
                        {item.title}
                      </h3>
                      <p className="col-start-2 text-[10px] leading-5 text-muted-foreground sm:col-start-auto sm:text-sm sm:leading-6">
                        {item.description}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section id="deliverables" className="scroll-mt-32 py-8 sm:py-14">
              <ArticleHeading
                number="03 / 成果物"
                title="FDE業務から創出できるもの"
                description="固定パッケージではありません。課題と段階に応じて必要な成果物を選び、実際に使える状態まで整えます。"
              />
              <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-0 border-y border-border/70 sm:mt-8 sm:gap-x-8 lg:grid-cols-2">
                {deliverables.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="border-b border-border/60 py-3 last:border-b-0 sm:py-5">
                      <dt className="flex items-center gap-2 text-sm font-semibold sm:gap-3 sm:text-base">
                        <Icon className="size-4 shrink-0 text-primary sm:size-5" />
                        {item.title}
                      </dt>
                      <dd className="mt-1 text-[10px] leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">
                        {item.description}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>

            <section id="scope" className="scroll-mt-32 py-8 sm:py-14">
              <ArticleHeading
                number="04 / 活動領域"
                title="技術導入ではなく、事業が前へ進むことを目的にする"
                description="技術を先に決めず、事業目的と現場条件を確認します。必要に応じてWeb、AI、自動化、業務システム、データ活用を横断します。"
              />
              <div className="mt-5 grid grid-cols-2 gap-x-3 border-y border-border/70 sm:mt-8 sm:gap-x-8">
                {activityAreas.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="py-3 sm:py-5">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-teal-600 dark:text-teal-300 sm:size-5" />
                        <h3 className="text-sm font-semibold sm:text-base">{item.title}</h3>
                      </div>
                      <p className="mt-1 text-[10px] leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="events" className="scroll-mt-32 pt-8 sm:pt-14">
              <ArticleHeading
                number="05 / 今後の活動"
                title="経営者向けの講演・説明会を計画しています"
              />
              <div className="mt-4 flex gap-3 border-l-2 border-primary/40 pl-3 sm:mt-7 sm:gap-4 sm:pl-5">
                <Presentation className="mt-0.5 size-4 shrink-0 text-primary sm:size-5" />
                <div>
                  <p className="text-xs leading-6 text-foreground sm:text-base sm:leading-8">
                    FDEという現場伴走の考え方、AI・DXを事業へ取り入れる進め方、技術導入を現場定着につなげる方法などを扱う、経営者向けの講演・説明会を今後計画しています。
                  </p>
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-muted/60 p-3 sm:mt-5 sm:rounded-2xl sm:p-4">
                    <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="text-[10px] leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                      現在は企画準備中です。開催情報は準備が整い次第、サイト、公式LINE、今後開設するSNSでお知らせします。
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </article>

          <aside className="lg:sticky lg:top-32">
            <div className="rounded-xl border border-border/70 bg-card p-3 sm:rounded-2xl sm:p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary sm:text-[11px]">
                Current status
              </p>
              <p className="mt-2 text-sm font-semibold sm:text-base">個別案件・協業の中で活動中</p>
              <p className="mt-1 text-[10px] leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">
                現在、サイト上で一般向けの募集受付は行っていません。
              </p>

              <nav aria-label="ページ内目次" className="mt-4 border-t border-border/60 pt-3 sm:mt-5 sm:pt-4">
                <p className="text-[9px] font-semibold text-muted-foreground sm:text-[11px]">このページの内容</p>
                <ol className="mt-2 space-y-1.5 text-xs sm:text-sm">
                  <li><a href="#about" className="hover:text-primary">01　FDEとは</a></li>
                  <li><a href="#process" className="hover:text-primary">02　進め方</a></li>
                  <li><a href="#deliverables" className="hover:text-primary">03　成果物</a></li>
                  <li><a href="#scope" className="hover:text-primary">04　活動領域</a></li>
                  <li><a href="#events" className="hover:text-primary">05　今後の活動</a></li>
                </ol>
              </nav>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 sm:mt-5 sm:grid-cols-1 sm:pt-4">
                <LineButton
                  href={site.line.surveyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 text-xs sm:text-sm"
                >
                  公式LINE
                </LineButton>
                <Button type="button" variant="outline" disabled className="h-9 rounded-xl text-xs sm:text-sm">
                  <AtSign className="size-3.5" /> SNS 準備中
                </Button>
              </div>
              <p className="mt-2 text-[9px] leading-4 text-muted-foreground sm:text-[11px] sm:leading-5">
                活動内容への質問、協業、講演・説明会に関するお問い合わせを受け付けています。
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
