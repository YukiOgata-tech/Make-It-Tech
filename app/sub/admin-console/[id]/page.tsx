import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
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

const requestTypeLabel: Record<string, string> = {
  web: "WEBサイト",
  lp: "LP",
  ec: "EC",
  dx: "DX関連",
  other: "その他",
};
type StatusValue = "new" | "reviewing" | "in_progress" | "contracted" | "closed";
type AttachmentItem = {
  name?: string;
  storagePath?: string;
  size?: number;
  contentType?: string;
  url?: string;
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default async function AdminConsoleDetailPage({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const resolvedParams = await params;
  const id = resolvedParams?.id ?? "";
  if (!id) {
    return notFound();
  }

  const getCachedDetail = unstable_cache(
    async () => {
      const { firestore } = getFirebaseAdmin();
      const snapshot = await firestore.collection("intakeResponses").doc(id).get();
      if (!snapshot.exists) return null;
      return { id: snapshot.id, data: snapshot.data() ?? {} };
    },
    ["admin-intake-detail", id],
    { revalidate: false, tags: ["admin-intake-detail", `admin-intake-detail:${id}`] }
  );

  const record = await getCachedDetail();
  if (!record) {
    return notFound();
  }

  const data = record.data ?? {};
  const requestType = String(data.requestType ?? "");
  const requestLabel =
    requestType.length > 0
      ? requestTypeLabel[requestType] ?? "未設定"
      : "DX関連";
  const isDx = requestType === "dx" || requestType === "";
  const isWeb = requestType === "web";
  const isLp = requestType === "lp";
  const isEc = requestType === "ec";
  const isOther = requestType === "other";
  const hasDxFields = Boolean(
    data.currentProcess || data.currentTools || data.volume || data.stakeholders
  );
  const showDxSection = isDx || hasDxFields;
  const issueTitle = isDx ? "課題・理想" : "目的・ゴール";
  const issueLabel = isDx ? "課題" : "背景・課題";
  const goalLabel = isDx ? "理想" : "目的・ゴール";
  const attachments = Array.isArray(data.attachments)
    ? (data.attachments as AttachmentItem[])
    : [];
  const { storage } = getFirebaseAdmin();
  const bucket = storage.bucket();

  const attachmentsWithUrl: AttachmentItem[] = await Promise.all(
    attachments.map(async (item) => {
      const storagePath = item.storagePath ?? "";
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
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">回答ID</p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">
            {record.id}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {statusLabel[String(data.status ?? "new")] ?? "未設定"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-xl">
            {requestLabel}
          </Badge>
          <Badge variant="secondary" className="rounded-xl">
            作成: {toDateString(data.createdAt)}
          </Badge>
          <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
            期限: {toDateString(data.expiresAt)}
          </Badge>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[1.4fr,0.9fr]">
        <div className="grid gap-3 sm:gap-4">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
            <h2 className="text-sm font-semibold">基本情報</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <p>お名前: {String(data.name ?? "")}</p>
              <p>メール: {String(data.email ?? "")}</p>
              <p>会社名: {String(data.company ?? "")}</p>
              <p>電話番号: {String(data.phone ?? "（未記入）")}</p>
              <p>業種: {String(data.industry ?? "")}</p>
              <p>規模: {String(data.teamSize ?? "")}</p>
              <p>依頼種別: {requestLabel}</p>
            </div>
          </div>

          {showDxSection ? (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
              <h2 className="text-sm font-semibold">DX/業務内容</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <p className="whitespace-pre-wrap">{String(data.currentProcess ?? "（未記入）")}</p>
                <p>使用ツール: {String(data.currentTools ?? "（未記入）")}</p>
                <p>件数・頻度: {String(data.volume ?? "（未記入）")}</p>
                <p>関わる人数: {String(data.stakeholders ?? "（未記入）")}</p>
              </div>
            </div>
          ) : null}

          {isWeb ? (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
              <h2 className="text-sm font-semibold">WEBサイト要件</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <p className="whitespace-pre-wrap">目的・背景: {String(data.websitePurpose ?? "（未記入）")}</p>
                <p className="whitespace-pre-wrap">必要ページ・構成: {String(data.websitePages ?? "（未記入）")}</p>
                <p>現サイトURL: {String(data.websiteCurrentUrl ?? "（未記入）")}</p>
                <p className="whitespace-pre-wrap">参考サイト: {String(data.websiteReference ?? "（未記入）")}</p>
                <p>原稿・写真・ロゴ: {String(data.websiteAssets ?? "（未記入）")}</p>
              </div>
            </div>
          ) : null}

          {isLp ? (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
              <h2 className="text-sm font-semibold">LP要件</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <p className="whitespace-pre-wrap">目的・コンバージョン: {String(data.lpGoal ?? "（未記入）")}</p>
                <p className="whitespace-pre-wrap">商材・サービス内容: {String(data.lpOffer ?? "（未記入）")}</p>
                <p>ターゲット: {String(data.lpTarget ?? "（未記入）")}</p>
                <p className="whitespace-pre-wrap">参考LP: {String(data.lpReference ?? "（未記入）")}</p>
                <p>原稿・素材: {String(data.lpAssets ?? "（未記入）")}</p>
              </div>
            </div>
          ) : null}

          {isEc ? (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
              <h2 className="text-sm font-semibold">EC要件</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <p className="whitespace-pre-wrap">商材・商品点数: {String(data.ecProducts ?? "（未記入）")}</p>
                <p>希望プラットフォーム: {String(data.ecPlatform ?? "（未記入）")}</p>
                <p className="whitespace-pre-wrap">決済・配送: {String(data.ecPayments ?? "（未記入）")}</p>
                <p className="whitespace-pre-wrap">在庫・運用: {String(data.ecOperations ?? "（未記入）")}</p>
                <p className="whitespace-pre-wrap">参考サイト: {String(data.ecReference ?? "（未記入）")}</p>
              </div>
            </div>
          ) : null}

          {isOther ? (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
              <h2 className="text-sm font-semibold">その他の相談</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <p className="whitespace-pre-wrap">相談内容: {String(data.otherRequest ?? "（未記入）")}</p>
                <p className="whitespace-pre-wrap">目指したい状態: {String(data.otherGoal ?? "（未記入）")}</p>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
            <h2 className="text-sm font-semibold">{issueTitle}</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <p className="whitespace-pre-wrap">{issueLabel}: {String(data.issues ?? "（未記入）")}</p>
              <p className="whitespace-pre-wrap">{goalLabel}: {String(data.goals ?? "（未記入）")}</p>
              <p>成功指標: {String(data.successMetrics ?? "（未記入）")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
            <h2 className="text-sm font-semibold">制約・補足</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <p>予算感: {String(data.budget ?? "（未記入）")}</p>
              <p>希望納期: {String(data.deadline ?? "（未記入）")}</p>
              <p>決裁者: {String(data.decisionMaker ?? "（未記入）")}</p>
              <p className="whitespace-pre-wrap">制約: {String(data.constraints ?? "（未記入）")}</p>
              <p className="whitespace-pre-wrap">補足: {String(data.notes ?? "（未記入）")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
            <h2 className="text-sm font-semibold">添付ファイル</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {attachmentsWithUrl.length === 0 ? (
                <p>なし</p>
              ) : (
                attachmentsWithUrl.map((item, index) => (
                  <div
                    key={`${item.storagePath}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-[11px] sm:text-xs"
                  >
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

        <div className="grid gap-3 sm:gap-4">
          <IntakeStatusForm
            id={record.id}
            status={statusValue}
            contractEndAt={toDateInput(data.contractEndAt)}
          />

          <div className="rounded-2xl border border-border/60 bg-background/70 p-3 text-[11px] text-muted-foreground sm:p-4 sm:text-xs">
            <p>IP: {String(data?.meta?.ip ?? "unknown")}</p>
            <p className="mt-1">Origin: {String(data?.meta?.origin ?? "")}</p>
            <p className="mt-1 break-all">UA: {String(data?.meta?.userAgent ?? "")}</p>
          </div>

          <Link href="/sub/admin-console/results" className="text-sm text-primary underline">
            一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
