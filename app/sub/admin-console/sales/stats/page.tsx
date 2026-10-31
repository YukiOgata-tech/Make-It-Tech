import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Banknote, CalendarDays, Clock3, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { formatYen } from "@/lib/expenses/constants";
import { getSalesStatistics } from "@/lib/sales/server";
import { AdminPage } from "@/components/admin/admin-page";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "売上統計", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SalesStatsPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const session = await requireAdmin();
  const { year: requestedYear } = await searchParams;
  const { sales, payments } = await getSalesStatistics(session);
  const currentYear = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", year: "numeric" }).format(new Date()));
  const parsedYear = Number(requestedYear);
  const year = Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= currentYear + 1 ? parsedYear : currentYear;
  const months = Array.from({ length: 12 }, (_, index) => ({ key: `${year}-${String(index + 1).padStart(2, "0")}`, label: `${index + 1}月`, recognized: 0, received: 0, count: 0 }));
  const monthMap = new Map(months.map((month) => [month.key, month]));
  const customers = new Map<string, number>();
  const paidBySale = new Map<string, number>();
  for (const sale of sales) {
    const month = sale.recognized_on && monthMap.get(sale.recognized_on.slice(0, 7));
    if (!month) continue;
    month.recognized += sale.amount_yen ?? 0;
    month.count += 1;
    const customer = sale.customer_name ?? "取引先未入力";
    customers.set(customer, (customers.get(customer) ?? 0) + (sale.amount_yen ?? 0));
  }
  for (const payment of payments) {
    paidBySale.set(payment.sale_id, (paidBySale.get(payment.sale_id) ?? 0) + payment.amount_yen);
    const month = monthMap.get(payment.paid_on.slice(0, 7));
    if (month) month.received += payment.amount_yen;
  }
  const annualRecognized = months.reduce((sum, month) => sum + month.recognized, 0);
  const annualReceived = months.reduce((sum, month) => sum + month.received, 0);
  const outstanding = sales.reduce((sum, sale) => sum + Math.max((sale.amount_yen ?? 0) - (paidBySale.get(sale.id) ?? 0), 0), 0);
  const maximum = Math.max(...months.flatMap((month) => [month.recognized, month.received]), 1);
  const topCustomers = [...customers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return <AdminPage>
    <Link href="/sub/admin-console/sales" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" />売上一覧</Link>
    <header className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold tracking-wide text-primary">経理 / 分析</p><div className="mt-2 flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BarChart3 className="size-5" aria-hidden="true" /></span><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">売上統計</h1></div><p className="mt-2 text-sm text-muted-foreground">計上日と実際の入金日を分けて集計します。</p></div><form data-admin-navigation-form className="flex items-center gap-2"><label htmlFor="statsYear" className="text-sm text-muted-foreground">対象年</label><select id="statsYear" name="year" defaultValue={year} className="admin-field w-28 px-3 text-sm">{Array.from({ length: 8 }, (_, index) => currentYear + 1 - index).map((candidate) => <option key={candidate} value={candidate}>{candidate}年</option>)}</select><Button type="submit" variant="secondary" className="rounded-xl">表示</Button></form></header>
    <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={`${year}年の売上概要`}>
      <Metric icon={TrendingUp} label="年間計上額" value={formatYen(annualRecognized)} note={`${year}年の計上日で集計`} />
      <Metric icon={Banknote} label="年間入金額" value={formatYen(annualReceived)} note={`${year}年の入金日で集計`} />
      <Metric icon={Clock3} label="未入金残高" value={formatYen(outstanding)} note="全期間の確定済み売上" />
      <Metric icon={CalendarDays} label="計上件数" value={`${months.reduce((sum, month) => sum + month.count, 0)}件`} note={`${year}年の確定記録`} />
    </section>
    <section className="admin-surface mt-5 px-5 py-6 sm:px-7" aria-labelledby="sales-month-heading"><h2 id="sales-month-heading" className="text-xl font-semibold">月別の計上・入金</h2><p className="mt-1 text-xs text-muted-foreground">青：計上額 / 緑：入金額。過去年に計上した売上の入金も、入金月に表示します。</p><div className="mt-6 space-y-4">{months.map((month) => <div key={month.key} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3rem_minmax(0,1fr)_10rem_10rem] sm:items-center"><span className="text-xs font-medium text-muted-foreground">{month.label}</span><div className="space-y-1.5"><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(month.recognized / maximum) * 100}%` }} /></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(month.received / maximum) * 100}%` }} /></div></div><span className="text-right text-xs tabular-nums sm:text-sm">計上 {formatYen(month.recognized)}</span><span className="text-right text-xs tabular-nums text-emerald-700 dark:text-emerald-400 sm:text-sm">入金 {formatYen(month.received)}</span></div>)}</div></section>
    <section className="admin-surface mt-5 px-5 py-6 sm:px-7" aria-labelledby="sales-customer-heading"><h2 id="sales-customer-heading" className="text-lg font-semibold">取引先別の計上額</h2><p className="mt-1 text-xs text-muted-foreground">{year}年・上位8件</p>{topCustomers.length ? <div className="mt-5 divide-y divide-border/75">{topCustomers.map(([name, amount]) => <div key={name} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="min-w-0 truncate" title={name}>{name}</span><span className="shrink-0 font-semibold tabular-nums">{formatYen(amount)}</span></div>)}</div> : <p className="mt-5 text-sm text-muted-foreground">この年の売上計上はありません。</p>}</section>
  </AdminPage>;
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof TrendingUp; label: string; value: string; note: string }) {
  return <div className="admin-surface min-w-0 p-5"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-4 text-primary" aria-hidden="true" />{label}</div><p className="mt-3 truncate text-2xl font-semibold tabular-nums" title={value}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>;
}
