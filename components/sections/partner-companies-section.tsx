import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { Section } from "@/components/layout/section";
import {
  partnerCompanies,
  type PartnerCompany,
} from "@/content/pages/about-partners";
import { site } from "@/lib/site";

type PartnerGridStyle = CSSProperties & {
  "--partner-mobile-rows": number;
  "--partner-desktop-rows": number;
};

type PartnerCardStyle = CSSProperties & {
  "--partner-mobile-row": number;
  "--partner-mobile-column": number;
  "--partner-desktop-row": number;
  "--partner-desktop-column": number;
};

function getPartnerCardStyle(index: number): PartnerCardStyle {
  const desktopPage = Math.floor(index / 9);
  const desktopIndex = index % 9;

  return {
    "--partner-mobile-row": (index % 2) + 1,
    "--partner-mobile-column": Math.floor(index / 2) + 1,
    "--partner-desktop-row": Math.floor(desktopIndex / 3) + 1,
    "--partner-desktop-column": desktopPage * 3 + (desktopIndex % 3) + 1,
  };
}

function PartnerCard({
  partner,
  index,
}: {
  partner: PartnerCompany;
  index: number;
}) {
  return (
    <li
      className="snap-start [grid-column:var(--partner-mobile-column)] [grid-row:var(--partner-mobile-row)] md:h-full md:[grid-column:var(--partner-desktop-column)] md:[grid-row:var(--partner-desktop-row)]"
      style={getPartnerCardStyle(index)}
    >
      <article className="flex flex-col rounded-xl border border-border/80 bg-card p-3 md:h-full md:rounded-2xl md:p-4 lg:p-5">
        <div className="flex items-start gap-2.5 md:gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background md:size-12 md:rounded-2xl">
            {partner.logoSrc ? (
              <Image
                src={partner.logoSrc}
                alt={partner.logoAlt ?? `${partner.name}のロゴ`}
                width={64}
                height={64}
                className="h-full w-full object-contain p-1.5 md:p-2"
              />
            ) : (
              <Building2 className="size-5 text-primary" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug md:text-lg">
              {partner.name}
            </h3>
            {partner.partnership ? (
              <p className="mt-0.5 line-clamp-1 text-[11px] font-medium leading-relaxed text-primary md:text-xs">
                {partner.partnership}
              </p>
            ) : null}
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-foreground/85 md:line-clamp-3 md:text-sm md:leading-relaxed">
              {partner.description}
            </p>
          </div>
        </div>

        <div className="mt-2 md:mt-auto md:pt-4">
          {partner.location ? (
            <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-foreground/75 md:text-xs">
              <MapPin className="size-3.5 text-primary" aria-hidden="true" />
              {partner.location}
            </p>
          ) : null}
          <a
            href={partner.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary md:min-h-10 md:rounded-xl md:text-sm"
            aria-label={`${partner.name}の公式サイトを見る（新しいタブで開きます）`}
          >
            公式サイトを見る
            <ArrowUpRight className="size-3.5 md:size-4" aria-hidden="true" />
          </a>
        </div>
      </article>
    </li>
  );
}

export function PartnerCompaniesSection() {
  const gridStyle: PartnerGridStyle = {
    "--partner-mobile-rows": Math.min(partnerCompanies.length, 2),
    "--partner-desktop-rows": Math.min(
      Math.ceil(partnerCompanies.length / 3),
      3
    ),
  };
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
          <ul
            className="grid snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 pr-4 [grid-auto-columns:min(82vw,19rem)] [grid-template-rows:repeat(var(--partner-mobile-rows),auto)] md:gap-4 md:pr-0 md:[grid-auto-columns:calc((100%_-_2rem)/3)] md:[grid-template-rows:repeat(var(--partner-desktop-rows),auto)]"
            style={gridStyle}
            tabIndex={0}
            aria-label="パートナー企業一覧。横方向にスクロールできます"
          >
            {partnerCompanies.map((partner, index) => (
              <PartnerCard
                key={partner.websiteUrl}
                partner={partner}
                index={index}
              />
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
