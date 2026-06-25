"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  announcementCategories,
  categoryLabelMap,
  type AnnouncementCategory,
} from "@/lib/announcements";

type AnnouncementListItem = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  category: AnnouncementCategory;
  coverImage?: {
    url?: string;
    alt?: string;
  };
  publishedAt?: string;
};

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

export function AnnouncementList({ items }: { items: AnnouncementListItem[] }) {
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category") ?? "all";
  const activeCategory = announcementCategories.some(
    (category) => category.value === requestedCategory
  )
    ? requestedCategory
    : "all";
  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);
  const categories = [
    { value: "all", label: "すべて" },
    ...announcementCategories,
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.value;
          const href =
            category.value === "all"
              ? "/news"
              : `/news?category=${category.value}`;

          return (
            <Link
              key={category.value}
              href={href}
              scroll={false}
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

      <div className="mt-6 grid gap-4 border-t border-border/60 pt-6 sm:mt-10 sm:gap-6 sm:pt-10">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
            該当するお知らせはありません。
          </div>
        ) : (
          filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="group rounded-3xl border border-border/60 bg-background/70 p-3 transition hover:border-primary/40 sm:p-6"
            >
              <div className="grid gap-3 sm:flex sm:items-start sm:gap-4">
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 sm:h-24 sm:w-40 sm:shrink-0 md:h-28 md:w-52">
                  {item.coverImage?.url ? (
                    <Image
                      src={item.coverImage.url}
                      alt={item.coverImage.alt ?? item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 208px"
                      className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
                      unoptimized={item.coverImage.url.startsWith("http")}
                    />
                  ) : (
                    <div className="h-full w-full bg-linear-to-br from-primary/10 via-background/60 to-secondary/40" />
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
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:line-clamp-3 sm:text-sm">
                      {item.summary || "詳細は本文をご確認ください。"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
