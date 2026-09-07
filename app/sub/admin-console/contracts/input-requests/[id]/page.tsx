import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, FileInput, Mail } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import {
  CONTRACT_INPUT_REQUEST_STATUS_LABELS,
  getContractInputRequest,
  getContractInputRequestEvents,
} from "@/lib/contracts/input-requests.server";
import { CONTRACT_TEMPLATES } from "@/lib/contracts/constants";
import { verifyAuditChain } from "@/lib/contracts/audit";
import { ContractInputRequestReview } from "@/components/admin/contract-input-request-review";
import { ContractInputRequestActions } from "@/components/admin/contract-input-request-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "相手方入力依頼",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FIELD_LABELS: Record<string, string> = {
  companyName: "法人名",
  corporateNumber: "法人番号",
  companyAddress: "所在地",
  representativeRole: "代表者・署名者の役職",
  representativeName: "代表者・署名者氏名",
  effectiveDate: "契約発効日",
  contractPurpose: "契約目的",
  termYears: "契約期間（年）",
  terminationNoticeDays: "終了・解約通知期限（日）",
  renewalYears: "自動更新期間（年）",
  confidentialityYears: "秘密保持期間（年）",
  latePaymentInterestRate: "遅延損害金率（%）",
  suspensionDelayDays: "業務停止対象の支払遅延（日）",
  curePeriodDays: "是正期間（日）",
  handoverDays: "引渡し目安（日）",
  dataDeletionDays: "データ削除期限（日）",
  renewalNoticeDays: "更新停止通知期限（日）",
  jurisdiction: "合意管轄地域",
  targetData: "対象データ",
  processingPurpose: "利用目的・処理内容",
  dataSubjects: "対象者",
  sensitivePersonalInformation: "要配慮個人情報",
  specificPersonalInformation: "特定個人情報",
  systemsUsed: "利用システム",
  storageLocation: "保存場所・地域",
  retentionPeriod: "保存期間",
  accessScope: "アクセス権限",
  subcontractors: "再委託先",
  thirdPartyServices: "第三者サービス",
  overseasUse: "国外利用",
  incidentContact: "事故時の連絡",
  endOfTermHandling: "終了時の取扱い",
  additionalSecurityRequirements: "追加セキュリティ要件",
  specialProvisions: "特記事項",
  electronicExecutionAccepted: "電子締結への確認",
};

function formatDate(value?: FirebaseFirestore.Timestamp) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value.toDate()) + " JST";
}

