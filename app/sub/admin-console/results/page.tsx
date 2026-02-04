import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { Badge } from "@/components/ui/badge";
import { AdminRefreshButton } from "@/components/admin/admin-refresh-button";

export const metadata: Metadata = {
  title: "業務診断 管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

const statusLabel: Record<string, string> = {
  new: "新規",
  reviewing: "確認中",
  in_progress: "対応中",
  contracted: "契約中",
  closed: "クローズ",
};

const requestTypeLabel: Record<string, string> = {
  web: "WEBサイト",
  lp: "LP",
  ec: "EC",
  dx: "DX関連",
  other: "その他",
};

type IntakeRecord = {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  requestType?: string;
  status?: string;
  createdAt?: unknown;
};

const getCachedIntakeResponses = unstable_cache(
  async () => {
    const { firestore } = getFirebaseAdmin();
    const snapshot = await firestore
      .collection("intakeResponses")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IntakeRecord[];
  },
  ["admin-intake-list"],
  { revalidate: false, tags: ["admin-intake-list"] }
);

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function toDateValue(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(String(value ?? ""));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default async function AdminConsolePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; email?: string; from?: string; to?: string }>;
}) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const keywordQuery =
    typeof resolvedSearchParams?.q === "string"
      ? resolvedSearchParams.q.trim()
      : "";
  const emailQueryRaw =
    typeof resolvedSearchParams?.email === "string"
      ? resolvedSearchParams.email.trim()
      : "";
  const fromQuery =
    typeof resolvedSearchParams?.from === "string"
      ? resolvedSearchParams.from.trim()
      : "";
  const toQuery =
    typeof resolvedSearchParams?.to === "string"
      ? resolvedSearchParams.to.trim()
      : "";
  const keyword = normalizeText(keywordQuery);
  const emailQuery = normalizeText(emailQueryRaw);
  const fromDateRaw = fromQuery ? new Date(`${fromQuery}T00:00:00`) : null;
  const toDateRaw = toQuery ? new Date(`${toQuery}T23:59:59`) : null;
  const fromDate =
    fromDateRaw && !Number.isNaN(fromDateRaw.getTime()) ? fromDateRaw : null;
  const toDate =
    toDateRaw && !Number.isNaN(toDateRaw.getTime()) ? toDateRaw : null;
  const hasFilter = Boolean(keyword || emailQuery || fromQuery || toQuery);

  let records: IntakeRecord[] = [];
  let errorMessage = "";

  try {
    records = await getCachedIntakeResponses();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "データ取得に失敗しました。";
  }

  const filteredRecords = records.filter((record) => {
    const recordEmail = normalizeText(record.email);
    const recordName = normalizeText(record.name);
    const recordCompany = normalizeText(record.company);
    const recordId = normalizeText(record.id);
    const recordType = normalizeText(record.requestType);

    if (emailQuery && recordEmail !== emailQuery) {
      return false;
    }

    if (keyword) {
      const haystack = [recordCompany, recordName, recordEmail, recordId, recordType].join(" ");
      if (!haystack.includes(keyword)) {
        return false;
      }
    }

    const createdAt = toDateValue(record.createdAt);
    if (fromDate && createdAt && createdAt < fromDate) {
      return false;
    }
    if (toDate && createdAt && createdAt > toDate) {
      return false;
    }

    if ((fromDate || toDate) && !createdAt) {
      return false;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            業務診断 回答一覧
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            最新100件まで表示しています。
          </p>
        </div>
        <Badge variant="secondary" className="rounded-xl">
          {filteredRecords.length} 件
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          対象: {filteredRecords.length}件 / 取得: {records.length}件
        </span>
        <AdminRefreshButton />
      </div>

      <form
        action="/sub/admin-console/results"
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
            placeholder="会社名 / 担当者 / メール / 回答ID"
            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm sm:h-11 sm:w-72"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="email" className="text-xs text-muted-foreground">
            メール（完全一致）
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={emailQueryRaw}
            placeholder="example@domain.com"
            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm sm:h-11 sm:w-64"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="from" className="text-xs text-muted-foreground">
            期間（開始）
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={resolvedSearchParams?.from ?? ""}
            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm sm:h-11 sm:w-auto"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="to" className="text-xs text-muted-foreground">
            期間（終了）
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={resolvedSearchParams?.to ?? ""}
            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm sm:h-11 sm:w-auto"
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-xl border border-border/70 bg-background px-4 text-sm font-medium transition hover:border-primary/40 sm:h-11"
        >
          検索
        </button>
        {hasFilter ? (
          <Link
            href="/sub/admin-console/results"
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
            {hasFilter ? "該当する診断結果がありません。" : "診断結果がありません。"}
          </div>
        ) : null}
        {filteredRecords.map((record) => (
          <Link
            key={String(record.id)}
            href={`/sub/admin-console/${record.id}`}
            className="rounded-2xl border border-border/60 bg-background/70 p-3 transition hover:border-primary/40 sm:p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{record.company as string}</p>
                <p className="text-xs text-muted-foreground">
                  {record.name as string} / {record.email as string}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
                  {statusLabel[String(record.status ?? "new")] ?? "未設定"}
                </Badge>
                <Badge variant="secondary" className="rounded-xl">
                  {requestTypeLabel[String(record.requestType ?? "dx")] ?? "未設定"}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>回答ID: {record.id as string}</span>
              <span>{toDateString(record.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
