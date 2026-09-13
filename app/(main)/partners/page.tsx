import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { partnerCompanies } from "@/content/pages/about-partners";
import { Badge } from "@/components/ui/badge";
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
    <div className="py-6 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
            Partners
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">
            協業パートナー一覧
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-base sm:leading-7">
            Make It Techの事業を支え、互いの強みを生かしながら、ともにお客様への価値提供に取り組む協業パートナーをご紹介します。
          </p>
        </header>

        <section className="mt-6 sm:mt-10" aria-label="協業パートナー">
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            {partnerCompanies.map((partner) => (
              <article
                key={partner.websiteUrl}
                className="flex flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:rounded-3xl sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-secondary/35 sm:size-16">
                    {partner.logoSrc ? (
                      <Image
                        src={partner.logoSrc}
                        alt={partner.logoAlt ?? `${partner.name}のロゴ`}
                        width={80}
                        height={80}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <Building2
                        className="size-6 text-primary sm:size-7"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                      {partner.name}
                    </h2>
                    {partner.partnership ? (
                      <Badge
                        variant="outline"
                        className="mt-1 max-w-full rounded-lg px-2 py-0.5 text-[10px] font-medium text-primary sm:text-xs"
                      >
                        <span className="truncate">{partner.partnership}</span>
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium leading-6 text-foreground/85">
                  {partner.description}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {partner.introduction}
                </p>

                <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-3 sm:mt-auto sm:pt-4">
                  {partner.location ? (
                    <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                      <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="truncate">{partner.location}</span>
                    </span>
                  ) : null}
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/75"
                    aria-label={`${partner.name}の公式サイトを見る（新しいタブで開きます）`}
                  >
                    公式サイト
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
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
