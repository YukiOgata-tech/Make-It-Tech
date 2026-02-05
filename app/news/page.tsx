import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchAnnouncementList } from "@/lib/announcements-data";
import { announcementCategories, categoryLabelMap } from "@/lib/announcements";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "Make It Tech のお知らせ・メディア・実績情報を掲載しています。",
  keywords: ["お知らせ", "メディア", "実績", "DX", "IT", "新潟"],
};

type PageProps = {
  searchParams?: Promise<{ category?: string }>;
};

function formatDate(date?: Date) {
  if (!date) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

export default async function NewsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const activeCategory =
    typeof resolvedSearchParams?.category === "string" ? resolvedSearchParams.category : "all";
  const announcements = await fetchAnnouncementList();
  const filteredAnnouncements =
    activeCategory === "all"
      ? announcements
      : announcements.filter((item) => item.category === activeCategory);
  const categories = [
    { value: "all", label: "すべて" },
    ...announcementCategories,
  ];

  return (
    <div className="py-10 sm:py-16">
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

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category.value;
            const href = category.value === "all" ? "/news" : `/news?category=${category.value}`;
            return (
              <Link
                key={category.value}
                href={href}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {category.label}
              </Link>
            );
          })}
        </div>

        <Separator className="my-6 sm:my-10" />

        <div className="grid gap-4 sm:gap-6">
          {filteredAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
              該当するお知らせはありません。
            </div>
          ) : (
            filteredAnnouncements.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group rounded-3xl border border-border/60 bg-background/70 p-3 transition hover:border-primary/40 sm:p-6"
              >
                <div className="grid gap-3 sm:flex sm:items-start sm:gap-4">
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 sm:h-24 sm:w-40 sm:shrink-0 md:h-28 md:w-52">
                    {item.coverImage?.url ? (
                      <img
                        src={item.coverImage.url}
                        alt={item.coverImage.alt ?? item.title}
                        className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/10 via-background/60 to-secondary/40" />
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                      <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] text-primary sm:text-[11px]">
                        {categoryLabelMap[item.category] ?? "お知らせ"}
                      </span>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold leading-snug sm:text-lg">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:text-sm sm:line-clamp-3">
                        {item.summary || "詳細は本文をご確認ください。"}
                      </p>
                    </div>
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
