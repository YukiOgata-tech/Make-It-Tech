import type { Metadata } from "next";
import Link from "next/link";
import { FileInput, FileSignature, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getContracts } from "@/lib/contracts/server";
import {
  CONTRACT_INPUT_REQUEST_STATUS_LABELS,
  getContractInputRequests,
} from "@/lib/contracts/input-requests.server";
import {
  CONTRACT_STATUSES,
  CONTRACT_STATUS_LABELS,
  CONTRACT_TEMPLATES,
  CONTRACT_TYPES,
  CONTRACT_TYPE_LABELS,
  type ContractStatus,
  type ContractType,
} from "@/lib/contracts/constants";
import { ContractStatusBadge } from "@/components/admin/contract-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "契約管理", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatDate(value?: FirebaseFirestore.Timestamp) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value.toDate());
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>;
}) {
  await requireAdmin();
  const filters = await searchParams;
  const [contracts, inputRequests] = await Promise.all([
    getContracts(),
    getContractInputRequests(50),
  ]);
  const query = filters.q?.trim().toLowerCase() ?? "";
  const type = CONTRACT_TYPES.includes(filters.type as ContractType) ? (filters.type as ContractType) : "";
  const status = CONTRACT_STATUSES.includes(filters.status as ContractStatus) ? (filters.status as ContractStatus) : "";
  const filtered = contracts.filter((contract) => {
    const matchesQuery = !query || [contract.contractNumber, contract.title, contract.company.name, contract.signer.name]
      .some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (!type || contract.type === type) && (!status || contract.status === status);
  });

  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-300"><FileSignature className="size-4" />Electronic Contracts</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">契約管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">契約原本、署名依頼、締結証跡を一元管理します。</p>
        </div>
        <Button asChild size="lg" className="rounded-xl"><Link href="/sub/admin-console/contracts/new"><Plus />契約を新規作成</Link></Button>
      </div>

      <form className="mt-7 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_220px_180px_auto]">
        <Input name="q" defaultValue={filters.q} placeholder="契約ID・契約名・法人・署名者" />
        <select name="type" defaultValue={type} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">すべての契約種別</option>
          {CONTRACT_TYPES.map((item) => <option key={item} value={item}>{CONTRACT_TYPE_LABELS[item]}</option>)}
        </select>
        <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">すべてのステータス</option>
          {CONTRACT_STATUSES.map((item) => <option key={item} value={item}>{CONTRACT_STATUS_LABELS[item]}</option>)}
        </select>
        <Button type="submit" variant="outline" className="rounded-xl">絞り込む</Button>
      </form>

      {inputRequests.length ? (
        <section className="mt-5 overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between gap-3 border-b bg-sky-50/70 px-4 py-3 dark:bg-sky-950/20">
            <div className="flex items-center gap-2"><FileInput className="size-4 text-sky-700 dark:text-sky-300" /><h2 className="text-sm font-semibold">相手方入力依頼</h2></div>
            <span className="text-xs text-muted-foreground">最新{inputRequests.length}件</span>
          </div>
          {inputRequests.map((inputRequest) => (
            <Link key={inputRequest.id} href={`/sub/admin-console/contracts/input-requests/${inputRequest.id}`} className="grid gap-2 border-b px-4 py-4 transition last:border-b-0 hover:bg-muted/30 sm:grid-cols-[1fr_220px_140px_150px] sm:items-center">
              <span><strong className="block text-sm font-medium">{inputRequest.title}</strong><small className="text-xs text-muted-foreground">{CONTRACT_TYPE_LABELS[CONTRACT_TEMPLATES[inputRequest.sourceTemplateId].contractType]}</small></span>
              <span className="break-all text-xs text-muted-foreground">{inputRequest.signerEmail}</span>
              <Badge variant="outline" className="w-fit rounded-lg">{CONTRACT_INPUT_REQUEST_STATUS_LABELS[inputRequest.status]}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(inputRequest.createdAt)}</span>
            </Link>
          ))}
        </section>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-2xl border bg-card">
        <div className="hidden grid-cols-[140px_1.2fr_1fr_105px_125px_125px_125px] gap-3 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground lg:grid">
          <span>契約ID</span><span>契約</span><span>契約先・署名者</span><span>状態</span><span>作成日時</span><span>送信日時</span><span>締結日時</span>
        </div>
        {filtered.length ? filtered.map((contract) => (
          <Link key={contract.id} href={`/sub/admin-console/contracts/${contract.id}`} className="grid gap-2 border-b px-4 py-4 transition last:border-b-0 hover:bg-muted/30 lg:grid-cols-[140px_1.2fr_1fr_105px_125px_125px_125px] lg:items-center lg:gap-3">
            <span className="font-mono text-xs text-muted-foreground">{contract.contractNumber}</span>
            <span><strong className="block text-sm font-medium">{contract.title}</strong><small className="text-xs text-muted-foreground">{CONTRACT_TYPE_LABELS[contract.type]}</small></span>
            <span className="text-sm"><strong className="block font-medium">{contract.company.name}</strong><small className="text-xs text-muted-foreground">{contract.signer.role} {contract.signer.name}</small></span>
            <ContractStatusBadge status={contract.status} />
            <span className="text-xs text-muted-foreground">{formatDate(contract.createdAt)}</span>
            <span className="text-xs text-muted-foreground">{formatDate(contract.sentAt)}</span>
            <span className="text-xs text-muted-foreground">{formatDate(contract.signedAt)}</span>
          </Link>
        )) : <div className="px-4 py-14 text-center text-sm text-muted-foreground">条件に一致する契約はありません。</div>}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{filtered.length}件表示（最新200件まで）</p>
    </div>
  );
}
