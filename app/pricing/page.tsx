import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";

type PriceExample = {
  title: string;
  range: string;
  summary: string;
  includes: string[];
  dependsOn: string[];
};

const principles = [
  {
    icon: ShieldCheck,
    title: "範囲の合意をしてから進めます",
    desc: "“やる/やらない”を先に決め、想定外の工数が膨らむのを防ぎます。",
  },
  {
    icon: Timer,
    title: "最小構成で早く動かします",
    desc: "まずは小さく作って検証→成果に合わせて拡張。ムダな開発を避けます。",
  },
  {
    icon: Wallet,
    title: "内容に合わせて柔軟に見積もります",
    desc: "固定プランではなく、目的・期間・体制に合わせた最短ルートを提案します。",
  },
];

const examples: PriceExample[] = [
  {
    title: "LP制作（1-3ページ）",
    range: "目安：¥20,000～",
    summary:
      "構成・コピー整理〜デザイン実装まで。問い合わせ導線（CTA）最適化。ノーコードで作成されたページをコードで再現可能。",
    includes: ["ヒアリング", "構成案", "デザイン実装", "スマホ最適化", "基本SEO", "軽微な修正（範囲内）"],
    dependsOn: ["内容量（セクション数）", "素材提供の有無（画像/文章）", "アニメーション量", "計測・導線改善の有無"],
  },
  {
    title: "店舗Webサイト制作やリニューアル（4ページ以上など）",
    range: "目安：¥100,000〜",
    summary:
      "メニュー/アクセス/予約などの機能性と、現場で非技術者が更新・把握しやすい形に整えます。SEOの基礎も対応します。",
    includes: ["ページ設計", "デザイン実装", "スマホ最適化", "基本SEO", "更新しやすい構成", "軽微な修正（範囲内）"],
    dependsOn: ["ページ数・導線の複雑さ", "予約/問い合わせ導線の設計", "撮影・文章作成の有無", "多言語・複数店舗対応の有無", "AIチャットボット等の導入" ],
  },
  {
    title: "独自アプリケーション開発（予約管理・顧客管理・ユーザー管理...）",
    range: "目安：¥200,000～",
    summary:
      "実現できないシステムはありません。業務フローに合わせた最適なシステムを提案・開発します。",
    includes: ["開発", "入念なカウンセリング", "セキュリティの実装", "データ管理", "運用手順のドキュメント"],
    dependsOn: ["条件の多さ", "想定利用規模", "運用時の維持コスト", "外部サービス連携の有無", "認証・権限設計", ],
  },
  {
    title: "フォーム＋管理シートの仕組み化提案・構築",
    range: "目安：¥30,000〜¥200,000",
    summary:
      "問い合わせ/予約/応募などを一元化。通知や集計も含めて“運用で回る形”にします。",
    includes: ["入力項目の設計", "フォーム作成", "管理シート整備", "通知（必要に応じて）", "運用手順の簡易ドキュメント"],
    dependsOn: ["分岐条件の多さ（入力で処理が変わる等）", "通知先（LINE/メール/複数担当）", "既存運用の複雑さ"],
  },
  {
    title: "社内DX開発・作業自動化（通知・集計・連携）",
    range: "目安：¥50,000〜 (開発は必要に応じて提案)",
    summary:
      "毎日の手作業を削減し、ミスを減らします（例：フォーム→通知→台帳更新）。",
    includes: ["現状整理", "軽量な要件定義", "実装", "テスト", "運用手順の簡易ドキュメント"],
    dependsOn: ["連携先（LINE/メール/Google/外部SaaS）", "認証や権限の必要性", "エラー時の再実行/監視の要否"],
  },
  {
    title: "エンジニア業務・DX伴走契約（運用）",
    range: "目安：月額 ¥5,000〜（要相談）",
    summary:
      "導入して終わりにせず、常時対応・更新をサポート。現場の声と数字をもとに改善サイクルを回します。（基本的にこちらの契約は行っていただきます）",
    includes: ["定例報告（回数は相談）", "改善案の提示", "優先順位付け", "修正（範囲内）", "運用ルールの整備"],
    dependsOn: ["支援範囲（Web/業務/自動化）", "頻度（週次/月次）", "改善の深さ（数字/KPIまで見るか）"],
  },
];

const extras = [
  {
    title: "追加になりやすいもの（例）",
    items: [
      "ロゴ制作・撮影・文章作成（コンテンツ制作）",
      "多言語対応 / 複数店舗・複数拠点対応",
      "予約・決済など外部サービス連携の高度化",
      "管理画面・ユーザー管理などのシステム開発",
      "運用監視（障害通知）や高度な権限設計",
    ],
  },
  {
    title: "逆に、開発しないこともあります",
    items: [
      "既存ツールで十分なら“作らない”が正解です（費用も期間も最小化できます）",
      "まずは最小構成を提案し、必要に応じて拡張、の順番を優先します",
    ],
  },
];

