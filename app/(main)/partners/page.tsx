import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Handshake,
  MapPin,
} from "lucide-react";
import { partnerCompanies } from "@/content/pages/about-partners";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "協業パートナー | 事業をともに支える企業",
  description:
    "Make It Techの事業を支え、ともに価値を届ける協業パートナーをご紹介します。専門性や現場知見を持ち寄り、より良い支援につなげています。",
  keywords: ["協業パートナー", "事業連携", "業務DX", "Make It Tech"],
  alternates: {
    canonical: "/partners",
  },
  openGraph: {
    title: "協業パートナー | Make It Tech",
    description:
      "Make It Techの事業を支え、ともに価値を届ける協業パートナーをご紹介します。",
    url: "/partners",
  },
};

export default function PartnersPage() {
  const partnerListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Make It Tech 協業パートナー",
    url: `${site.url}/partners`,
    numberOfItems: partnerCompanies.length,
    itemListElement: partnerCompanies.map((partner, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Organization",
        name: partner.name,
        url: partner.websiteUrl,
        description: partner.description,
        ...(partner.logoSrc
          ? { logo: new URL(partner.logoSrc, site.url).toString() }
          : {}),
      },
    })),
  };

  return (
    <div className="py-8 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-secondary/35 px-5 py-8 sm:px-10 sm:py-12">
          <div
            className="absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-3xl">
            <Badge variant="secondary" className="rounded-xl">
              Collaboration Partners
            </Badge>
            <div className="mt-5 flex items-start gap-3 sm:gap-4">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary sm:size-14">
                <Handshake className="size-5 sm:size-7" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                  事業をともに支える
                  <br className="sm:hidden" />
                  協業パートナー
                </h1>
                <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                  Make It Techの事業は、専門性や現場知見を持つ企業との連携によって支えられています。互いの強みを持ち寄り、お客様により良い価値を届ける協業パートナーをご紹介します。
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 sm:mt-12" aria-labelledby="partner-list-title">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Partners</p>
            <h2
              id="partner-list-title"
              className="mt-2 text-xl font-semibold tracking-tight sm:text-3xl"
            >
              協業パートナーのご紹介
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              日々の事業運営やお客様支援において、知見・技術・ネットワークを共有しながら、ともに取り組んでいるパートナーです。
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:mt-8">
            {partnerCompanies.map((partner) => (
              <article
                key={partner.websiteUrl}
                className="group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="grid gap-0 lg:grid-cols-[15rem_1fr]">
                  <div className="flex min-h-44 items-center justify-center border-b border-border/70 bg-secondary/40 p-8 lg:min-h-72 lg:border-b-0 lg:border-r">
                    <div className="flex size-28 items-center justify-center overflow-hidden rounded-3xl border border-border/80 bg-background shadow-sm sm:size-32">
                      {partner.logoSrc ? (
                        <Image
                          src={partner.logoSrc}
                          alt={partner.logoAlt ?? `${partner.name}のロゴ`}
                          width={160}
                          height={160}
                          className="h-full w-full object-contain p-4"
                        />
                      ) : (
                        <Building2
                          className="size-12 text-primary"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col p-5 sm:p-8">
                    <div>
                      {partner.partnership ? (
                        <Badge variant="outline" className="rounded-xl text-primary">
                          {partner.partnership}
                        </Badge>
                      ) : null}
                      <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                        {partner.name}
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-foreground/85 sm:text-base">
                        {partner.description}
                      </p>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                        {partner.introduction}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-auto lg:pt-7">
                      {partner.location ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-4 text-primary" aria-hidden="true" />
                          {partner.location}
                        </span>
                      ) : null}
                      <Button asChild variant="outline" className="rounded-xl">
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${partner.name}の公式サイトを見る（新しいタブで開きます）`}
                        >
                          公式サイトを見る
                          <ArrowUpRight className="ml-2 size-4" aria-hidden="true" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:mt-12 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold sm:text-2xl">
                協業・事業連携のご相談
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                お互いの専門性を生かしたサービス連携や、地域・事業者支援に関する協業のご相談を受け付けています。
              </p>
            </div>
            <Button asChild className="shrink-0 rounded-xl">
              <Link href="/contact">
                協業について相談する
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(partnerListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
