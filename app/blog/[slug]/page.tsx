import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShareButton } from "@/components/news/share-button";
import { blogCategoryLabelMap } from "@/lib/blog";
import { fetchBlogBySlug } from "@/lib/blog-data";
import { rehypePlugins, remarkPlugins } from "@/lib/markdown";
import { site } from "@/lib/site";

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ?? "";
  const record = await fetchBlogBySlug(slug);
  if (!record) {
    return {
      title: "ブログ",
      description: "ブログの詳細ページです。",
    };
  }

  const description = record.summary || "ブログの詳細ページです。";
  const rawCoverUrl = record.coverImage?.url;
  const ogImage = rawCoverUrl
    ? rawCoverUrl.startsWith("http")
      ? rawCoverUrl
      : `${site.url}${rawCoverUrl.startsWith("/") ? "" : "/"}${rawCoverUrl}`
    : `${site.url}${site.ogImage}`;

  return {
    title: record.title,
    description,
    alternates: {
      canonical: `${site.url}/blog/${record.slug}`,
    },
    openGraph: {
      title: record.title,
      description,
      url: `${site.url}/blog/${record.slug}`,
      type: "article",
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

export default async function BlogDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ?? "";
  const record = await fetchBlogBySlug(slug);
  if (!record) return notFound();

  const rawCoverUrl = record.coverImage?.url;
  const ogImage = rawCoverUrl
    ? rawCoverUrl.startsWith("http")
      ? rawCoverUrl
      : `${site.url}${rawCoverUrl.startsWith("/") ? "" : "/"}${rawCoverUrl}`
    : `${site.url}${site.ogImage}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: record.title,
    description: record.summary ?? "",
    image: [ogImage],
    datePublished: record.publishedAt?.toISOString(),
    dateModified: record.updatedAt?.toISOString() ?? record.publishedAt?.toISOString(),
    author: {
      "@type": "Organization",
      name: site.name,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}${site.logo}`,
      },
    },
    mainEntityOfPage: `${site.url}/blog/${record.slug}`,
  };

  return (
    <div className="py-10 sm:py-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {record.category ? (
            <Badge variant="secondary" className="rounded-xl">
              {blogCategoryLabelMap[record.category] ?? "ブログ"}
            </Badge>
          ) : null}
          <span>{formatDate(record.publishedAt)}</span>
          {record.tags?.length ? (
            <span className="text-[11px] text-muted-foreground">
              {record.tags.map((tag) => `#${tag}`).join(" ")}
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
          {record.title}
        </h1>

        {record.summary ? (
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {record.summary}
          </p>
        ) : null}

        <div className="mt-3">
          <ShareButton url={`${site.url}/blog/${record.slug}`} title={record.title} />
        </div>

        {record.coverImage?.url ? (
          <div className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-secondary/30">
            <img
              src={record.coverImage.url}
              alt={record.coverImage.alt ?? record.title}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        <Separator className="my-8 sm:my-10" />

        <div className="prose prose-base max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary/50 hover:prose-a:decoration-primary prose-img:rounded-2xl sm:prose-lg">
          <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
            {record.content || "本文は準備中です。"}
          </ReactMarkdown>
        </div>

        <div className="mt-10 text-sm">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-primary underline underline-offset-4"
          >
            ブログ一覧に戻る
          </a>
        </div>
      </div>
    </div>
  );
}
