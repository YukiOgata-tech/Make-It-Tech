import type { Metadata } from "next";
import { WebProductionPage } from "@/components/web-production/web-production-page";
import { webProductionFaqItems } from "@/content/pages/web-production";
import { site } from "@/lib/site";

const pagePath = "/web-production";
const pageUrl = `${site.url}${pagePath}`;
const pageTitle = "新潟のホームページ制作・Web制作｜SEO・MEO・AI検索対応";
const pageDescription =
  "新潟の中小事業者・店舗向けホームページ制作。初期費用0円、制作費9,800円（税込）。CMS対応のWeb制作からSEO・MEO・AI検索対策、公開後の更新・改善まで継続支援します。";
const heroImagePath = "/images/web-production/hero-web-production.png";
const heroImageUrl = `${site.url}${heroImagePath}`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: `${pageTitle} | ${site.searchName}`,
    description: pageDescription,
    url: pageUrl,
    siteName: site.searchName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: heroImagePath,
        width: 1536,
        height: 1024,
        alt: "Make It Techのホームページ制作・Web運用支援",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | ${site.searchName}`,
    description: pageDescription,
    images: [heroImagePath],
  },
};

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${pageTitle} | ${site.searchName}`,
        description: pageDescription,
        inLanguage: "ja-JP",
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${pageUrl}/#service` },
        mainEntity: [
          { "@id": `${pageUrl}/#service` },
          { "@id": `${pageUrl}/#faq` },
        ],
        breadcrumb: { "@id": `${pageUrl}/#breadcrumb` },
        primaryImageOfPage: { "@id": `${pageUrl}/#primaryimage` },
      },
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}/#primaryimage`,
        url: heroImageUrl,
        contentUrl: heroImageUrl,
        width: 1536,
        height: 1024,
        caption: "Make It Techのホームページ制作・Web運用支援",
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}/#service`,
        name: "ホームページ制作・Webマーケティング継続支援",
        url: pageUrl,
        description: pageDescription,
        serviceType: [
          "ホームページ制作",
          "Webサイト運用",
          "SEO対策",
          "MEO対策",
          "AIO・AI検索対策",
        ],
        provider: { "@id": `${site.url}/#organization` },
        areaServed: [
          { "@type": "AdministrativeArea", name: "新潟県" },
          { "@type": "Country", name: "日本" },
        ],
        offers: [
          {
            "@type": "Offer",
            name: "Webサイト制作費",
            description: "完成形を確認し、公開を決定した場合に発生する制作費。初期費用は0円。",
            url: `${pageUrl}#pricing`,
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
            description: "公開後の更新・改善、SEO・MEO・AIOを含む月額の継続支援。",
            url: `${pageUrl}#pricing`,
            price: "24980",
            priceCurrency: "JPY",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "24980",
              priceCurrency: "JPY",
              billingDuration: "P1M",
              unitText: "月",
              valueAddedTaxIncluded: true,
            },
          },
          {
            "@type": "Offer",
            name: "店舗・現地向け追加支援",
            description: "NFCなどを活用した現地導線の設計と運用改善。NFC商品代は別途。",
            url: `${pageUrl}#pricing`,
            price: "15000",
            priceCurrency: "JPY",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "15000",
              priceCurrency: "JPY",
              billingDuration: "P1M",
              unitText: "月",
              valueAddedTaxIncluded: true,
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "ホーム",
            item: site.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "ホームページ制作",
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}/#faq`,
        mainEntity: webProductionFaqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <WebProductionPage />
    </>
  );
}
