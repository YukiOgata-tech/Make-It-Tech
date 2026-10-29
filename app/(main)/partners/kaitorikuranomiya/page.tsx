import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { site } from "@/lib/site";

const profilePath = "/partners/kaitorikuranomiya";
const officialUrl = "https://kaitorikuranomiya.com";

export const metadata: Metadata = {
  title: "買取 蔵の宮 | 神奈川県平塚市の買取専門店・協業パートナー",
  description:
    "買取 蔵の宮（くらのみや）は、神奈川県平塚市で店主が目の前で丁寧に査定する買取専門店です。Make It Techの協業パートナーとしてご紹介します。",
  keywords: [
    "買取 蔵の宮",
    "買取蔵の宮",
    "くらのみや",
    "平塚 買取",
    "平塚市 買取専門店",
    "Make It Tech 協業パートナー",
  ],
  alternates: {
    canonical: profilePath,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "profile",
    title: "買取 蔵の宮 | Make It Tech 協業パートナー",
    description:
      "神奈川県平塚市の買取専門店「買取 蔵の宮」を、Make It Techの協業パートナーとしてご紹介します。",
    url: profilePath,
  },
};

export default function KaitoriKuranomiyaPage() {
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${site.url}${profilePath}#profile`,
    url: `${site.url}${profilePath}`,
    name: "買取 蔵の宮｜Make It Tech 協業パートナー",
    description:
      "神奈川県平塚市の買取専門店「買取 蔵の宮」を紹介する協業パートナーページです。",
    mainEntity: {
      "@type": "LocalBusiness",
      "@id": `${officialUrl}/#business`,
      name: "買取 蔵の宮",
      alternateName: ["買取蔵の宮", "蔵の宮", "くらのみや"],
      url: officialUrl,
      telephone: "0463-71-6678",
      description:
        "神奈川県平塚市で、店主がお客様の目の前で品物を査定する買取専門店です。",
      address: {
        "@type": "PostalAddress",
        postalCode: "254-0043",
        addressRegion: "神奈川県",
        addressLocality: "平塚市",
        streetAddress: "紅谷町12-24 リーフ8 1階",
        addressCountry: "JP",
      },
      sameAs: [officialUrl],
    },
  };

  return (
    <div className="py-6 sm:py-14">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/partners"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          協業パートナー一覧へ
        </Link>

        <article className="mt-5 overflow-hidden rounded-2xl border border-border/70 bg-card sm:mt-7 sm:rounded-3xl">
          <header className="border-b border-border/60 p-5 sm:p-8">
            <div className="flex items-start gap-3 sm:gap-5">
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-secondary/35 text-primary sm:size-18">
                <Building2 className="size-7 sm:size-9" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <Badge variant="outline" className="rounded-lg text-primary">
                  Make It Tech 協業パートナー
                </Badge>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">
                  買取 蔵の宮
                </h1>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  かいとり くらのみや
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-7 p-5 sm:space-y-9 sm:p-8">
            <section aria-labelledby="about-kuranomiya">
              <h2 id="about-kuranomiya" className="text-lg font-semibold sm:text-2xl">
                平塚市の買取専門店
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                買取 蔵の宮は、神奈川県平塚市紅谷町に店舗を構える買取専門店です。店主がお客様の目の前で一品ずつ査定し、査定額の根拠も丁寧に説明する姿勢を大切にしています。
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                金・プラチナ・銀などの貴金属、時計、宝飾品、ブランド品を中心に、骨董品やお酒など幅広い品目の相談に対応しています。
              </p>
            </section>

            <section aria-labelledby="partnership-kuranomiya">
              <h2
                id="partnership-kuranomiya"
                className="text-lg font-semibold sm:text-2xl"
              >
                Make It Techとの協業
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                お客様との信頼関係を大切にし、一つひとつの相談に誠実に向き合う事業者として、Make It Techの取り組みを支えていただきながら、事業運営における相互連携を進めています。
              </p>
            </section>

            <section
              aria-labelledby="shop-information"
              className="rounded-2xl bg-secondary/35 p-4 sm:p-6"
            >
              <h2 id="shop-information" className="font-semibold sm:text-lg">
                店舗情報
              </h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-[7rem_1fr]">
                <dt className="font-medium text-foreground">店舗名</dt>
                <dd className="text-muted-foreground">買取 蔵の宮（くらのみや）</dd>
                <dt className="font-medium text-foreground">所在地</dt>
                <dd className="flex items-start gap-1.5 text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  〒254-0043 神奈川県平塚市紅谷町12-24 リーフ8 1階
                </dd>
                <dt className="font-medium text-foreground">アクセス</dt>
                <dd className="text-muted-foreground">JR平塚駅北口から徒歩5分</dd>
              </dl>
            </section>

            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              買取 蔵の宮 公式サイト
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </article>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profileJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
