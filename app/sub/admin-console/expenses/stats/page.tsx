import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CircleDollarSign, FileWarning, ReceiptText } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getExpenseStatistics } from "@/lib/expenses/server";
import { formatYen, getRecentExpenseMonths } from "@/lib/expenses/constants";
import { AdminPage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "経費統計", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ExpenseStatsPage() {
  const session = await requireAdmin();
  const { rows, draftCount } = await getExpenseStatistics(session);
  const months = getRecentExpenseMonths().map((month) => ({ ...month, value: 0, count: 0 }));
  const monthMap = new Map(months.map((month) => [month.key, month]));
  const categories = new Map<string, number>();
  const merchants = new Map<string, number>();

  for (const row of rows) {
    const month = monthMap.get(row.transaction_date.slice(0, 7));
    if (month) {
      month.value += row.amount_yen;
      month.count += 1;
    }
    const category = row.category?.name ?? "未分類";
    categories.set(category, (categories.get(category) ?? 0) + row.amount_yen);
    merchants.set(row.merchant_name, (merchants.get(row.merchant_name) ?? 0) + row.amount_yen);
  }

  const currentMonth = months.at(-1);
  const previousMonth = months.at(-2);
  const maximum = Math.max(...months.map((month) => month.value), 1);
  const categoryRows = [...categories.entries()].sort((a, b) => b[1] - a[1]);
  const merchantRows = [...merchants.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const annualTotal = rows.reduce((sum, row) => sum + row.amount_yen, 0);

  return (
    <AdminPage>
      <Link href="/sub/admin-console/expenses" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />経費一覧へ戻る
      </Link>
      <header className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Accounting / Insights</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ReceiptText className="size-5" aria-hidden="true" /></span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">経費統計</h1>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">確定した経費の月別推移と内訳を確認できます。</p>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CircleDollarSign} label="今月の経費" value={formatYen(currentMonth?.value ?? 0)} note={`${currentMonth?.count ?? 0}件の確定記録`} />
        <Metric icon={CalendarDays} label="前月の経費" value={formatYen(previousMonth?.value ?? 0)} note={`${previousMonth?.count ?? 0}件の確定記録`} />
        <Metric icon={ReceiptText} label="12か月の合計" value={formatYen(annualTotal)} note={`${rows.length}件の確定記録`} />
        <Metric icon={FileWarning} label="未整理" value={`${draftCount}件`} note="月別推移には未反映" />
      </div>

      <section className="admin-surface mt-5 px-5 py-6 sm:px-7 sm:py-7" aria-labelledby="monthly-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Trend</p>
            <h2 id="monthly-heading" className="mt-1 text-xl font-semibold">月別推移</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">直近12か月の確定金額</p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">単位：円</span>
        </div>
        <div className="mt-7 overflow-x-auto pb-1">
          <div className="grid h-64 min-w-[38rem] grid-cols-12 items-end gap-3 border-b border-border pb-8" role="img" aria-label={`月別経費: ${months.map((month) => `${month.label} ${formatYen(month.value)}`).join("、")}`}>
            {months.map((month) => (
              <div key={month.key} className="group relative flex h-full min-w-0 items-end justify-center">
                <div
                  className="w-full rounded-t-lg bg-primary/75 transition-colors group-hover:bg-primary"
                  style={{ height: `${Math.max((month.value / maximum) * 100, month.value ? 4 : 1)}%` }}
                />
                <span className="absolute -bottom-7 whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">{month.label}</span>
                <span className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg group-hover:block">{formatYen(month.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Ranking title="分類別" description="直近12か月の内訳" rows={categoryRows} />
        <Ranking title="支払先別" description="支払額の上位6件" rows={merchantRows} />
      </div>
    </AdminPage>
  );
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof CircleDollarSign; label: string; value: string; note: string }) {
  return (
    <div className="admin-surface min-w-0 px-5 py-5">
      <div className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></span>
        {label}
      </div>
      <p className="mt-4 truncate text-2xl font-semibold tracking-tight tabular-nums" title={value}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function Ranking({ title, description, rows }: { title: string; description: string; rows: Array<[string, number]> }) {
  const max = Math.max(...rows.map((row) => row[1]), 1);
  return (
    <section className="admin-surface px-5 py-6 sm:px-7 sm:py-7">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
      <div className="mt-6 space-y-5">
        {rows.length ? rows.map(([label, value]) => (
          <div key={label}>
            <div className="flex items-baseline justify-between gap-4 text-[13px]">
              <span className="min-w-0 truncate font-medium" title={label}>{label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{formatYen(value)}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary/75" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        )) : <p className="py-10 text-center text-sm text-muted-foreground">確定済みの経費がありません。</p>}
      </div>
    </section>
  );
}
