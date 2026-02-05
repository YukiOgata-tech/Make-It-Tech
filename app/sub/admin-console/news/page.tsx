import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminRefreshButton } from "@/components/admin/admin-refresh-button";
import {
  announcementCategories,
  announcementStatuses,
  categoryLabelMap,
} from "@/lib/announcements";

export const metadata: Metadata = {
  title: "お知らせ 管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AnnouncementRecord = {
  id: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  summary?: string;
  publishedAt?: unknown;
  createdAt?: unknown;
};

function toDateString(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  }
  if (value instanceof Date) {
    return value.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  }
  return "";
}

const getCachedAnnouncements = unstable_cache(
  async () => {
    const { firestore } = getFirebaseAdmin();
    const snapshot = await firestore
      .collection("announcements")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AnnouncementRecord[];
  },
  ["admin-announcements"],
  { revalidate: false, tags: ["admin-announcements"] }
);

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const keywordQuery =
    typeof resolvedSearchParams?.q === "string"
      ? resolvedSearchParams.q.trim()
      : "";
  const categoryQuery =
    typeof resolvedSearchParams?.category === "string"
      ? resolvedSearchParams.category.trim()
      : "";
  const statusQuery =
    typeof resolvedSearchParams?.status === "string"
      ? resolvedSearchParams.status.trim()
      : "";

  const keyword = normalizeText(keywordQuery);
  const categoryFilter = normalizeText(categoryQuery);
  const statusFilter = normalizeText(statusQuery);
  const hasFilter = Boolean(keyword || categoryFilter || statusFilter);

  let records: AnnouncementRecord[] = [];
  let errorMessage = "";

  try {
    records = await getCachedAnnouncements();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "データ取得に失敗しました。";
  }

  const filteredRecords = records.filter((record) => {
    const recordTitle = normalizeText(record.title);
    const recordSlug = normalizeText(record.slug);
    const recordSummary = normalizeText(record.summary);
    const recordCategory = normalizeText(record.category);
    const recordStatus = normalizeText(record.status);

    if (categoryFilter && recordCategory !== categoryFilter) {
      return false;
    }

    if (statusFilter && recordStatus !== statusFilter) {
      return false;
    }

    if (keyword) {
      const haystack = [recordTitle, recordSlug, recordSummary].join(" ");
      if (!haystack.includes(keyword)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            お知らせ 管理
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            最新200件まで表示しています。
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/sub/admin-console/news/new">新規作成</Link>
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          対象: {filteredRecords.length}件 / 取得: {records.length}件
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/news" className="underline">
            公開ページを見る
          </Link>
          <AdminRefreshButton />
        </div>
      </div>

      <form
        action="/sub/admin-console/news"
        method="get"
        className="mt-4 grid gap-3 sm:flex sm:flex-wrap sm:items-end"
      >
        <div className="grid gap-2">
          <label htmlFor="q" className="text-xs text-muted-foreground">
            キーワード
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={keywordQuery}
            placeholder="タイトル / スラッグ / 要約"
            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm sm:h-11 sm:w-72"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="category" className="text-xs text-muted-foreground">
            カテゴリ
          </label>
          <select
            id="category"
            name="category"
            defaultValue={categoryQuery}
            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm sm:h-11 sm:w-40"
          >
            <option value="">すべて</option>
            {announcementCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="status" className="text-xs text-muted-foreground">
            状態
          </label>
          <select
            id="status"
            name="status"
            defaultValue={statusQuery}
            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm sm:h-11 sm:w-32"
          >
            <option value="">すべて</option>
            {announcementStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-10 rounded-xl border border-border/70 bg-background px-4 text-sm font-medium transition hover:border-primary/40 sm:h-11"
        >
          検索
        </button>
        {hasFilter ? (
          <Link
            href="/sub/admin-console/news"
            className="text-xs text-muted-foreground underline"
          >
            クリア
          </Link>
        ) : null}
      </form>

      {errorMessage ? (
        <p className="mt-6 text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4">
        {!errorMessage && filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-background/50 p-4 text-sm text-muted-foreground sm:p-6">
            {hasFilter ? "該当するお知らせがありません。" : "お知らせがありません。"}
          </div>
        ) : null}
        {filteredRecords.map((record) => (
          <Link
            key={record.id}
            href={`/sub/admin-console/news/${record.id}`}
            className="rounded-2xl border border-border/60 bg-background/70 p-3 transition hover:border-primary/40 sm:p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{String(record.title ?? "（無題）")}</p>
                <p className="text-xs text-muted-foreground">
                  {String(record.slug ?? "")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-xl">
                  {categoryLabelMap[(record.category ?? "news") as keyof typeof categoryLabelMap] ?? "お知らせ"}
                </Badge>
                <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
                  {record.status === "published" ? "公開" : "下書き"}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>公開日: {toDateString(record.publishedAt) || "未公開"}</span>
              <span>作成日: {toDateString(record.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