const faqs = [
  {
    q: "固定プランがないのは不安です。どうやって進めますか？",
    a: "まず「現状」「理想」「制約（予算/納期/担当者）」を整理し、対応範囲（やる/やらない）を合意してから見積もります。",
  },
  {
    q: "見積もりを早く出すために必要な情報は？",
    a: "完璧でなくてOKです。困っていること、理想、制約の3点が分かれば、最短の改善案と価格レンジを提示できます。素材（文章/写真）があるかどうかも分かると早いです。",
  },
  {
    q: "修正は無制限ですか？",
    a: "無制限ではありません。範囲と修正の目安は最初に合意して進行します。方針転換や仕様追加は別途相談（見積もり）になります。",
  },
];

export const metadata: Metadata = {
  title: "料金",
  description:
    "新潟のDX・IT支援に対応した料金目安。固定プランではなく、内容に合わせて柔軟に見積もります。",
  keywords: [
    "新潟",
    "DX",
    "IT",
    "料金",
    "見積",
    "安い",
    "低コスト",
    "業務改善",
    "Web制作",
  ],
};

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-primary/80">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">{desc}</p>
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">
              料金の目安
            </Badge>
            <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
              プラン無し・柔軟見積もり
            </Badge>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            “プラン”ではなく、内容に合わせて見積もります
          </h1>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground">
            ITは案件ごとに必要な範囲が違うため、固定プランは置きません。
            代わりに「よくある依頼」の価格レンジを提示し、範囲を合意してから最短の案で進めます。
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/contact">
                無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/services">対応できることを見る</Link>
            </Button>
          </div>
        </div>

        {/* Principles */}
        <SectionTitle
          eyebrow="考え方"
          title="不透明さをなくすための3つの約束"
          desc="範囲を先に決めて、小さく作って検証し、成果に寄せます。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {principles.map((p) => (
            <Card key={p.title} className="rounded-3xl">
              <CardContent className="p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-medium">{p.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Examples */}
        <SectionTitle
          eyebrow="目安"
          title="よくある依頼の価格レンジ"
          desc="内容・期間・素材提供の有無などで変動します。まずは状況を伺って最適案をご提案します。"
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {examples.map((ex) => (
            <Card key={ex.title} className="rounded-3xl overflow-hidden">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base sm:text-lg tracking-tight">
                      {ex.title}
                    </CardTitle>
                    <p className="mt-2 text-sm font-medium">{ex.range}</p>
                  </div>

                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-sm">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{ex.summary}</p>
              </CardHeader>

              <CardContent className="grid gap-4">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-medium">含まれること（例）</p>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    {ex.includes.map((x) => (
                      <li key={x} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-secondary/30 p-4">
                  <p className="text-sm font-medium">金額が変わりやすい要因（例）</p>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    {ex.dependsOn.map((x) => (
                      <li key={x} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary/60" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-xl">
                    <Link href="/contact">
                      この内容で相談 <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/survey">事前アンケート</Link>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  ※ 上記は目安です。範囲と進め方を合意した上で見積もります。
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Extras / Notes */}
        <SectionTitle
          eyebrow="補足"
          title="追加になりやすいこと・作らない判断"
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {extras.map((b) => (
            <Card key={b.title} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base tracking-tight">
                  {b.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="grid gap-2">
                  {b.items.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12" />

        {/* FAQ */}
        <SectionTitle
          eyebrow="FAQ"
          title="よくある質問"
          desc="不安になりやすい点を先に解消します。"
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <p className="text-sm font-medium">見積もりを早くする3点セット</p>
              <p className="mt-2 text-sm text-muted-foreground">
                完璧じゃなくてOK。これだけ分かると提案が速いです。
              </p>

              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span>現状（困っていること）</span>
                </div>
                <div className="flex items-start gap-2">
                  <Timer className="mt-0.5 h-4 w-4 text-primary" />
                  <span>理想（どうしたいか）</span>
                </div>
                <div className="flex items-start gap-2">
                  <Wallet className="mt-0.5 h-4 w-4 text-primary" />
                  <span>制約（予算/納期/担当者）</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-xl">
                  <Link href="/contact">
                    無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/terms">注意事項</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="mt-12 rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <p className="text-sm font-medium">要件が固まってなくても大丈夫です</p>
              <p className="mt-2 text-sm text-muted-foreground">
                「開発が必要かどうか」から一緒に判断できます。まずは現状を共有してください。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild className="rounded-xl">
                <Link href="/contact">
                  相談する <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/survey">事前アンケート</Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          ※ 金額や納期は内容により変動します。対応範囲・費用・納期は事前に合意して進行します。
        </p>
      </div>
    </div>
  );
}
