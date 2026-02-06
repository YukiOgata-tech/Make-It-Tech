import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Handshake,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "新潟県の事業者向けIT支 WEB制作 ホームページ作成 | Make It Tech",
  description:
    "新潟県内の事業者向けに、代表が相談から提供まで一貫対応。対面相談･無料診断や、公的DX/IT補助金の最新情報共有に対応します。",
  keywords: [
    "新潟", "新潟市", "長岡市", "上越市", "三条市", "柏崎市", "新発田市", "燕市",
    "安い", "低コスト", "フリーランス", "信頼", "無料", "WEB制作", "LP制作", "激安",
    "DX支援", "IT支援", "業務改善", "niigata", "新潟県", "地域創生", "ベンチャー支援",
    "補助金", "対面相談", "無料診断", "IT導入補助金", "ホームページ制作", "SES", "システム開発",
  ],
};

const highlights = [
  {
    title: "代表が一貫して対応",
    desc: "相談から提案･実装･運用まで、本代表が担当し、伴走します。",
    icon: UsersRound,
  },
  {
    title: "対面で相談･診断可能",
    desc: "県内なら訪問や対面での整理･診断にも対応できます。即日対応可能。",
    icon: MapPin,
  },
  {
    title: "大手にない柔軟さ",
    desc: "小回り･価格･現場目線で、不足なく支援します。",
    icon: Handshake,
  },
  {
    title: "補助金の最新情報の周知",
    desc: "新潟県内の公的DX/IT補助金の最新情報を共有できます。",
    icon: BadgeCheck,
  },
];

const freeConditions = [
  "新潟県内の事業者であること",
  "初回相談であること",
  "契約を前向きに検討していること",
  "当月の対応枠の範囲内であること",
];

export default function NiigataPage() {
  return (
    <div className="pb-10 sm:pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-aurora opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-12 sm:pt-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <Badge variant="secondary" className="rounded-xl">
                  新潟県内の方へ
                </Badge>
                <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
                  代表が一貫対応
                </Badge>
                <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
                  対面相談OK
                </Badge>
              </div>

              <h1 className="mt-4 max-w-lg text-xl font-semibold tracking-tight sm:max-w-none sm:text-4xl lg:text-5xl">
                新潟県内の事業者向け支援
                <span className="mt-2 block text-sm font-medium text-muted-foreground sm:text-xl">
                  相談から提供まで、一人の担当が最後まで伴走します。
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-xs leading-relaxed text-muted-foreground sm:max-w-2xl sm:text-base">
                代表が直接ヒアリングし、必要な改善だけに絞って支援します。
                大手では届きにくい現場の細部まで、対面でスムーズに整理できます。
              </p>

              <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
                <Button asChild className="rounded-xl">
                  <Link href="/contact">
                    相談してみる <ArrowRight className="sm:ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/pricing">料金ページへ</Link>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground sm:mt-6 sm:gap-3">
                <span className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2 leading-snug">
                  <Sparkles className="h-4 w-4 text-primary" />
                  公的DX/IT補助金の情報も共有可能
                </span>
                <span className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2 leading-snug">
                  <MapPin className="h-4 w-4 text-primary" />
                  対面相談･診断に対応
                </span>
              </div>
            </div>

            <div className="hidden sm:grid sm:gap-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="rounded-3xl">
                    <CardHeader className="pb-0">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm sm:text-base">
                          {item.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {item.desc}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="min-w-0 sm:hidden">
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="min-w-55 snap-center rounded-2xl border border-border/60 bg-background/70 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium">{item.title}</p>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">左右にスワイプで確認</p>
            </div>
          </div>
        </div>
      </div>

      {/* Niigata Focus Services */}
      <section className="py-6 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-primary/10 bg-secondary/20 p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-semibold">
                <span className="text-primary">新潟のWeb制作・LP制作</span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                新潟市・長岡市を中心に、県内事業者様のホームページ制作、ランディングページ(LP)制作を承ります。
                「ただ作るだけ」ではなく、お問い合わせや採用につながる成果重視の設計を行います。
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>新潟の地域性に合わせたデザイン・コンテンツ提案</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>採用サイト・集客用LP・コーポレートサイト対応</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>保守・更新も低コストでサポート</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-primary/10 bg-secondary/20 p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-semibold">
                <span className="text-primary">新潟のDX支援・業務改善</span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                「デジタル化したいが何から始めればいいかわからない」という新潟の企業様へ。
                現場訪問による業務整理から、身近なツール(LINE, Google)を使った低コストな改善を提案します。
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>現場訪問・対面ヒアリングによる課題の可視化</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>kintone / LINE公式 / Google Workspace 導入支援</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>新潟県のDX補助金・IT導入補助金の活用サポート</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Area Served */}
      <section className="py-6 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border/60 bg-background/50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">対応エリア</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  新潟県内全域に対応しています。訪問・対面でのお打ち合わせも可能です（地域によりオンライン併用）。
                </p>
              </div>
            </div>
            
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
              <div>
                <span className="block font-medium text-foreground mb-1">下越エリア</span>
                新潟市（中央区, 西区, 東区, 北区, 江南区, 秋葉区, 南区, 西蒲区）、
                新発田市、村上市、燕市、五泉市、阿賀野市、胎内市、聖籠町、阿賀町、関川村、粟島浦村、弥彦村
              </div>
              <div>
                <span className="block font-medium text-foreground mb-1">中越エリア</span>
                長岡市、三条市、柏崎市、小千谷市、加茂市、十日町市、見附市、魚沼市、南魚沼市、田上町、出雲崎町、湯沢町、津南町、刈羽村
              </div>
              <div>
                <span className="block font-medium text-foreground mb-1">上越エリア</span>
                上越市、糸魚川市、妙高市
              </div>
              <div>
                <span className="block font-medium text-foreground mb-1">佐渡エリア</span>
                佐渡市
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              ※ 県外（山形県、福島県、群馬県、富山県など）のお客様も、オンライン中心で対応可能です。お気軽にご相談ください。
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Separator className="my-6 sm:my-10" />
      </div>

      {/* Free conditions */}
      <section id="free-conditions" className="py-6 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary/80">-無料相談･診断の条件</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
                対象の方には無料で対応します
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                迷う場合もまずは相談ください。
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-primary/15 bg-secondary/30 p-5 sm:p-7">
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {freeConditions.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-lg sm:rounded-xl">
                <Link href="/contact">
                  無料相談を依頼 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-lg sm:rounded-xl">
                <Link href="/survey">LINEで相談</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
