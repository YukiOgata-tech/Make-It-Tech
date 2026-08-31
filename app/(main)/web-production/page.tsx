import type { Metadata } from "next";
import { WebProductionPage } from "@/components/web-production/web-production-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "新潟のホームページ制作・Web制作｜SEO・MEO・AI検索対応 | Make It Tech",
  },
  description:
    "新潟の中小事業者・店舗向けホームページ制作。初期費用0円、制作費9,800円（税込）。CMS対応のWebサイト制作から、SEO・MEO・AIO、Googleレビュー、公開後の運用改善まで継続支援します。",
  keywords: [
    "新潟 ホームページ制作",
    "新潟 Web制作",
    "ホームページ制作",
    "Web制作",
    "ホームページ リニューアル",
    "店舗 ホームページ制作",
    "SEO対策",
    "MEO対策",
    "AIO対策",
    "AI検索対策",
    "CMS",
    "Googleレビュー",
  ],
  alternates: {
    canonical: "/web-production",
  },
  openGraph: {
    title: "新潟のホームページ制作・Web運用 | Make It Tech",
    description:
      "作って終わらないホームページ制作。SEO・MEO・AI検索、更新・改善まで継続して支援します。",
    url: `${site.url}/web-production`,
    type: "website",
    images: [
      {
        url: "/images/og/make-it-tech-og.webp",
        width: 1200,
        height: 630,
        alt: "Make It Tech ホームページ制作・Web運用",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "新潟のホームページ制作・Web運用 | Make It Tech",
    description:
      "Web制作からSEO・MEO・AI検索、公開後の更新・改善まで継続支援します。",
    images: ["/images/og/make-it-tech-og.webp"],
  },
};

export default function Page() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "ホームページ制作・Webマーケティング継続支援",
    serviceType: "ホームページ制作・Web運用・SEO・MEO・AIO支援",
    provider: {
      "@type": "ProfessionalService",
      name: site.searchName,
      url: site.url,
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "新潟県" },
      { "@type": "Country", name: "日本" },
    ],
    description:
      "CMSを利用したWebサイト制作と、公開後の更新・改善、SEO・MEO・AIO、Googleレビュー、店舗導線を継続して支援します。",
    offers: [
      {
        "@type": "Offer",
        name: "Webサイト制作費",
        price: "9800",
        priceCurrency: "JPY",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: "9800",
          priceCurrency: "JPY",
          valueAddedTaxIncluded: true,
        },
      },
      {
        "@type": "Offer",
        name: "Web運用・改善・Webマーケティング継続支援",
        price: "24980",
        priceCurrency: "JPY",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "24980",
          priceCurrency: "JPY",
          unitText: "月",
          valueAddedTaxIncluded: true,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <WebProductionPage />
    </>
  );
}
