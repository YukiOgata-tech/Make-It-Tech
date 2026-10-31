"use client";

import * as React from "react";
import { Ban, FilePlus2, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SALE_PAYMENT_METHODS, SALE_PAYMENT_METHOD_LABELS } from "@/lib/sales/constants";
import type { SalePayment } from "@/lib/sales/types";

const field = "admin-field w-full px-3.5 text-sm";
const label = "text-[13px] font-semibold text-foreground/85";

export function SalePaymentForm({ saleId, outstandingYen }: { saleId: string; outstandingYen: number }) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !formRef.current) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/sales/${saleId}/payments`, { method: "POST", body: new FormData(formRef.current) });
      const result = (await response.json()) as { error?: string; warning?: string };
      if (!response.ok) throw new Error(result.error ?? "入金を登録できませんでした。");
      formRef.current.reset();
      setMessage(result.warning ? `入金は登録しましたが、証明書類は保存できませんでした：${result.warning}` : "入金を登録しました。");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "入金を登録できませんでした。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={(event) => void submit(event)} className="admin-surface space-y-5 p-5 sm:p-6">
      <div className="flex items-center gap-2"><Plus className="size-4 text-primary" aria-hidden="true" /><h2 className="text-lg font-semibold">入金を登録</h2></div>
      <p className="text-xs text-muted-foreground">実際に受け取った金額を記録します。残額を超える入金は登録できません。</p>
      <div className="grid gap-4 sm:grid-cols-[12rem_12rem_minmax(0,1fr)]">
        <div className="space-y-2"><Label htmlFor="paidOn" className={label}>入金日</Label><Input id="paidOn" name="paidOn" type="date" required className={field} disabled={busy} /></div>
        <div className="space-y-2"><Label htmlFor="paymentAmount" className={label}>入金額</Label><Input id="paymentAmount" name="amountYen" type="number" min="1" max={outstandingYen} step="1" required className={`${field} text-right tabular-nums`} disabled={busy} /></div>
        <div className="space-y-2"><Label htmlFor="paymentMethod" className={label}>入金方法</Label><select id="paymentMethod" name="method" defaultValue="bank_transfer" className={field} disabled={busy}>{SALE_PAYMENT_METHODS.map((method) => <option key={method} value={method}>{SALE_PAYMENT_METHOD_LABELS[method]}</option>)}</select></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="paymentDestination" className={label}>入金先・口座名など</Label><Input id="paymentDestination" name="destination" maxLength={160} placeholder="任意" className={field} disabled={busy} /></div>
        <div className="space-y-2"><Label htmlFor="proofUrl" className={label}>振込証明のURL</Label><Input id="proofUrl" name="proofUrl" type="url" placeholder="https://..." className={field} disabled={busy} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="proofFile" className={label}>振込証明の画像・PDF</Label><Input id="proofFile" name="proofFile" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="admin-field w-full px-3 py-2 text-sm" disabled={busy} /><p className="text-xs text-muted-foreground">ファイルかURLの一方を指定できます。画像はWebPに変換して保存します。</p></div>
      <div className="space-y-2"><Label htmlFor="paymentNotes" className={label}>メモ</Label><Textarea id="paymentNotes" name="notes" maxLength={1000} rows={2} className="admin-field min-h-20 w-full px-3.5 py-3 text-sm" disabled={busy} /></div>
      {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" className="rounded-xl" disabled={busy || outstandingYen <= 0}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}入金を登録</Button>
    </form>
  );
}

export function SaleDocumentForm({ saleId, payments }: { saleId: string; payments: SalePayment[] }) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [kind, setKind] = React.useState("invoice");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const recordedPayments = payments.filter((payment) => payment.status === "recorded");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !formRef.current) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/sales/${saleId}/documents`, { method: "POST", body: new FormData(formRef.current) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "資料を保存できませんでした。");
      formRef.current.reset();
      setKind("invoice");
      setMessage("資料を保存しました。");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "資料を保存できませんでした。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={(event) => void submit(event)} className="admin-surface space-y-5 p-5 sm:p-6">
      <div className="flex items-center gap-2"><FilePlus2 className="size-4 text-primary" aria-hidden="true" /><h2 className="text-lg font-semibold">資料を追加</h2></div>
      <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="space-y-2"><Label htmlFor="documentKind" className={label}>種類</Label><select id="documentKind" name="kind" className={field} value={kind} onChange={(event) => setKind(event.target.value)} disabled={busy}><option value="invoice">請求書</option><option value="payment_proof" disabled={!recordedPayments.length}>入金証明</option><option value="other">その他</option></select></div>
        <div className="space-y-2"><Label htmlFor="documentTitle" className={label}>資料名</Label><Input id="documentTitle" name="title" maxLength={200} required placeholder="例：10月分請求書" className={field} disabled={busy} /></div>
      </div>
      {kind === "payment_proof" ? <div className="space-y-2 sm:max-w-sm"><Label htmlFor="documentPayment" className={label}>対象の入金</Label><select id="documentPayment" name="paymentId" required className={field} disabled={busy}><option value="">選択してください</option>{recordedPayments.map((payment) => <option key={payment.id} value={payment.id}>{payment.paid_on} · {payment.amount_yen.toLocaleString("ja-JP")}円</option>)}</select></div> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="documentFile" className={label}>画像・PDF</Label><Input id="documentFile" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="admin-field w-full px-3 py-2 text-sm" disabled={busy} /></div>
        <div className="space-y-2"><Label htmlFor="documentUrl" className={label}>外部URL</Label><Input id="documentUrl" name="url" type="url" placeholder="https://..." className={field} disabled={busy} /></div>
      </div>
      <p className="text-xs text-muted-foreground">ファイルかURLの一方を指定してください。15MB以下。画像はWebPに変換して保存します。</p>
      {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" variant="outline" className="rounded-xl" disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}資料を追加</Button>
    </form>
  );
}

export function VoidSalePaymentButton({ saleId, paymentId }: { saleId: string; paymentId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const voidPayment = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/sales/${saleId}/payments/${paymentId}/void`, { method: "POST" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "入金を取り消せませんでした。");
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "入金を取り消せませんでした。");
    } finally {
      setBusy(false);
    }
  };
  return <>
    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setOpen(true)}><Ban className="size-3.5" />取り消す</Button>
    <AdminConfirmDialog open={open} onOpenChange={setOpen} onConfirm={() => void voidPayment()}
      title="入金記録を取り消しますか？" description="この入金は集計から外れ、取り消し履歴が残ります。証明書類は引き続き保管されます。"
      confirmLabel="入金を取り消す" busy={busy} error={error} />
  </>;
}
