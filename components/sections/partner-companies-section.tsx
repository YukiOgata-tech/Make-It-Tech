import Image from "next/image";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { Section } from "@/components/layout/section";
import {
  partnerCompanies,
  type PartnerCompany,
} from "@/content/pages/about-partners";
import { site } from "@/lib/site";

function PartnerCard({ partner }: { partner: PartnerCompany }) {
  return (
    <li className="h-full">
      <article className="flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 sm:rounded-3xl sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background sm:size-16">
            {partner.logoSrc ? (
              <Image
                src={partner.logoSrc}
                alt={partner.logoAlt ?? `${partner.name}のロゴ`}
                width={64}
                height={64}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <Building2 className="size-6 text-primary" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug sm:text-lg">
              {partner.name}
            </h3>
            {partner.partnership ? (
              <p className="mt-1 text-xs font-medium leading-relaxed text-primary sm:text-sm">
                {partner.partnership}
              </p>
            ) : null}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground/85">
          {partner.description}
        </p>

        <div className="mt-auto pt-5">
          {partner.location ? (
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-foreground/75 sm:text-sm">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {partner.location}
            </p>
          ) : null}
          <a
            href={partner.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:border-primary/50 hover:text-primary"
            aria-label={`${partner.name}の公式サイトを見る（新しいタブで開きます）`}
          >
            公式サイトを見る
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </article>
    </li>
  );
}

export function PartnerCompaniesSection() {
  const partnerListJsonLd = partnerCompanies.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Make It Tech パートナー企業",
        url: `${site.url}/about#partners`,
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
      }
    : null;

  return (
    <Section
      eyebrow="パートナー企業"
      title="事業をともに支えるパートナー"
      description="Make It Techと協業・連携について合意している企業をご紹介します。"
      className="bg-secondary/35"
    >
      <div id="partners" className="scroll-mt-28">
        {partnerCompanies.length ? (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {partnerCompanies.map((partner) => (
              <PartnerCard key={partner.websiteUrl} partner={partner} />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:rounded-3xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">パートナー企業情報は準備中です</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  掲載について合意した企業から順次ご紹介します。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {partnerListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(partnerListJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
    </Section>
  );
}
