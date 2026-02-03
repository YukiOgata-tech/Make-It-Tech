import type { Metadata } from "next";
import Link from "next/link";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { Badge } from "@/components/ui/badge";

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

export default async function AdminConsolePage() {
  await requireAdmin();

  let records: Array<Record<string, unknown>> = [];
  let errorMessage = "";

  try {
    const { firestore } = getFirebaseAdmin();
    const snapshot = await firestore
      .collection("intakeResponses")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "データ取得に失敗しました。";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            業務診断 回答一覧
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            最新100件まで表示しています。
          </p>
        </div>
        <Badge variant="secondary" className="rounded-xl">
          {records.length} 件
        </Badge>
      </div>

      {errorMessage ? (
        <p className="mt-6 text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {records.map((record) => (
          <Link
            key={String(record.id)}
            href={`/${record.id}`}
            className="rounded-2xl border border-border/60 bg-background/70 p-4 transition hover:border-primary/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{record.company as string}</p>
                <p className="text-xs text-muted-foreground">
                  {record.name as string} / {record.email as string}
                </p>
              </div>
              <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
                {statusLabel[String(record.status ?? "new")] ?? "未設定"}
              </Badge>
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
