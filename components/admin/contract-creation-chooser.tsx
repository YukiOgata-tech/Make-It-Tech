"use client";

import { useState } from "react";
import { ArrowLeft, Building2, FilePenLine, UserRoundPen } from "lucide-react";
import { ContractInputRequestForm } from "@/components/admin/contract-input-request-form";
import { ContractNewForm } from "@/components/admin/contract-new-form";
import { Button } from "@/components/ui/button";

type CreationMode = "admin" | "recipient";

export function ContractCreationChooser() {
  const [mode, setMode] = useState<CreationMode | null>(null);

  if (mode) {
    return (
      <div>
        <Button type="button" variant="ghost" className="mb-5 rounded-xl" onClick={() => setMode(null)}>
          <ArrowLeft />作成方式を選び直す
        </Button>
        <div className="mb-6 flex items-center gap-3 rounded-2xl border bg-muted/30 p-4">
          {mode === "admin" ? <FilePenLine className="size-5 text-orange-600 dark:text-orange-300" /> : <UserRoundPen className="size-5 text-orange-600 dark:text-orange-300" />}
          <div>
            <p className="text-xs text-muted-foreground">選択中の作成方式</p>
            <p className="font-semibold">{mode === "admin" ? "こちらで契約情報を入力" : "相手方に契約情報の入力を依頼"}</p>
          </div>
        </div>
        {mode === "admin" ? <ContractNewForm /> : <ContractInputRequestForm />}
      </div>
    );
  }

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-2">
        <button type="button" onClick={() => setMode("admin")} className="group rounded-3xl border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg dark:hover:border-orange-700 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"><FilePenLine className="size-6" /></span>
          <h2 className="mt-5 text-xl font-semibold">こちらで入力して作成</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Make It Tech側で法人情報と契約条件をすべて入力し、PDFを確認して署名依頼を送ります。</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-300">この方式を選ぶ<Building2 className="size-4 transition group-hover:translate-x-0.5" /></span>
        </button>
        <button type="button" onClick={() => setMode("recipient")} className="group rounded-3xl border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg dark:hover:border-sky-700 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><UserRoundPen className="size-6" /></span>
          <h2 className="mt-5 text-xl font-semibold">相手方に入力を依頼</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">相手方へ専用URLを送り、法人情報・署名者情報・契約条件を本人に入力してもらいます。</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300">この方式を選ぶ<UserRoundPen className="size-4 transition group-hover:translate-x-0.5" /></span>
        </button>
      </div>
    </section>
  );
}
