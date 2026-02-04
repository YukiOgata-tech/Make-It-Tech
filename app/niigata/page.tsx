import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  BadgeCheck,
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
    "新潟", "安い", "低コスト", "フリーランス", "信頼", "無料", "WEB制作", "LP制作", "激安",
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

              <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                新潟県内の事業者向け支援
                <span className="mt-2 block text-base font-medium text-muted-foreground sm:text-xl">
                  相談から提供まで、一人の担当が最後まで伴走します。
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                代表が直接ヒアリングし、必要な改善だけに絞って支援します。
                大手では届きにくい現場の細部まで、対面でスムーズに整理できます。
              </p>

              <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
                <Button asChild className="rounded-xl">
                  <Link href="/contact">
                    相談してみる <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/pricing">料金ページへ</Link>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground sm:mt-6 sm:gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  公的DX/IT補助金の情報も共有可能
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  対面相談・診断に対応
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
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
                    <CardContent className="pt-2 text-sm text-muted-foreground">
                      {item.desc}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Separator className="my-6 sm:my-10" />
      </div>

      {/* Free conditions */}
      <section id="free-conditions" className="py-6 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary/80">-無料相談・診断の条件</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
                対象の方には無料で対応します
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                条件はシンプルに絞っています。迷う場合もまずは相談ください。
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
