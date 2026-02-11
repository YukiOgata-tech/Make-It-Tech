import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShareButton } from "@/components/news/share-button";
import { MarkdownImage } from "@/components/content/markdown-image";
import { MarkdownLink } from "@/components/content/markdown-link";
import { MarkdownTable } from "@/components/content/markdown-table";
import { blogCategoryLabelMap } from "@/lib/blog";
import { fetchBlogBySlug } from "@/lib/blog-data";
import { rehypePlugins, remarkPlugins } from "@/lib/markdown";
import { buildHeadingSequence } from "@/lib/markdown-toc";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  normalizeInternalHref,
  resolveInternalLinkTitle,
} from "@/lib/internal-link-titles";
import {
  buildLinkLabelMap,
  normalizeLinkLabelUrl,
} from "@/lib/link-labels";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

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

  const headingSequence = buildHeadingSequence(record.content ?? "");
  const tocItems = headingSequence.filter(
    (heading) => heading.level === 2 || heading.level === 3
  );
  const linkLabelMap = buildLinkLabelMap(record.linkLabels);
  let headingIndex = 0;
  const nextHeadingId = () => {
    const entry = headingSequence[headingIndex];
    headingIndex += 1;
    return entry?.id;
  };

  const blogRehypePlugins = rehypePlugins.filter((plugin) => {
    if (plugin === rehypeSlug) return false;
    if (Array.isArray(plugin) && plugin[0] === rehypeAutolinkHeadings) return false;
    return true;
  });

  return (
    <div className="py-8 sm:py-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
          {record.category ? (
            <Badge variant="secondary" className="rounded-xl">
              {blogCategoryLabelMap[record.category] ?? "ブログ"}
            </Badge>
          ) : null}
          <span>{formatDate(record.publishedAt)}</span>
          {record.tags?.length ? (
            <span className="text-[10px] text-muted-foreground sm:text-[11px]">
              {record.tags.map((tag) => `#${tag}`).join(" ")}
            </span>
          ) : null}
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
          <ShareButton url={`${site.url}/blog/${record.slug}`} title={record.title} />
        </div>

        {record.coverImage?.url ? (
          <div className="mt-4 overflow-hidden rounded-3xl border border-border/60 bg-secondary/30 sm:mt-6">
            <img
              src={record.coverImage.url}
              alt={record.coverImage.alt ?? record.title}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        {tocItems.length >= 2 ? (
          <nav className="mt-4 border-t border-border/50 pt-3">
            <p className="text-xs font-semibold text-muted-foreground sm:text-sm">目次</p>
            <ul className="mt-2 grid gap-2 text-xs sm:text-sm">
              {tocItems.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-start gap-2 leading-snug",
                    item.level === 3 ? "pl-3 text-[11px] sm:text-xs" : ""
                  )}
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
                  <a
                    href={`#${item.id}`}
                    className="article-link article-link--internal no-underline hover:underline"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <Separator className="my-6 sm:my-10" />

        <div className="article-prose prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary/50 hover:prose-a:decoration-primary prose-img:rounded-2xl sm:prose-lg">
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={blogRehypePlugins}
            components={{
              img: MarkdownImage,
              a({ href = "", children, ...props }) {
                const childText = getSingleText(children);
                const normalizedInternal = normalizeInternalHref(href);
                const labelOverride = linkLabelMap.get(
                  normalizeLinkLabelUrl(href)
                );
                const internalTitle = resolveInternalLinkTitle(href);
                const replacement = labelOverride ?? internalTitle;
                const shouldReplace =
                  Boolean(childText) &&
                  (childText === href ||
                    (normalizedInternal && childText === normalizedInternal) ||
                    childText === href.replace(/^https?:\/\//, ""));
                return (
                  <MarkdownLink href={href} {...props}>
                    {shouldReplace && replacement ? replacement : children}
                  </MarkdownLink>
                );
              },
              table: MarkdownTable,
              h1({ children, ...props }) {
                const id = nextHeadingId();
                return (
                  <h1 id={id ?? props.id} {...props}>
                    {children}
                  </h1>
                );
              },
              h2({ children, ...props }) {
                const id = nextHeadingId();
                return (
                  <h2 id={id ?? props.id} {...props}>
                    {children}
                  </h2>
                );
              },
              h3({ children, ...props }) {
                const id = nextHeadingId();
                return (
                  <h3 id={id ?? props.id} {...props}>
                    {children}
                  </h3>
                );
              },
              h4({ children, ...props }) {
                const id = nextHeadingId();
                return (
                  <h4 id={id ?? props.id} {...props}>
                    {children}
                  </h4>
                );
              },
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
                return <p>{children}</p>;
              },
            }}
          >
            {record.content || "本文は準備中です。"}
          </ReactMarkdown>
        </div>

        <div className="mt-8 text-xs sm:mt-10 sm:text-sm">
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
