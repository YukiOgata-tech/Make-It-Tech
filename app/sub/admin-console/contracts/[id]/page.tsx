import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getContract, getContractEvents } from "@/lib/contracts/server";
import { CONTRACT_TYPE_LABELS } from "@/lib/contracts/constants";
import { verifyAuditChain } from "@/lib/contracts/audit";
import { ContractStatusBadge } from "@/components/admin/contract-status-badge";
import { ContractActions } from "@/components/admin/contract-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "契約詳細", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatDate(value?: FirebaseFirestore.Timestamp) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(value.toDate()) + " JST";
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value || "-"}</dd></div>;
}

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [contract, events] = await Promise.all([getContract(id), getContractEvents(id)]);
  if (!contract) notFound();
  const auditVerification = verifyAuditChain(events, contract.auditLastHash);

  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link href="/sub/admin-console/contracts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />契約一覧へ戻る</Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div><p className="font-mono text-xs text-muted-foreground">{contract.contractNumber}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{contract.title}</h1><p className="mt-2 text-sm text-muted-foreground">{CONTRACT_TYPE_LABELS[contract.type]}</p></div>
        <ContractStatusBadge status={contract.status} />
      </div>

      <Card className="mt-7 rounded-2xl sm:rounded-3xl">
        <CardHeader><CardTitle className="text-base">原本確定・署名URL発行</CardTitle></CardHeader>
        <CardContent><ContractActions contractId={contract.id} status={contract.status} /></CardContent>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl sm:rounded-3xl"><CardHeader><CardTitle className="text-base">契約先・署名者</CardTitle></CardHeader><CardContent><dl className="grid gap-5 sm:grid-cols-2"><Detail label="法人名" value={contract.company.name} /><Detail label="法人番号" value={contract.company.corporateNumber} /><Detail label="所在地" value={contract.company.address} /><Detail label="署名予定者" value={`${contract.signer.role} ${contract.signer.name}`} /><Detail label="メール" value={contract.signer.email} /><Detail label="本人確認方式" value={contract.verificationMethod} /></dl></CardContent></Card>
        <Card className="rounded-2xl sm:rounded-3xl"><CardHeader><CardTitle className="text-base">日時・証跡</CardTitle></CardHeader><CardContent><dl className="grid gap-5 sm:grid-cols-2"><Detail label="契約発効日" value={contract.effectiveDate} /><Detail label="作成日時" value={formatDate(contract.createdAt)} /><Detail label="送信日時" value={formatDate(contract.sentAt)} /><Detail label="閲覧日時" value={formatDate(contract.viewedAt)} /><Detail label="電子署名日時" value={formatDate(contract.signedAt)} /><Detail label="電子締結完了日時" value={formatDate(contract.completedAt)} /><Detail label="署名URL有効期限" value={formatDate(contract.tokenExpiresAt)} /><Detail label="書類取得期限" value={formatDate(contract.documentAccessExpiresAt)} /><Detail label="Audit最終Hash" value={<code className="break-all text-xs">{contract.auditLastHash}</code>} /></dl></CardContent></Card>
      </div>

      <Card className="mt-5 rounded-2xl sm:rounded-3xl"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="size-4" />契約書類</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-3"><Button asChild variant="outline" className="rounded-xl"><a href={`/api/admin/contracts/${contract.id}/documents/original`} target="_blank" rel="noreferrer"><ExternalLink />原本PDF</a></Button>{contract.executedDocument ? <Button asChild className="rounded-xl"><a href={`/api/admin/contracts/${contract.id}/documents/executed`} target="_blank" rel="noreferrer"><Download />締結済みPDF</a></Button> : null}{contract.certificateDocument ? <Button asChild variant="outline" className="rounded-xl"><a href={`/api/admin/contracts/${contract.id}/documents/certificate`} target="_blank" rel="noreferrer"><ShieldCheck />締結証明書</a></Button> : null}</div><p className="mt-4 text-xs text-muted-foreground">Document SHA-256</p><code className="mt-1 block break-all text-xs">{contract.document.sha256}</code>{contract.sourceTemplate ? <div className="mt-4 rounded-xl border bg-muted/30 p-3"><p className="text-xs font-medium">使用テンプレート</p><p className="mt-1 text-sm">{contract.sourceTemplate.name} {contract.sourceTemplate.version}</p><code className="mt-1 block break-all text-[10px] text-muted-foreground">Source SHA-256: {contract.sourceTemplate.sourceSha256}</code></div> : null}</CardContent></Card>

      {contract.internalMemo ? <Card className="mt-5 rounded-2xl sm:rounded-3xl"><CardHeader><CardTitle className="text-base">内部メモ</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm leading-relaxed">{contract.internalMemo}</p></CardContent></Card> : null}

      <Card className="mt-5 rounded-2xl sm:rounded-3xl"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="text-base">Audit Log</CardTitle><span className={auditVerification.valid ? "text-xs font-medium text-emerald-600 dark:text-emerald-300" : "text-xs font-medium text-destructive"}>{auditVerification.valid ? "ハッシュチェーン検証済み" : `整合性エラー（${auditVerification.brokenAtSequence ?? "末尾"}）`}</span></div></CardHeader><CardContent><ol className="space-y-3">{events.map((event) => <li key={event.eventId} className="rounded-xl border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="font-mono text-xs">{String(event.sequence).padStart(3, "0")} {event.eventType}</strong><time className="text-xs text-muted-foreground">{formatDate(FirebaseTimestampFromIso(event.occurredAt))}</time></div><div className="mt-2 grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2"><span>actor: {event.actorType}</span><span>IP: {event.ipAddress || "-"}</span><span className="break-all">requestId: {event.requestId || "-"}</span><span className="truncate" title={event.userAgent}>UA: {event.userAgent || "-"}</span></div><details className="mt-2 text-xs"><summary className="cursor-pointer text-muted-foreground">Hash・metadata</summary><p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">previous: {event.previousHash || "(genesis)"}</p><p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">event: {event.eventHash}</p><pre className="mt-2 overflow-auto rounded-lg bg-muted/50 p-2 text-[10px]">{JSON.stringify(event.metadata, null, 2)}</pre></details></li>)}</ol></CardContent></Card>
    </div>
  );
}

function FirebaseTimestampFromIso(value: string) {
  return { toDate: () => new Date(value) } as FirebaseFirestore.Timestamp;
}
