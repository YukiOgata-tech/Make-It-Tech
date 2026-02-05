import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchLatestAnnouncements } from "@/lib/announcements-data";
import { categoryLabelMap } from "@/lib/announcements";

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

  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="secondary" className="rounded-xl">
              お知らせ
            </Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              最新の動向
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              企業の動きや支援実績をまとめています。
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/news">
              一覧を見る <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-3">
          {announcements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground md:col-span-3">
              まだお知らせはありません。
            </div>
          ) : (
            announcements.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group rounded-3xl border border-border/60 bg-background/70 p-4 transition hover:border-primary/40"
              >
                <div className="flex h-full flex-col gap-3">
                  <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-secondary/30">
                    {item.coverImage?.url ? (
                      <img
                        src={item.coverImage.url}
                        alt={item.coverImage.alt ?? item.title}
                        className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-36 w-full bg-gradient-to-br from-primary/10 via-background/60 to-secondary/40" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[11px] text-primary">
                      {categoryLabelMap[item.category] ?? "お知らせ"}
                    </span>
                    <span>{formatDate(item.publishedAt)}</span>
                  </div>

                  <div className="grid gap-1.5">
                    <p className="text-sm font-semibold leading-snug">{item.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                      {item.summary || "詳細は本文をご確認ください。"}
                    </p>
                  </div>

                  <span className="mt-auto inline-flex items-center gap-2 text-xs font-medium text-primary">
                    詳細を見る <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
