import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileImage, FileText, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { formatYen } from "@/lib/expenses/constants";
import { formatSaleNumber, SALE_DOCUMENT_KIND_LABELS, SALE_PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS } from "@/lib/sales/constants";
import { getSale } from "@/lib/sales/server";
import { AdminPage } from "@/components/admin/admin-page";
import { SaleDocumentForm, SalePaymentForm, VoidSalePaymentButton } from "@/components/admin/sale-activity-forms";
import { SaleForm } from "@/components/admin/sale-form";

export const metadata: Metadata = { title: "売上詳細", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SaleDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uploadWarning?: string }>;
}) {
  const session = await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const sale = await getSale(session, id);
  if (!sale) notFound();
  const balance = sale.status === "confirmed" ? Math.max((sale.amount_yen ?? 0) - (sale.paid_yen ?? 0), 0) : 0;

  return <AdminPage className="max-w-[1240px]">
    <Link href="/sub/admin-console/sales" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" />売上一覧</Link>
    <div className="mt-6 flex items-start gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><TrendingUp className="size-6" aria-hidden="true" /></span>
      <div className="min-w-0"><p className="font-mono text-xs tabular-nums text-muted-foreground">{formatSaleNumber(sale.sales_number, sale.created_at)}</p><h1 className="mt-1 truncate text-3xl font-semibold tracking-tight sm:text-4xl">{sale.customer_name ?? "未整理の売上"}</h1><p className="mt-2 text-sm text-muted-foreground">{sale.title ?? "内容未入力"} · {SALE_STATUS_LABELS[sale.status]}</p></div>
    </div>

    <section className="admin-surface mt-7 grid gap-0 overflow-hidden sm:grid-cols-3" aria-label="売上と入金の概要">
      <Metric label="計上額" value={sale.status === "confirmed" ? formatYen(sale.amount_yen) : "未計上"} />
      <Metric label="入金済み" value={formatYen(sale.paid_yen ?? 0)} />
      <Metric label="未入金残高" value={sale.status === "confirmed" ? formatYen(balance) : "-"} />
    </section>
    <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-card/70 px-5 py-4 text-sm text-muted-foreground sm:grid-cols-3">
      <p>売上計上日 <strong className="ml-2 font-medium text-foreground">{sale.recognized_on ?? "未入力"}</strong></p>
      <p>請求書番号 <strong className="ml-2 font-medium text-foreground">{sale.invoice_number ?? "未入力"}</strong></p>
      <p>支払期限 <strong className="ml-2 font-medium text-foreground">{sale.invoice_due_on ?? "未入力"}</strong></p>
    </div>
    {query.uploadWarning ? <p className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">売上は保存しましたが、請求書の添付に失敗しました。下の「資料を追加」から再登録してください。</p> : null}

    <section className="admin-surface mt-6 p-5 sm:p-6" aria-labelledby="sales-documents-heading">
      <div className="flex items-center gap-2"><FileImage className="size-4 text-primary" aria-hidden="true" /><h2 id="sales-documents-heading" className="text-lg font-semibold">請求書・証明書類</h2><span className="ml-auto text-xs text-muted-foreground">{sale.documents?.length ?? 0}件</span></div>
      {sale.documents?.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{sale.documents.map((document) => {
        const href = document.external_url ?? document.signed_url;
        const content = <><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{document.mime_type === "application/pdf" ? <FileText className="size-5" /> : <FileImage className="size-5" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{document.title}</span><span className="text-xs text-muted-foreground">{SALE_DOCUMENT_KIND_LABELS[document.kind]} · {document.external_url ? "URL" : "ファイル"}</span></span>{href ? <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}</>;
        return href ? <a key={document.id} href={href} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-muted/35 p-3 transition-colors hover:border-primary/35 hover:bg-primary/[0.035]">{content}</a> : <div key={document.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-muted/35 p-3">{content}</div>;
      })}</div> : <p className="mt-5 text-sm text-muted-foreground">資料はまだありません。</p>}
    </section>

    <section className="admin-surface mt-5 p-5 sm:p-6" aria-labelledby="sales-payments-heading">
      <h2 id="sales-payments-heading" className="text-lg font-semibold">入金履歴</h2>
      {sale.payments?.length ? <div className="mt-4 divide-y divide-border/75">{sale.payments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center gap-3 py-3 text-sm"><div className="min-w-0 flex-1"><p className={payment.status === "voided" ? "text-muted-foreground line-through" : "font-medium"}>{payment.paid_on} · {SALE_PAYMENT_METHOD_LABELS[payment.method]}</p><p className="mt-0.5 text-xs text-muted-foreground">{payment.destination || payment.notes || (payment.status === "voided" ? "取り消し済み" : "入金を記録")}</p></div><span className="font-semibold tabular-nums">{formatYen(payment.amount_yen)}</span>{payment.status === "recorded" ? <VoidSalePaymentButton saleId={sale.id} paymentId={payment.id} /> : <span className="text-xs text-muted-foreground">取り消し済み</span>}</div>)}</div> : <p className="mt-4 text-sm text-muted-foreground">入金はまだ記録されていません。</p>}
    </section>

    <div className="mt-5 grid gap-5">
      {sale.status === "confirmed" && balance > 0 ? <SalePaymentForm saleId={sale.id} outstandingYen={balance} /> : null}
      <SaleDocumentForm saleId={sale.id} payments={sale.payments ?? []} />
    </div>
    <div className="mt-10 border-t border-border pt-7"><h2 className="mb-5 text-xl font-semibold">売上情報を編集</h2><SaleForm sale={sale} /></div>
  </AdminPage>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-border/75 px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1.5 truncate text-xl font-semibold tabular-nums" title={value}>{value}</p></div>;
}
