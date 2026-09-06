import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { ContractNewForm } from "@/components/admin/contract-new-form";

export const metadata: Metadata = { title: "契約を新規作成", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NewContractPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link href="/sub/admin-console/contracts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />契約一覧へ戻る</Link>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">テンプレートから契約を作成</h1>
      <p className="mt-2 text-sm text-muted-foreground">契約テンプレートを選び、必要事項を入力してWordを生成します。内容を確認してPDF保存した後、原本として登録してください。</p>
      <div className="mt-7"><ContractNewForm /></div>
    </div>
  );
}
