import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AboutOverviewPanel } from "@/components/sections/about-overview-panel";
import { PartnerCompaniesSection } from "@/components/sections/partner-companies-section";

export const metadata: Metadata = {
  title: "Make It Techの事業所概要と代表プロフィール",
  description:
    "Make It Techの事業概要、代表プロフィール、対応実績、パートナー企業を掲載しています。新潟の中小事業者向けに、ITによる業務改善、DX支援、Web制作、運用改善を実務目線で支援します。",
  keywords: [
    "新潟", "niigata", "新潟市", "地域創生", "就活", "就活NEO", "DX",
    "IT", "業務改善", "LP制作", "信頼", "Web制作", "事業所概要",
    "パートナー企業", "事業連携",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Make It Techの事業所概要と代表プロフィール",
    description:
      "Make It Techの事業概要、代表プロフィール、対応実績、パートナー企業をご紹介します。",
    url: "/about",
    type: "website",
  },
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

        <AboutOverviewPanel className="mt-6" />
      </Section>

      <Section
        eyebrow="実績"
        title="対応実績の概要"
        description="昨年度からの支援実績をご参考ください。"
      >
        <div className="rounded-3xl border border-border/60 bg-background/70 p-5 sm:p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:gap-10">
            <div>
              <p className="text-base font-semibold sm:text-lg">
                制作・支援実績をまとめています
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/80">
                HP/LP制作、業務システム開発、運用支援など、実際に対応した案件の概要を掲載しています。
                画面イメージや実施内容は実績紹介ページからご確認ください。
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                バックエンド構築から、フロントエンド実装まで一貫して対応しています。
              </p>
              <Button asChild className="mt-5 w-full rounded-xl sm:w-auto">
                <Link href="/works">
                  実績紹介を見る
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
            <ul className="grid gap-3 border-t border-border/70 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {[
                "Webサイトの企画・制作",
                "教育事業所向けQRコードを用いた席利用状況のリアルタイム管理システムと現地の機器接続の開発",
                "企業との業務委託契約によるWeb・システム開発支援",
                "Webアプリ制作からシステム導入、運用改善までの一貫対応",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        title="-代表者 プロフィール"
      >
        <div className="grid gap-2 sm:gap-3 md:grid-cols-[1fr_2fr] md:gap-4">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 sm:rounded-3xl sm:p-5 md:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold sm:h-14 sm:w-14">
                OY
              </div>
              <div>
                <p className="text-sm font-medium">代表</p>
                <p className="text-lg font-semibold">尾形友輝</p>
              </div>
            </div>
            <Separator className="my-2 sm:my-3" />
            <div className="text-sm leading-relaxed text-muted-foreground">
              山形県 南陽市出身
              <p>新潟大学 工学部 在学中</p>
              <p>ENTP / 憧れの先輩</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 sm:rounded-3xl sm:p-5 md:p-6">
            <p className="text-sm font-medium leading-snug"></p>
            <div className="mt-3 grid gap-2 text-xs leading-snug text-muted-foreground sm:gap-3 sm:text-sm sm:leading-relaxed">
              <p>8歳よりバスケットボールに取り組み、インターハイ(2021)および国民体育大会(2019)に出場。</p>
              <p>大学を1年間休学し、カナダにてワーキングホリデーを経験(2024-25)。</p>
              <p>どんなことも自分で見たいし、自分で経験したい。そんなマインドで生きています。</p>
              <p>現在は学業を続けながら、事業主として、様々な場に飛び込み、模索を繰り替えし、実務案件などに携わっています。</p>
            </div>
          </div>
        </div>
      </Section>

      <PartnerCompaniesSection />
    </>
  );
}
