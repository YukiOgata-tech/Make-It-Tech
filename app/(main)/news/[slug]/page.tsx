import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchAnnouncementBySlug } from "@/lib/announcements-data";
import { categoryLabelMap } from "@/lib/announcements";
import { buildMetaDescription } from "@/lib/seo";
import { site } from "@/lib/site";
import { rehypePlugins, remarkPlugins } from "@/lib/markdown";
import { ShareButton } from "@/components/news/share-button";
import { MarkdownImage } from "@/components/content/markdown-image";
import { MarkdownLink } from "@/components/content/markdown-link";
import { MarkdownTable } from "@/components/content/markdown-table";
import {
  normalizeInternalHref,
  resolveInternalLinkTitle,
} from "@/lib/internal-link-titles";
import {
  buildLinkLabelMap,
  normalizeLinkLabelUrl,
} from "@/lib/link-labels";

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = false;

type PageProps = {
  params?: Promise<{ slug: string }>;
};

function toDateValue(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (value && typeof value === "object") {
    const maybeSeconds = (value as { seconds?: unknown; _seconds?: unknown }).seconds;
    const maybeAltSeconds = (value as { _seconds?: unknown })._seconds;
    const seconds =
      typeof maybeSeconds === "number"
        ? maybeSeconds
        : typeof maybeAltSeconds === "number"
          ? maybeAltSeconds
          : null;
    if (seconds !== null) {
      return new Date(seconds * 1000);
    }
  }
  return undefined;
}

