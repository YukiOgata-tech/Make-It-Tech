import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileImage, FileText, ReceiptText } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getExpense, getExpenseCategories } from "@/lib/expenses/server";
import { formatExpenseNumber, formatYen } from "@/lib/expenses/constants";
import { AdminPage } from "@/components/admin/admin-page";
import { ExpenseArchiveButton } from "@/components/admin/expense-archive-button";
import { ExpenseForm } from "@/components/admin/expense-form";
import { ExpenseStatusBadge } from "@/components/admin/expense-status-badge";

export const metadata: Metadata = { title: "経費詳細", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ExpenseDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ uploadWarning?: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const [expense, categories] = await Promise.all([getExpense(session, id), getExpenseCategories(session.entityId)]);
  if (!expense) notFound();

  return (
    <AdminPage className="max-w-[1240px]">
      <Link href="/sub/admin-console/expenses" className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" />経費一覧</Link>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ReceiptText className="size-6" aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="font-mono text-xs tabular-nums text-muted-foreground">{formatExpenseNumber(expense.receipt_number)}</p>
            <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight sm:text-4xl">{expense.merchant_name ?? "未整理の領収書"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">登録日時 {new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(new Date(expense.created_at))}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2"><ExpenseStatusBadge status={expense.status} />{expense.status !== "archived" ? <ExpenseArchiveButton expenseId={expense.id} /> : null}</div>
      </div>

      <div className="admin-surface mt-7 grid gap-0 overflow-hidden sm:grid-cols-3">
        <DetailMetric label="税込金額" value={formatYen(expense.amount_yen)} />
        <DetailMetric label="取引日" value={expense.transaction_date ?? "未入力"} />
        <DetailMetric label="経費分類" value={expense.category?.name ?? "未分類"} />
      </div>

      {query.uploadWarning ? <p className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">経費情報は保存しましたが、一部のファイルを登録できませんでした。ファイルを選び直して追加してください。</p> : null}

      {expense.files?.length ? (
        <section className="admin-surface mt-5 p-5 sm:p-6" aria-labelledby="saved-receipts-heading">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><FileImage className="size-4 text-primary" aria-hidden="true" /><h2 id="saved-receipts-heading" className="text-sm font-semibold">登録済み領収書</h2></div><span className="text-xs tabular-nums text-muted-foreground">{expense.files.length}件</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {expense.files.map((file) => (
              <a key={file.id} href={file.signed_url} target="_blank" rel="noreferrer" className="group flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-muted/35 p-3.5 transition-colors hover:border-primary/35 hover:bg-primary/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-primary">{file.mime_type === "application/pdf" ? <FileText className="size-5" /> : <FileImage className="size-5" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{file.original_filename}</span><span className="text-xs tabular-nums text-muted-foreground">{(file.file_size_bytes / 1024 / 1024).toFixed(1)} MB</span></span>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-7"><ExpenseForm categories={categories} expense={expense} /></div>
    </AdminPage>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border-b border-border/75 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:py-5 sm:last:border-r-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1.5 truncate text-lg font-semibold tabular-nums">{value}</p></div>;
}
