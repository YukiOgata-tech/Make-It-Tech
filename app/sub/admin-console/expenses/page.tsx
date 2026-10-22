import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Download, FileImage, Plus, ReceiptText, Search } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getExpenseCategories, getExpenses } from "@/lib/expenses/server";
import type { ExpenseFilters } from "@/lib/expenses/types";
import {
  EXPENSE_STATUSES,
  EXPENSE_STATUS_LABELS,
  formatExpenseNumber,
  formatYen,
} from "@/lib/expenses/constants";
import { AdminPage } from "@/components/admin/admin-page";
import { ExpenseStatusBadge } from "@/components/admin/expense-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "経費・領収書", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const filterClass = "admin-field w-full px-3 text-sm";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<ExpenseFilters> }) {
  const session = await requireAdmin();
  const filters = await searchParams;
  const [expenses, categories] = await Promise.all([
    getExpenses(session, filters),
    getExpenseCategories(session.entityId),
  ]);
  const confirmedTotal = expenses.reduce(
    (sum, expense) => sum + (expense.status === "confirmed" ? expense.amount_yen ?? 0 : 0),
    0
  );
  const draftCount = expenses.filter((expense) => expense.status === "draft").length;
  const confirmedCount = expenses.filter((expense) => expense.status === "confirmed").length;
  const exportParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) exportParams.set(key, value);
  });

  return (
    <AdminPage>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-primary">
            <ReceiptText className="size-4" aria-hidden="true" /> 経理
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">経費・領収書</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">領収書から取引内容まで、ひとつの記録にまとめて管理。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-11 rounded-xl bg-card px-4">
            <Link href="/sub/admin-console/expenses/stats"><BarChart3 className="size-4" />統計を見る</Link>
          </Button>
          <Button asChild className="h-11 rounded-xl px-5 shadow-sm">
            <Link href="/sub/admin-console/expenses/new"><Plus className="size-4" />新規登録</Link>
          </Button>
        </div>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="表示中の経費の概要">
        <Summary label="確定金額" value={formatYen(confirmedTotal)} note="現在の絞り込み結果" prominent />
        <Summary label="確定済み" value={`${confirmedCount}件`} note="金額の集計対象" />
        <Summary label="未整理" value={`${draftCount}件`} note="後で内容を追加できます" />
      </section>

      <section className="admin-surface mt-6 overflow-hidden" aria-label="経費の検索と一覧">
        <div className="border-b border-border/75 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">記録を探す</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">条件を組み合わせて絞り込めます。</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-lg text-primary">
              <a href={`/api/admin/expenses/export?${exportParams.toString()}`}><Download className="size-4" />CSVを出力</a>
            </Button>
          </div>
          <form className="mt-5 space-y-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_13rem]">
              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input name="q" defaultValue={filters.q} placeholder="支払先で検索" aria-label="支払先で検索" className={`${filterClass} pl-10`} />
              </div>
              <select name="status" defaultValue={filters.status ?? ""} aria-label="状態" className={filterClass}>
                <option value="">通常表示</option>
                {EXPENSE_STATUSES.map((status) => <option key={status} value={status}>{EXPENSE_STATUS_LABELS[status]}</option>)}
              </select>
              <select name="category" defaultValue={filters.category ?? ""} aria-label="経費分類" className={filterClass}>
                <option value="">すべての分類</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:w-[21rem]">
                <Input name="dateFrom" type="date" defaultValue={filters.dateFrom} aria-label="開始日" className={filterClass} />
                <span className="text-xs text-muted-foreground">〜</span>
                <Input name="dateTo" type="date" defaultValue={filters.dateTo} aria-label="終了日" className={filterClass} />
              </div>
              <select name="hasFile" defaultValue={filters.hasFile ?? ""} aria-label="領収書の有無" className={`${filterClass} sm:w-40`}>
                <option value="">領収書すべて</option>
                <option value="yes">領収書あり</option>
                <option value="no">領収書なし</option>
              </select>
              <Button type="submit" variant="secondary" className="h-11 rounded-xl px-5 sm:ml-auto">
                <Search className="size-4" />絞り込む
              </Button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <h2 className="text-sm font-semibold">経費の記録</h2>
          <span className="text-xs tabular-nums text-muted-foreground">{expenses.length}件表示 · 最大500件</span>
        </div>
        <div className="hidden grid-cols-[7rem_7rem_minmax(0,1fr)_9rem_8rem_6rem] gap-4 border-y border-border/75 bg-muted/50 px-6 py-2.5 text-[11px] font-semibold text-muted-foreground xl:grid">
          <span>管理番号</span><span>取引日</span><span>支払先・用途</span><span>分類</span><span className="text-right">金額</span><span className="text-right">状態</span>
        </div>
        {expenses.length > 0 ? (
          <div className="divide-y divide-border/75">
            {expenses.map((expense) => (
              <Link
                key={expense.id}
                href={`/sub/admin-console/expenses/${expense.id}`}
                className="group block px-4 py-4 transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 xl:grid xl:grid-cols-[7rem_7rem_minmax(0,1fr)_9rem_8rem_6rem] xl:items-center xl:gap-4"
              >
                <div className="flex items-center justify-between gap-3 xl:contents">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{formatExpenseNumber(expense.receipt_number)}</span>
                  <span className="text-xs text-muted-foreground xl:text-[13px]">{expense.transaction_date ?? "日付未入力"}</span>
                </div>
                <div className="mt-2 min-w-0 xl:mt-0">
                  <span className="block truncate text-[15px] font-semibold text-foreground group-hover:text-primary">{expense.merchant_name ?? "未整理の領収書"}</span>
                  <span className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{expense.description || "用途未入力"}</span>
                    {(expense.files?.length ?? 0) > 0 ? <span className="inline-flex shrink-0 items-center gap-1"><FileImage className="size-3.5" aria-hidden="true" />{expense.files?.length}</span> : null}
                  </span>
                </div>
                <div className="mt-3 hidden truncate text-xs text-muted-foreground xl:mt-0 xl:block">{expense.category?.name ?? "未分類"}</div>
                <div className="mt-3 flex items-center justify-between gap-3 xl:contents">
                  <span className="text-base font-semibold tabular-nums xl:text-right">{formatYen(expense.amount_yen)}</span>
                  <span className="flex items-center gap-2 xl:justify-end"><ExpenseStatusBadge status={expense.status} /><ArrowUpRight className="size-3.5 text-muted-foreground xl:hidden" aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><ReceiptText className="size-7" aria-hidden="true" /></span>
            <h3 className="mt-4 text-base font-semibold">記録が見つかりません</h3>
            <p className="mt-1 text-sm text-muted-foreground">条件を変えるか、新しい経費を登録してください。</p>
            <Button asChild variant="outline" className="mt-5 rounded-xl"><Link href="/sub/admin-console/expenses/new"><Plus className="size-4" />新規登録</Link></Button>
          </div>
        )}
      </section>
    </AdminPage>
  );
}

function Summary({ label, value, note, prominent = false }: { label: string; value: string; note: string; prominent?: boolean }) {
  return (
    <div className={prominent ? "admin-surface admin-surface--tinted p-5 sm:p-6" : "admin-surface p-5 sm:p-6"}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.7rem]">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
