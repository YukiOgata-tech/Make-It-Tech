import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminPage } from "@/components/admin/admin-page";
import { SaleForm } from "@/components/admin/sale-form";

export const metadata: Metadata = { title: "売上を登録", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  await requireAdmin();
  return <AdminPage className="max-w-[1240px]">
    <Link href="/sub/admin-console/sales" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" />売上一覧</Link>
    <div className="mt-6 flex items-center gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><TrendingUp className="size-6" /></span><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">売上を登録</h1><p className="mt-2 text-sm text-muted-foreground">請求書だけ先に保存し、売上の内容は後から追加できます。</p></div></div>
    <div className="mt-7"><SaleForm /></div>
  </AdminPage>;
}
