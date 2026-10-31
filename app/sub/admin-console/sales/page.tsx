import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Download, Plus, Search, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { formatYen } from "@/lib/expenses/constants";
import { formatSaleNumber, SALE_STATUS_LABELS, SALE_STATUSES } from "@/lib/sales/constants";
import { getSales } from "@/lib/sales/server";
import type { SaleFilters, SaleRecord } from "@/lib/sales/types";
import { AdminPage } from "@/components/admin/admin-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "売上・入金", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SalesPage({ searchParams }: { searchParams: Promise<SaleFilters> }) {
  const session = await requireAdmin();
  const filters = await searchParams;
  const sales = await getSales(session, filters);
  const confirmed = sales.filter((sale) => sale.status === "confirmed");
  const recognizedYen = confirmed.reduce((sum, sale) => sum + (sale.amount_yen ?? 0), 0);
  const paidYen = confirmed.reduce((sum, sale) => sum + (sale.paid_yen ?? 0), 0);
  const exportParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) exportParams.set(key, value); });

  return <AdminPage>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary">経理</p>
        <div className="mt-2 flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><TrendingUp className="size-5" aria-hidden="true" /></span><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">売上・入金</h1></div>
        <p className="mt-2 text-sm text-muted-foreground">売上計上、請求書、実際の入金を一つの記録で管理します。</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="h-11 rounded-xl bg-card"><Link href="/sub/admin-console/sales/stats"><BarChart3 className="size-4" />統計を見る</Link></Button>
        <Button asChild className="h-11 rounded-xl"><Link href="/sub/admin-console/sales/new"><Plus className="size-4" />売上を登録</Link></Button>
      </div>
    </div>

    <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="表示中の売上の概要">
      <Summary label="計上済み売上" value={formatYen(recognizedYen)} note="現在の絞り込み結果" />
      <Summary label="入金済み" value={formatYen(paidYen)} note="売上との二重計上なし" />
      <Summary label="未入金残高" value={formatYen(recognizedYen - paidYen)} note="計上額から入金済みを差し引いた額" />
    </section>

    <section className="admin-surface mt-6 overflow-hidden" aria-label="売上の検索と一覧">
      <div className="border-b border-border/75 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-base font-semibold">売上を探す</h2><p className="mt-0.5 text-xs text-muted-foreground">取引先・状態・計上日で絞り込めます。</p></div>
          <Button asChild variant="ghost" size="sm" className="rounded-lg text-primary"><a href={`/api/admin/sales/export?${exportParams.toString()}`}><Download className="size-4" />CSVを出力</a></Button>
        </div>
        <form data-admin-navigation-form className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_12rem_12rem_auto] md:items-end">
          <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input name="q" defaultValue={filters.q} placeholder="取引先で検索" aria-label="取引先で検索" className="admin-field w-full pl-10 pr-3" /></div>
          <select name="status" defaultValue={filters.status ?? ""} aria-label="状態" className="admin-field w-full px-3 text-sm"><option value="">すべての状態</option>{SALE_STATUSES.map((status) => <option key={status} value={status}>{SALE_STATUS_LABELS[status]}</option>)}</select>
          <Input name="dateFrom" type="date" defaultValue={filters.dateFrom} aria-label="計上日開始" className="admin-field w-full px-3 text-sm" />
          <Input name="dateTo" type="date" defaultValue={filters.dateTo} aria-label="計上日終了" className="admin-field w-full px-3 text-sm" />
          <Button type="submit" variant="secondary" className="h-11 rounded-xl"><Search className="size-4" />絞り込む</Button>
        </form>
      </div>
      <div className="flex items-center justify-between px-4 py-3 sm:px-6"><h2 className="text-sm font-semibold">売上の記録</h2><span className="text-xs tabular-nums text-muted-foreground">{sales.length}件表示 · 最大500件</span></div>
      <div className="hidden grid-cols-[8rem_7rem_minmax(0,1fr)_8rem_8rem_8rem] gap-4 border-y border-border/75 bg-muted/50 px-6 py-2.5 text-[11px] font-semibold text-muted-foreground xl:grid"><span>管理番号</span><span>計上日</span><span>取引先・内容</span><span className="text-right">計上額</span><span className="text-right">入金済み</span><span className="text-right">状態</span></div>
      {sales.length ? <div className="divide-y divide-border/75">{sales.map((sale) => <SaleRow key={sale.id} sale={sale} />)}</div> : <div className="px-6 py-16 text-center"><p className="text-base font-semibold">売上記録が見つかりません</p><p className="mt-1 text-sm text-muted-foreground">条件を変えるか、新しい売上を登録してください。</p><Button asChild variant="outline" className="mt-5 rounded-xl"><Link href="/sub/admin-console/sales/new"><Plus className="size-4" />売上を登録</Link></Button></div>}
    </section>
  </AdminPage>;
}

function Summary({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="admin-surface min-w-0 p-5 sm:p-6"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 truncate text-2xl font-semibold tabular-nums" title={value}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>;
}

function SaleRow({ sale }: { sale: SaleRecord }) {
  return <Link href={`/sub/admin-console/sales/${sale.id}`} className="group block px-4 py-4 transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 xl:grid xl:grid-cols-[8rem_7rem_minmax(0,1fr)_8rem_8rem_8rem] xl:items-center xl:gap-4">
    <div className="flex items-center justify-between gap-2 xl:contents"><span className="font-mono text-xs tabular-nums text-muted-foreground">{formatSaleNumber(sale.sales_number, sale.created_at)}</span><span className="text-xs text-muted-foreground">{sale.recognized_on ?? "未入力"}</span></div>
    <div className="mt-2 min-w-0 xl:mt-0"><span className="block truncate text-[15px] font-semibold group-hover:text-primary">{sale.customer_name ?? "取引先未入力"}</span><span className="block truncate text-xs text-muted-foreground">{sale.title ?? "内容未入力"}</span></div>
    <div className="mt-3 flex items-center justify-between gap-3 xl:contents"><span className="font-semibold tabular-nums xl:text-right">{formatYen(sale.amount_yen)}</span><span className="text-sm tabular-nums text-muted-foreground xl:text-right">{formatYen(sale.paid_yen)}</span><span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">{SALE_STATUS_LABELS[sale.status]}<ArrowUpRight className="size-3.5 xl:hidden" /></span></div>
  </Link>;
}
