import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchAnnouncementBySlug } from "@/lib/announcements-data";
import { categoryLabelMap } from "@/lib/announcements";
import { site } from "@/lib/site";
import { rehypePlugins, remarkPlugins } from "@/lib/markdown";
import { ShareButton } from "@/components/news/share-button";
import { MarkdownImage } from "@/components/content/markdown-image";
import { MarkdownLink } from "@/components/content/markdown-link";
import { MarkdownTable } from "@/components/content/markdown-table";

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
  const record = await fetchAnnouncementBySlug(slug);
  if (!record) {
    return {
      title: "お知らせ",
      description: "お知らせの詳細ページです。",
    };
  }

  const description = record.summary || "お知らせの詳細ページです。";
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
      canonical: `${site.url}/news/${record.slug}`,
    },
    openGraph: {
      title: record.title,
      description,
      url: `${site.url}/news/${record.slug}`,
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

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ?? "";
  const record = await fetchAnnouncementBySlug(slug);
  if (!record) return notFound();

  const linkMap = new Map(
    (record.links ?? []).map((link) => [link.url, link])
  );

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
          <div className="h-24 w-full overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 sm:h-24 sm:w-32">
            <img src={data.image} alt={data.title || host} className="h-full w-full object-cover" />
          </div>
        ) : null}
      </a>
    );
  };

  return (
    <div className="py-8 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
          <Badge variant="secondary" className="rounded-xl">
            {categoryLabelMap[record.category] ?? "お知らせ"}
          </Badge>
          <span>{formatDate(record.publishedAt)}</span>
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
            <img
              src={record.coverImage.url}
              alt={record.coverImage.alt ?? record.title}
              className="h-auto w-full object-cover"
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
                    if (
                      href &&
                      (text === href || text === href.replace(/^https?:\/\//, ""))
                    ) {
                      return <LinkCard url={href} />;
                    }
                  }
                }
                return <p>{children}</p>;
              },
              img: MarkdownImage,
              a: MarkdownLink,
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
