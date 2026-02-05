import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchLatestAnnouncements } from "@/lib/announcements-data";
import { categoryLabelMap } from "@/lib/announcements";
import type { AnnouncementRecord } from "@/lib/announcements-data";

const mockAnnouncements: AnnouncementRecord[] = [
  {
    id: "mock-1",
    title: "メディア掲載のお知らせ",
    slug: "mock-media-feature",
    summary: "地方DXの取り組みが特集記事として紹介されました。",
    category: "media",
    status: "published",
    coverImage: {
      url: "/images/bg-design-01.png",
      alt: "メディア掲載のサムネイル",
    },
    publishedAt: new Date("2026-02-01T09:00:00+09:00"),
  },
  {
    id: "mock-2",
    title: "実績紹介: 業務自動化プロジェクト",
    slug: "mock-case-study",
    summary: "月次集計作業を自動化し、約60%の工数削減を実現しました。",
    category: "case",
    status: "published",
    coverImage: {
      url: "/images/bg-design-02.png",
      alt: "実績紹介のサムネイル",
    },
    publishedAt: new Date("2026-01-28T10:30:00+09:00"),
  },
  {
    id: "mock-3",
    title: "お知らせ: 無料相談枠の追加",
    slug: "mock-news-update",
    summary: "対面相談の枠を追加し、より早くご相談いただけるようになりました。",
    category: "news",
    status: "published",
    coverImage: {
      url: "/images/bg-3-light.png",
      alt: "お知らせのサムネイル",
    },
    publishedAt: new Date("2026-01-24T15:00:00+09:00"),
  },
];

function formatDate(date?: Date) {
  if (!date) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

export async function AnnouncementsSection() {
  const announcements = await fetchLatestAnnouncements();
  const displayAnnouncements =
    announcements.length === 0 && process.env.NODE_ENV !== "production"
      ? mockAnnouncements
      : announcements;

  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="rounded-xl">
              お知らせ
            </Badge>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-3xl">
              最新のお知らせ
            </h2>
          </div>
          <div className="hidden w-full sm:flex sm:w-auto sm:justify-end">
            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl sm:w-auto"
            >
              <Link href="/news">
                お知らせ一覧へ <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-0 sm:gap-4 sm:mt-8 md:grid-cols-3">
          {displayAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground md:col-span-3">
              まだお知らせはありません。
            </div>
          ) : (
            displayAnnouncements.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group border-y border-border/40 py-2 transition hover:bg-background/40 sm:rounded-3xl sm:border sm:border-border/60 sm:bg-background/70 sm:px-4 sm:py-4 sm:hover:border-primary/40"
              >
                <div className="flex h-full flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-secondary/30 sm:h-32 sm:w-full sm:rounded-2xl">
                      {item.coverImage?.url ? (
                        <img
                          src={item.coverImage.url}
                          alt={item.coverImage.alt ?? item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/10 via-background/60 to-secondary/40" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 sm:hidden">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] text-primary">
                          {categoryLabelMap[item.category] ?? "お知らせ"}
                        </span>
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>
                      <div className="grid gap-0 sm:gap-0.5">
                        <p className="text-xs font-semibold leading-snug">{item.title}</p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                    <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[11px] text-primary">
                      {categoryLabelMap[item.category] ?? "お知らせ"}
                    </span>
                    <span>{formatDate(item.publishedAt)}</span>
                  </div>

                  <div className="hidden gap-1.5 sm:grid">
                    <p className="text-sm font-semibold leading-snug">{item.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                      {item.summary || "詳細は本文をご確認ください。"}
                    </p>
                  </div>

                  <span className="hidden items-center gap-2 text-xs font-medium text-primary sm:inline-flex">
                    詳細へ <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-2 sm:hidden w-auto flex justify-center">
          <Button asChild variant="outline" className="w-1/2 rounded-xl border-0 bg-none">
            <Link href="/news" className="underline-offset">
              一覧を見る <ArrowRight className="sm:ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
