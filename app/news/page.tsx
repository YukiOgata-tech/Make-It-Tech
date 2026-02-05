import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchAnnouncementList } from "@/lib/announcements-data";
import { categoryLabelMap } from "@/lib/announcements";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "Make It Tech のお知らせ・メディア・実績情報を掲載しています。",
  keywords: ["お知らせ", "メディア", "実績", "DX", "IT", "新潟"],
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

export default async function NewsPage() {
  const announcements = await fetchAnnouncementList();

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-10">
          <Badge variant="secondary" className="rounded-xl">
            お知らせ
          </Badge>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
            お知らせ・動向
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            企業の動きや支援実績、メディア掲載情報をまとめています。
          </p>
        </div>

        <Separator className="my-6 sm:my-10" />

        <div className="grid gap-4 sm:gap-6">
          {announcements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
              現在、お知らせはありません。
            </div>
          ) : (
            announcements.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group rounded-3xl border border-border/60 bg-background/70 p-4 transition hover:border-primary/40 sm:p-6"
              >
                <div className="grid gap-4 sm:grid-cols-[180px,1fr] sm:items-start">
                  <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-secondary/30">
                    {item.coverImage?.url ? (
                      <img
                        src={item.coverImage.url}
                        alt={item.coverImage.alt ?? item.title}
                        className="h-32 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-28"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-32 w-full bg-gradient-to-br from-primary/10 via-background/60 to-secondary/40 sm:h-28" />
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[11px] text-primary">
                        {categoryLabelMap[item.category] ?? "お知らせ"}
                      </span>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    <div>
                      <p className="text-base font-semibold leading-snug sm:text-lg">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
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
