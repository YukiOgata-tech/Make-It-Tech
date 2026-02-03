import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { Badge } from "@/components/ui/badge";
import { IntakeStatusForm } from "@/components/admin/intake-status-form";

export const metadata: Metadata = {
  title: "業務診断 回答詳細",
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

function toDateInput(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toISOString().slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
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
type StatusValue = "new" | "reviewing" | "in_progress" | "contracted" | "closed";

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default async function AdminConsoleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const { firestore, storage } = getFirebaseAdmin();
  const doc = await firestore.collection("intakeResponses").doc(params.id).get();

  if (!doc.exists) {
    return notFound();
  }

  const data = doc.data() ?? {};
  const attachments = Array.isArray(data.attachments) ? data.attachments : [];
  const bucket = storage.bucket();

  const attachmentsWithUrl = await Promise.all(
    attachments.map(async (item: Record<string, unknown>) => {
      const storagePath = String(item.storagePath ?? "");
      if (!storagePath) {
        return { ...item, url: "" };
      }
      try {
        const [url] = await bucket.file(storagePath).getSignedUrl({
          action: "read",
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
        return { ...item, url };
      } catch {
        return { ...item, url: "" };
      }
    })
  );

  const rawStatus = String(data.status ?? "new");
  const statusValue = (["new", "reviewing", "in_progress", "contracted", "closed"].includes(rawStatus)
    ? rawStatus
    : "new") as StatusValue;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">回答ID</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {doc.id}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {statusLabel[String(data.status ?? "new")] ?? "未設定"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-xl">
            作成: {toDateString(data.createdAt)}
          </Badge>
          <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
            期限: {toDateString(data.expiresAt)}
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,0.9fr]">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <h2 className="text-sm font-semibold">基本情報</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <p>お名前: {String(data.name ?? "")}</p>
              <p>メール: {String(data.email ?? "")}</p>
              <p>会社名: {String(data.company ?? "")}</p>
              <p>電話番号: {String(data.phone ?? "（未記入）")}</p>
              <p>業種: {String(data.industry ?? "")}</p>
              <p>規模: {String(data.teamSize ?? "")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <h2 className="text-sm font-semibold">現状</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <p className="whitespace-pre-wrap">{String(data.currentProcess ?? "")}</p>
              <p>使用ツール: {String(data.currentTools ?? "")}</p>
              <p>件数・頻度: {String(data.volume ?? "")}</p>
              <p>関わる人数: {String(data.stakeholders ?? "")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <h2 className="text-sm font-semibold">課題・理想</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <p className="whitespace-pre-wrap">課題: {String(data.issues ?? "")}</p>
              <p className="whitespace-pre-wrap">理想: {String(data.goals ?? "")}</p>
              <p>成功指標: {String(data.successMetrics ?? "（未記入）")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <h2 className="text-sm font-semibold">制約・補足</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <p>予算感: {String(data.budget ?? "（未記入）")}</p>
              <p>希望納期: {String(data.deadline ?? "（未記入）")}</p>
              <p>決裁者: {String(data.decisionMaker ?? "（未記入）")}</p>
              <p className="whitespace-pre-wrap">制約: {String(data.constraints ?? "（未記入）")}</p>
              <p className="whitespace-pre-wrap">補足: {String(data.notes ?? "（未記入）")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <h2 className="text-sm font-semibold">添付ファイル</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {attachmentsWithUrl.length === 0 ? (
                <p>なし</p>
              ) : (
                attachmentsWithUrl.map((item, index) => (
                  <div key={`${item.storagePath}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs">
                    <div>
                      <p className="font-medium">{String(item.name ?? "")}</p>
                      <p className="text-muted-foreground">
                        {formatBytes(Number(item.size ?? 0))} / {String(item.contentType ?? "")}
                      </p>
                    </div>
                    {item.url ? (
                      <a
                        href={String(item.url)}
                        className="text-primary underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        ダウンロード
                      </a>
                    ) : (
                      <span className="text-muted-foreground">リンクなし</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <IntakeStatusForm
            id={doc.id}
            status={statusValue}
            contractEndAt={toDateInput(data.contractEndAt)}
          />

          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
            <p>IP: {String(data?.meta?.ip ?? "unknown")}</p>
            <p className="mt-1">Origin: {String(data?.meta?.origin ?? "")}</p>
            <p className="mt-1 break-all">UA: {String(data?.meta?.userAgent ?? "")}</p>
          </div>

          <Link href="/" className="text-sm text-primary underline">
            一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
