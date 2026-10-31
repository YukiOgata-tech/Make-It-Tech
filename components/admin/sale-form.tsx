"use client";

import * as React from "react";
import { FilePlus2, ImagePlus, Loader2, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SaleRecord } from "@/lib/sales/types";

const field = "admin-field w-full px-3.5 shadow-none";
const label = "text-[13px] font-semibold text-foreground/85";

export function SaleForm({ sale }: { sale?: SaleRecord }) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fileName, setFileName] = React.useState("");

  const submit = async (status: "draft" | "confirmed") => {
    if (!formRef.current || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = new FormData(formRef.current);
      data.set("status", status);
      const response = await fetch(sale ? `/api/admin/sales/${sale.id}` : "/api/admin/sales", {
        method: sale ? "PATCH" : "POST", body: data,
      });
      const result = (await response.json()) as { id?: string; warning?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error ?? "保存できませんでした。");
      router.push(`/sub/admin-console/sales/${result.id}${result.warning ? "?uploadWarning=1" : ""}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存できませんでした。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={(event) => { event.preventDefault(); void submit("confirmed"); }} className="space-y-5">
      <input type="hidden" name="status" value="draft" />
      <section className="admin-surface px-5 py-6 sm:px-7 sm:py-7">
        <div className="border-b border-border/75 pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">01 · 売上</p>
          <h2 className="mt-1.5 text-xl font-semibold">売上の内容</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">計上する際は、計上日・取引先・内容・税込金額を入力してください。</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:max-w-64">
            <Label htmlFor="recognizedOn" className={label}>売上計上日</Label>
            <Input id="recognizedOn" name="recognizedOn" type="date" defaultValue={sale?.recognized_on ?? ""} className={field} disabled={busy} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerName" className={label}>取引先</Label>
            <Input id="customerName" name="customerName" maxLength={160} defaultValue={sale?.customer_name ?? ""} placeholder="例：株式会社○○" className={field} disabled={busy} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title" className={label}>案件・売上内容</Label>
            <Input id="title" name="title" maxLength={200} defaultValue={sale?.title ?? ""} placeholder="例：ウェブサイト制作費" className={field} disabled={busy} />
          </div>
          <div className="space-y-2 sm:max-w-64">
            <Label htmlFor="amountYen" className={label}>税込金額</Label>
            <Input id="amountYen" name="amountYen" type="number" min="1" step="1" defaultValue={sale?.amount_yen ?? ""} className={`${field} text-right tabular-nums`} disabled={busy} />
          </div>
          <div className="space-y-2 sm:max-w-64">
            <Label htmlFor="taxAmountYen" className={label}>うち消費税額</Label>
            <Input id="taxAmountYen" name="taxAmountYen" type="number" min="0" step="1" defaultValue={sale?.tax_amount_yen ?? ""} placeholder="任意" className={`${field} text-right tabular-nums`} disabled={busy} />
          </div>
        </div>
      </section>

      <section className="admin-surface px-5 py-6 sm:px-7 sm:py-7">
        <div className="border-b border-border/75 pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">02 · 請求</p>
          <h2 className="mt-1.5 text-xl font-semibold">請求書の情報</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">請求書がない売上は空欄のままで保存できます。</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_13rem_13rem]">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber" className={label}>請求書番号</Label>
            <Input id="invoiceNumber" name="invoiceNumber" maxLength={100} defaultValue={sale?.invoice_number ?? ""} placeholder="任意" className={field} disabled={busy} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceIssuedOn" className={label}>発行日</Label>
            <Input id="invoiceIssuedOn" name="invoiceIssuedOn" type="date" defaultValue={sale?.invoice_issued_on ?? ""} className={field} disabled={busy} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceDueOn" className={label}>支払期限</Label>
            <Input id="invoiceDueOn" name="invoiceDueOn" type="date" defaultValue={sale?.invoice_due_on ?? ""} className={field} disabled={busy} />
          </div>
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="notes" className={label}>メモ</Label>
            <Textarea id="notes" name="notes" maxLength={2000} defaultValue={sale?.notes ?? ""} rows={3} className="admin-field min-h-28 w-full resize-y px-3.5 py-3 text-sm" disabled={busy} />
          </div>
        </div>
      </section>

      {!sale ? (
        <section className="admin-surface px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ImagePlus className="size-5" aria-hidden="true" /></span>
            <div><h2 className="text-lg font-semibold">請求書を添付</h2><p className="text-xs text-muted-foreground">ファイルまたはHTTPSのURLを一つ登録できます。後からの追加も可能です。</p></div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoiceFile" className={label}>画像・PDF</Label>
              <Input id="invoiceFile" name="invoiceFile" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="admin-field w-full px-3 py-2 text-sm" disabled={busy} onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
              {fileName ? <p className="flex items-center gap-1 text-xs text-muted-foreground"><FilePlus2 className="size-3.5" />{fileName}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceUrl" className={label}>外部URL</Label>
              <Input id="invoiceUrl" name="invoiceUrl" type="url" placeholder="https://..." className={field} disabled={busy} />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">JPEG、PNG、WebP、PDF ／ 15MB以下。画像はWebPに変換して保存します。</p>
        </section>
      ) : null}

      {error ? <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : null}
      <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-[1.4rem] border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="hidden text-xs text-muted-foreground sm:block">下書きは後から編集できます。入金登録には売上の計上が必要です。</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" size="lg" className="rounded-xl" disabled={busy} onClick={() => void submit("draft")}>{busy ? <Loader2 className="animate-spin" /> : <Save />}下書き保存</Button>
          <Button type="submit" size="lg" className="rounded-xl" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <ShieldCheck />}売上として計上</Button>
        </div>
      </div>
    </form>
  );
}
