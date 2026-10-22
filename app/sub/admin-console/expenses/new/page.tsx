import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getExpenseCategories } from "@/lib/expenses/server";
import { AdminPage } from "@/components/admin/admin-page";
import { ExpenseForm } from "@/components/admin/expense-form";

export const metadata: Metadata = { title: "経費を新規登録", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const session = await requireAdmin();
  const categories = await getExpenseCategories(session.entityId);
  return (
    <AdminPage className="max-w-[1240px]">
      <Link href="/sub/admin-console/expenses" className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" />経費一覧</Link>
      <div className="mt-6 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ReceiptText className="size-6" aria-hidden="true" /></span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">経費を登録</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">領収書だけ先に保存し、取引内容は後から追加できます。</p>
        </div>
      </div>
      <div className="mt-7"><ExpenseForm categories={categories} /></div>
    </AdminPage>
  );
}