function formatDate(value?: unknown) {
  const date = toDateValue(value);
  if (!date) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

function getSingleText(children: React.ReactNode) {
  const nodes = React.Children.toArray(children);
  if (nodes.length !== 1) return null;
  return typeof nodes[0] === "string" ? nodes[0] : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ?? "";
  const record = await fetchAnnouncementBySlug(slug);
  if (!record) {
    return {
      title: "お知らせが見つかりません",
      description: "指定されたお知らせは見つかりませんでした。",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = buildMetaDescription(
    record.summary,
    `${record.title}に関するお知らせです。Make It TechのIT・DX支援、Web制作、業務改善、支援実績、メディア掲載、サービス更新に関する詳しい情報を掲載しています。`,
  );
  const rawCoverUrl = record.coverImage?.url;
  const ogImage = rawCoverUrl
    ? rawCoverUrl.startsWith("http")
      ? rawCoverUrl
      : `${site.url}${rawCoverUrl.startsWith("/") ? "" : "/"}${rawCoverUrl}`
    : `${site.url}${site.ogImage}`;

  return {
    title: record.title,
    description,
    authors: [{ name: site.name, url: `${site.url}/about` }],
    creator: site.name,
    publisher: site.name,
    alternates: {
      canonical: `${site.url}/news/${record.slug}`,
    },
    openGraph: {
      title: record.title,
      description,
      url: `${site.url}/news/${record.slug}`,
      siteName: site.searchName,
      locale: site.locale,
      type: "article",
      publishedTime: record.publishedAt?.toISOString(),
      modifiedTime: record.updatedAt?.toISOString() ?? record.publishedAt?.toISOString(),
      authors: [`${site.url}/about`],
      section: categoryLabelMap[record.category] ?? "お知らせ",
      images: [
        {
          url: ogImage,
          alt: record.coverImage?.alt ?? record.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: record.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ?? "";
  const record = await fetchAnnouncementBySlug(slug);
  if (!record) return notFound();
  const publishedAtIso = record.publishedAt?.toISOString();
  const updatedAtIso = record.updatedAt?.toISOString();
  const showUpdatedAt =
    Boolean(record.updatedAt && record.publishedAt) &&
    record.updatedAt!.getTime() > record.publishedAt!.getTime() + 60_000;

  const linkMap = new Map(
    (record.links ?? []).map((link) => [link.url, link])
  );
  const linkLabelMap = buildLinkLabelMap(record.linkLabels);
  const rawCoverUrl = record.coverImage?.url;
  const articleImage = rawCoverUrl
    ? rawCoverUrl.startsWith("http")
      ? rawCoverUrl
      : new URL(rawCoverUrl, site.url).toString()
    : new URL(site.ogImage, site.url).toString();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: record.title,
    description: record.summary ?? "",
    image: [articleImage],
    url: `${site.url}/news/${record.slug}`,
    inLanguage: "ja-JP",
    articleSection: categoryLabelMap[record.category] ?? "お知らせ",
    datePublished: record.publishedAt?.toISOString(),
    dateModified: record.updatedAt?.toISOString() ?? record.publishedAt?.toISOString(),
    author: {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: `${site.url}/about`,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: new URL(site.logo, site.url).toString(),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/news/${record.slug}`,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "トップ",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "お知らせ",
        item: `${site.url}/news`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: record.title,
        item: `${site.url}/news/${record.slug}`,
      },
    ],
  };

  const LinkCard = ({ url }: { url: string }) => {
    const data = linkMap.get(url);
    if (!data) {
      return (
        <a href={url} className="text-primary underline underline-offset-2" target="_blank" rel="noreferrer">
          {url}
        </a>
      );
    }
    const host = (() => {
      try {
        return new URL(url).hostname.replace("www.", "");
      } catch {
        return url;
      }
    })();
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group not-prose flex flex-col gap-3 rounded-3xl border border-border/60 bg-background/70 p-4 transition hover:border-primary/40 sm:flex-row"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{data.title || host}</p>
          {data.description ? (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{data.description}</p>
          ) : null}
          <p className="mt-2 text-[11px] text-muted-foreground">{host}</p>
        </div>
        {data.image ? (
          <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 sm:h-24 sm:w-32">
            <Image
              src={data.image}
              alt={data.title || host}
              fill
              sizes="(max-width: 640px) 100vw, 128px"
              className="object-cover"
              unoptimized={data.image.startsWith("http")}
            />
          </div>
        ) : null}
      </a>
    );
  };

  return (
    <div className="py-8 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
          <Badge variant="secondary" className="rounded-xl">
            {categoryLabelMap[record.category] ?? "お知らせ"}
          </Badge>
          {publishedAtIso ? (
            <time dateTime={publishedAtIso}>公開: {formatDate(record.publishedAt)}</time>
          ) : null}
          {showUpdatedAt && updatedAtIso ? (
            <time dateTime={updatedAtIso}>更新: {formatDate(record.updatedAt)}</time>
          ) : null}
          <span>発信: {site.name}</span>
        </div>

        <h1 className="mt-3 text-[1.4rem] font-semibold leading-snug tracking-tight sm:text-4xl">
          {record.title}
        </h1>

        {record.summary ? (
          <p className="mt-2 text-xs text-muted-foreground sm:text-base">
            {record.summary}
          </p>
        ) : null}

        <div className="mt-3">
          <ShareButton url={`${site.url}/news/${record.slug}`} title={record.title} />
        </div>

        {record.coverImage?.url ? (
          <div className="mt-4 overflow-hidden rounded-3xl border border-border/60 bg-secondary/30 sm:mt-6">
            <Image
              src={record.coverImage.url}
              alt={record.coverImage.alt ?? record.title}
              width={1200}
              height={630}
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-auto w-full object-cover"
              priority
              unoptimized={record.coverImage.url.startsWith("http")}
            />
          </div>
        ) : null}

        <Separator className="my-6 sm:my-10" />

        <div className="article-prose prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary/50 hover:prose-a:decoration-primary prose-img:rounded-2xl sm:prose-lg">
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={{
              p({ children }) {
                const nodes = React.Children.toArray(children).filter((node) => {
                  if (typeof node === "string") {
                    return node.trim().length > 0;
                  }
                  return true;
                });
                if (
                  nodes.length === 1 &&
                  React.isValidElement(nodes[0]) &&
                  nodes[0].type === MarkdownImage
                ) {
                  return <>{nodes[0]}</>;
                }
                if (nodes.length === 1 && React.isValidElement(nodes[0])) {
                  const child = nodes[0];
                  if (child.type === MarkdownLink || child.type === "a") {
                    const element = child as React.ReactElement<{
                      href?: string;
                      children?: React.ReactNode;
                    }>;
                    const href = typeof element.props.href === "string" ? element.props.href : "";
                    const text =
                      typeof element.props.children === "string"
                        ? element.props.children
                        : "";
                    if (href?.startsWith("http") && (text === href || text === href.replace(/^https?:\/\//, ""))) {
                      return <LinkCard url={href} />;
                    }
                  }
                }
                return <p>{children}</p>;
              },
              img: MarkdownImage,
              a({ href = "", children, ...props }) {
                const label = resolveInternalLinkTitle(href);
                const childText = getSingleText(children);
                const normalized = normalizeInternalHref(href);
                const labelOverride = linkLabelMap.get(normalizeLinkLabelUrl(href));
                const replacement = labelOverride ?? label;
                const shouldReplace =
                  Boolean(childText) &&
                  (childText === href ||
                    (normalized && childText === normalized) ||
                    childText === href.replace(/^https?:\/\//, ""));
                return (
                  <MarkdownLink href={href} {...props}>
                    {shouldReplace && replacement ? replacement : children}
                  </MarkdownLink>
                );
              },
              table: MarkdownTable,
            }}
          >
            {record.content || "本文は準備中です。"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
