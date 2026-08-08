import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { AnnouncementList } from "@/components/news/announcement-list";
import { fetchAnnouncementList } from "@/lib/announcements-data";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "お知らせ・メディア掲載・実績情報",
  description:
    "Make It Tech のお知らせ、メディア掲載、支援実績、サービス更新情報を掲載しています。新潟のIT・DX支援やWeb制作に関する最新の動向を確認できます。",
  keywords: ["お知らせ", "メディア", "実績", "DX", "IT", "新潟"],
  alternates: {
    canonical: `${site.url}/news`,
  },
  openGraph: {
    title: "お知らせ・メディア掲載・実績情報",
    description:
      "Make It Techのお知らせ、メディア掲載、支援実績、サービス更新情報を掲載しています。",
    url: `${site.url}/news`,
    siteName: site.searchName,
    locale: site.locale,
    type: "website",
    images: [
      {
        url: site.ogImage,
        width: 1200,
        height: 630,
        alt: `${site.name} お知らせ`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "お知らせ・メディア掲載・実績情報",
    description:
      "Make It Techのお知らせ、メディア掲載、支援実績、サービス更新情報を掲載しています。",
    images: [site.ogImage],
  },
};

export default async function NewsPage() {
  const announcements = await fetchAnnouncementList();
  const items = announcements.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    category: item.category,
    coverImage: item.coverImage,
    publishedAt: item.publishedAt?.toISOString(),
  }));
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/news#collection`,
    name: "お知らせ・メディア掲載・実績情報",
    description: metadata.description,
    url: `${site.url}/news`,
    inLanguage: "ja-JP",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.searchName,
      url: site.url,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: announcements.slice(0, 50).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${site.url}/news/${item.slug}`,
        name: item.title,
      })),
    },
  };

  return (
    <div className="py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-10">
          <Badge variant="secondary" className="rounded-xl">
            お知らせ
          </Badge>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
            お知らせ･動向
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Make It Tech の動向や支援実績、メディア情報を掲載していきます。
          </p>
        </div>

        <Suspense fallback={<div className="h-40" aria-hidden="true" />}>
          <AnnouncementList items={items} />
        </Suspense>
      </div>
    </div>
  );
}
