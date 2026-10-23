"use client";

import * as React from "react";
import { Check, FilePlus2, ImagePlus, Loader2, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DOCUMENT_SOURCES,
  DOCUMENT_SOURCE_LABELS,
  MAX_EXPENSE_FILE_SIZE,
  MAX_EXPENSE_FILES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/expenses/constants";
import type { ExpenseCategory, ExpenseRecord } from "@/lib/expenses/types";

type ExpenseFormProps = { categories: ExpenseCategory[]; expense?: ExpenseRecord };
const labelClass = "text-[13px] font-semibold text-foreground/85";
const fieldClass = "admin-field w-full px-3.5 shadow-none";

export function ExpenseForm({ categories, expense }: ExpenseFormProps) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [fileError, setFileError] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const existingFileCount = expense?.files?.length ?? 0;
  const availableFiles = Math.max(MAX_EXPENSE_FILES - existingFileCount, 0);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const error = files.length > availableFiles
      ? `あと${availableFiles}件まで追加できます。`
      : files.find((file) => file.size <= 0 || file.size > MAX_EXPENSE_FILE_SIZE)
        ? "ファイルは1件15MB以下にしてください。"
        : "";
    setFileError(error);
    if (error) {
      event.target.value = "";
      setSelectedFiles([]);
      return;
    }
    setSelectedFiles(files);
  };

  const submit = async (status: "draft" | "confirmed") => {
    if (!formRef.current || submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const formData = new FormData(formRef.current);
      formData.set("status", status);
      const response = await fetch(
        expense ? `/api/admin/expenses/${expense.id}` : "/api/admin/expenses",
        { method: expense ? "PATCH" : "POST", body: formData }
      );
      const result = (await response.json()) as { id?: string; error?: string; warnings?: string[] };
      if (!response.ok || !result.id) throw new Error(result.error ?? "保存できませんでした。");
      router.push(`/sub/admin-console/expenses/${result.id}${result.warnings?.length ? "?uploadWarning=1" : ""}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存できませんでした。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      className="space-y-5"
      onSubmit={(event) => { event.preventDefault(); void submit("confirmed"); }}
    >
      <input type="hidden" name="status" value="draft" />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,21rem)]">
        <div className="space-y-5">
          <section className="admin-surface px-5 py-6 sm:px-7 sm:py-7" aria-labelledby="expense-basics-heading">
            <div className="border-b border-border/75 pb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">01 · 基本情報</p>
              <h2 id="expense-basics-heading" className="mt-1.5 text-xl font-semibold">取引内容</h2>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">確定する際は、取引日・支払先・税込金額を入力してください。</p>
            </div>
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_12.5rem]">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="merchantName" className={labelClass}>支払先</Label>
                  <Input id="merchantName" name="merchantName" maxLength={160} defaultValue={expense?.merchant_name ?? ""} placeholder="例：株式会社○○" autoComplete="organization" className={fieldClass} disabled={submitting} />
                </div>
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="transactionDate" className={labelClass}>取引日</Label>
                  <Input id="transactionDate" name="transactionDate" type="date" defaultValue={expense?.transaction_date ?? ""} className={fieldClass} disabled={submitting} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-[minmax(0,13rem)_minmax(0,13rem)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="amountYen" className={labelClass}>税込金額</Label>
                  <div className="relative">
                    <Input id="amountYen" name="amountYen" type="number" min="1" step="1" inputMode="numeric" defaultValue={expense?.amount_yen ?? ""} placeholder="0" className={`${fieldClass} pr-9 text-right tabular-nums`} disabled={submitting} />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">円</span>
                  </div>
                </div>
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="taxAmountYen" className={labelClass}>うち消費税額</Label>
                  <div className="relative">
                    <Input id="taxAmountYen" name="taxAmountYen" type="number" min="0" step="1" inputMode="numeric" defaultValue={expense?.tax_amount_yen ?? ""} placeholder="任意" className={`${fieldClass} pr-9 text-right tabular-nums`} disabled={submitting} />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">円</span>
                  </div>
                </div>
                <div className="min-w-0 space-y-2 sm:col-span-2 sm:max-w-64 2xl:col-span-1 2xl:max-w-none">
                  <Label htmlFor="categoryId" className={labelClass}>経費分類</Label>
                  <select id="categoryId" name="categoryId" defaultValue={expense?.category_id ?? ""} className={fieldClass} disabled={submitting}>
                    <option value="">未選択</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="description" className={labelClass}>用途・摘要</Label>
                <Input id="description" name="description" maxLength={500} defaultValue={expense?.description ?? ""} placeholder="例：打ち合わせ用の備品購入" className={fieldClass} disabled={submitting} />
              </div>
            </div>
          </section>

          <section className="admin-surface px-5 py-6 sm:px-7 sm:py-7" aria-labelledby="expense-additional-heading">
            <div className="border-b border-border/75 pb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">02 · 補足情報</p>
              <h2 id="expense-additional-heading" className="mt-1.5 text-xl font-semibold">整理用の情報</h2>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">後から追加・変更できます。</p>
            </div>
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="min-w-0 space-y-2 sm:max-w-64">
                  <Label htmlFor="paymentMethod" className={labelClass}>支払方法</Label>
                  <select id="paymentMethod" name="paymentMethod" defaultValue={expense?.payment_method ?? ""} className={fieldClass} disabled={submitting}>
                    <option value="">未選択</option>
                    {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>)}
                  </select>
                </div>
                <div className="min-w-0 space-y-2 sm:max-w-64">
                  <Label htmlFor="documentSource" className={labelClass}>書類の種類</Label>
                  <select id="documentSource" name="documentSource" defaultValue={expense?.document_source ?? "paper_scan"} className={fieldClass} disabled={submitting}>
                    {DOCUMENT_SOURCES.map((source) => <option key={source} value={source}>{DOCUMENT_SOURCE_LABELS[source]}</option>)}
                  </select>
                </div>
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="memo" className={labelClass}>メモ</Label>
                <Textarea id="memo" name="memo" maxLength={2000} defaultValue={expense?.memo ?? ""} rows={3} placeholder="補足しておきたい内容を入力" className="admin-field min-h-28 w-full resize-y px-3.5 py-3 text-sm shadow-none" disabled={submitting} />
              </div>
            </div>
          </section>
        </div>

        <aside className="admin-surface overflow-hidden xl:sticky xl:top-24" aria-labelledby="expense-receipt-heading">
          <div className="border-b border-border/75 px-5 py-5 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">03 · 証憑</p>
            <h2 id="expense-receipt-heading" className="mt-1.5 text-lg font-semibold">領収書</h2>
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">写真だけ先に保存することもできます。</p>
          </div>
          <div className="space-y-4 px-5 py-5 sm:px-6">
            <div className="relative flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-primary/35 bg-primary/[0.035] px-5 py-6 text-center transition-colors hover:bg-primary/[0.07] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ImagePlus className="size-5" aria-hidden="true" /></span>
                <span className="text-sm font-semibold">{availableFiles ? "写真・PDFを選択" : "追加上限に達しました"}</span>
              </span>
              <span className="mt-1 text-xs leading-5 text-muted-foreground">JPEG、PNG、WebP、PDF</span>
              <Input
                id="expense-files"
                name="files"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                aria-label="領収書の写真またはPDFを選択"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                disabled={submitting || availableFiles === 0}
                onChange={handleFiles}
              />
            </div>
            <p className="text-xs leading-5 text-muted-foreground">1件15MB以下 · あと{availableFiles}件追加できます</p>
            {fileError ? <p role="alert" className="text-xs text-destructive">{fileError}</p> : null}
            {existingFileCount > 0 ? (
              <p className="flex items-center gap-2 text-xs font-medium text-foreground/75"><Check className="size-3.5 text-emerald-600" aria-hidden="true" />登録済み {existingFileCount}件</p>
            ) : null}
            {selectedFiles.length > 0 ? (
              <ul className="space-y-2 border-t border-border/75 pt-4 text-xs" aria-label="選択したファイル">
                {selectedFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex min-w-0 items-center gap-2 text-foreground/80">
                    <FilePlus2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </aside>
      </div>

      {message ? <p role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">{message}</p> : null}
      <div className="sticky bottom-3 z-10 flex flex-col-reverse items-stretch justify-between gap-3 rounded-[1.4rem] border border-border bg-card/95 px-4 py-3 shadow-[0_12px_40px_rgb(0_0_0/0.11)] backdrop-blur-xl sm:flex-row sm:items-center sm:px-5">
        <p className="hidden text-xs leading-5 text-muted-foreground sm:block">入力途中でも下書き保存できます。</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" size="lg" className="rounded-xl sm:min-w-36" disabled={submitting} onClick={() => void submit("draft")}>
            {submitting ? <Loader2 className="animate-spin" /> : <Save />}
            下書き保存
          </Button>
          <Button type="submit" size="lg" className="rounded-xl sm:min-w-40" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            入力内容を確定
          </Button>
        </div>
      </div>
    </form>
  );
}
