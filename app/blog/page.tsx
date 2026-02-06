import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchBlogList } from "@/lib/blog-data";
import { blogCategoryLabelMap } from "@/lib/blog";

export const metadata: Metadata = {
  title: "ブログ",
  description: "事業所の悩みやDX課題を解決するヒントをまとめたブログです。",
  keywords: ["ブログ", "業務改善", "DX", "IT", "補助金", "新潟"],
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

export default async function BlogPage() {
  const posts = await fetchBlogList();

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-10">
          <Badge variant="secondary" className="rounded-xl">
            ブログ
          </Badge>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
            事業所の悩みを解決するヒント
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            現場の悩みやDXの進め方、補助金の使い方まで。実務目線で、すぐ使える解説をまとめます。
          </p>
        </div>

        <Separator className="my-6 sm:my-10" />

        <div className="grid gap-4 sm:gap-6">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
              現在、公開中のブログはありません。
            </div>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-3xl border border-border/60 bg-background/70 p-3 transition hover:border-primary/40 sm:p-6"
              >
                <div className="grid gap-4 md:grid-cols-[260px,1fr] md:items-start">
                  <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 md:h-auto md:aspect-[4/3]">
                    {post.coverImage?.url ? (
                      <img
                        src={post.coverImage.url}
                        alt={post.coverImage.alt ?? post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/10 via-background/60 to-secondary/40" />
                    )}
                  </div>

                  <div className="grid gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {post.category ? (
                        <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[11px] text-primary">
                          {blogCategoryLabelMap[post.category] ?? "ブログ"}
                        </span>
                      ) : null}
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>

                    <div>
                      <h2 className="text-base font-semibold leading-snug sm:text-lg">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {post.summary || "詳細は本文をご確認ください。"}
                      </p>
                    </div>

                    {post.tags?.length ? (
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