export default async function ContractInputRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [inputRequest, events] = await Promise.all([
    getContractInputRequest(id),
    getContractInputRequestEvents(id),
  ]);
  if (!inputRequest) notFound();
  const template = CONTRACT_TEMPLATES[inputRequest.sourceTemplateId];
  const auditVerification = verifyAuditChain(events, inputRequest.auditLastHash);

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link href="/sub/admin-console/contracts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />契約管理へ戻る</Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div><div className="flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"><FileInput className="size-4" />相手方入力依頼</div><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{inputRequest.title}</h1><p className="mt-2 text-sm text-muted-foreground">{template.name}</p></div>
        <Badge variant="outline" className="rounded-lg bg-card">{CONTRACT_INPUT_REQUEST_STATUS_LABELS[inputRequest.status]}</Badge>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-3">
        <Card className="rounded-2xl"><CardContent className="pt-6"><Mail className="size-4 text-muted-foreground" /><p className="mt-3 text-xs text-muted-foreground">送信先</p><p className="mt-1 break-all text-sm font-medium">{inputRequest.signerEmail}</p></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="pt-6"><Clock3 className="size-4 text-muted-foreground" /><p className="mt-3 text-xs text-muted-foreground">入力期限</p><p className="mt-1 text-sm font-medium">{formatDate(inputRequest.expiresAt)}</p></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="pt-6"><CheckCircle2 className="size-4 text-muted-foreground" /><p className="mt-3 text-xs text-muted-foreground">入力完了日時</p><p className="mt-1 text-sm font-medium">{formatDate(inputRequest.submittedAt)}</p></CardContent></Card>
      </div>

      {inputRequest.submittedInput ? (
        <Card className="mt-5 rounded-2xl sm:rounded-3xl">
          <CardHeader><CardTitle className="text-base">相手方が入力した内容</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {Object.entries(inputRequest.submittedInput).map(([key, value]) => (
                <div key={key} className="border-b pb-3">
                  <dt className="text-xs text-muted-foreground">{FIELD_LABELS[key] ?? key}</dt>
                  <dd className="mt-1 break-words text-sm font-medium">{typeof value === "boolean" ? (value ? "確認済み" : "未確認") : String(value || "-")}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs text-muted-foreground">相手方入力 SHA-256</p>
            <code className="mt-1 block break-all text-xs">{inputRequest.submittedInputSha256}</code>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-5 rounded-2xl sm:rounded-3xl"><CardContent className="py-10 text-center"><p className="text-sm font-medium">相手方の入力を待っています</p><p className="mt-2 text-xs text-muted-foreground">入力が完了すると、この画面から内容確認とPDF生成へ進めます。</p></CardContent></Card>
      )}

      <Card className="mt-5 rounded-2xl sm:rounded-3xl">
        <CardHeader><CardTitle className="text-base">Make It Techが確定した契約条件</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-5 text-xs text-muted-foreground">相手方入力画面では変更できない条件です。</p>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {Object.entries(inputRequest.contractConditions).map(([key, value]) => (
              <div key={key} className="border-b pb-3">
                <dt className="text-xs text-muted-foreground">{FIELD_LABELS[key] ?? key}</dt>
                <dd className="mt-1 break-words text-sm font-medium">{String(value || "-")}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-muted-foreground">契約条件 SHA-256</p>
          <code className="mt-1 block break-all text-xs">{inputRequest.contractConditionsSha256}</code>
        </CardContent>
      </Card>

      {["pending", "submitted", "expired", "failed"].includes(inputRequest.status) ? (
        <Card className="mt-5 rounded-2xl sm:rounded-3xl"><CardHeader><CardTitle className="text-base">入力依頼の操作</CardTitle></CardHeader><CardContent><p className="mb-4 text-xs text-muted-foreground">再発行すると以前の入力URLは失効します。取消は入力依頼だけを対象とし、締結済み契約の取消ではありません。</p><ContractInputRequestActions requestId={inputRequest.id} status={inputRequest.status} /></CardContent></Card>
      ) : null}

      {inputRequest.status === "submitted" ? (
        <Card className="mt-5 rounded-2xl sm:rounded-3xl"><CardHeader><CardTitle className="text-base">PDF生成・原本登録</CardTitle></CardHeader><CardContent><ContractInputRequestReview requestId={inputRequest.id} /></CardContent></Card>
      ) : null}

      {inputRequest.status === "finalizing" ? (
        <Card className="mt-5 rounded-2xl sm:rounded-3xl"><CardHeader><CardTitle className="text-base">契約作成の再開</CardTitle></CardHeader><CardContent><ContractInputRequestReview requestId={inputRequest.id} resumeOnly /></CardContent></Card>
      ) : null}

      {inputRequest.status === "cancelled" ? (
        <div className="mt-5 rounded-2xl border border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40"><p className="font-semibold">入力依頼は取り消されています</p><p className="mt-2 text-sm text-muted-foreground">入力URLは失効済みです。取消日時：{formatDate(inputRequest.cancelledAt)}</p></div>
      ) : null}

      {inputRequest.status === "converted" && inputRequest.contractId ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30"><p className="font-semibold text-emerald-950 dark:text-emerald-100">契約へ登録済みです</p><Button asChild className="mt-4 rounded-xl"><Link href={`/sub/admin-console/contracts/${inputRequest.contractId}`}>契約詳細を開く</Link></Button></div>
      ) : null}

      <Card className="mt-5 rounded-2xl sm:rounded-3xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">入力依頼 Audit Log</CardTitle>
            <span className={auditVerification.valid ? "text-xs font-medium text-emerald-600 dark:text-emerald-300" : "text-xs font-medium text-destructive"}>
              {auditVerification.valid ? "ハッシュチェーン検証済み" : `整合性エラー（${auditVerification.brokenAtSequence ?? "末尾"}）`}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {events.map((event) => (
              <li key={event.eventId} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="font-mono text-xs">{String(event.sequence).padStart(3, "0")} {event.eventType}</strong>
                  <time className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium", timeStyle: "medium" }).format(new Date(event.occurredAt))} JST</time>
                </div>
                <div className="mt-2 grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
                  <span>actor: {event.actorType}</span>
                  <span>IP: {event.ipAddress || "-"}</span>
                  <span className="break-all">requestId: {event.requestId || "-"}</span>
                  <span className="truncate" title={event.userAgent}>UA: {event.userAgent || "-"}</span>
                </div>
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-muted-foreground">Hash・metadata</summary>
                  <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">previous: {event.previousHash || "(genesis)"}</p>
                  <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">event: {event.eventHash}</p>
                  <pre className="mt-2 overflow-auto rounded-lg bg-muted/50 p-2 text-[10px]">{JSON.stringify(event.metadata, null, 2)}</pre>
                </details>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
