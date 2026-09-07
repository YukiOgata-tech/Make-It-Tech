"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, Copy, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContractInputRequestStatus } from "@/lib/contracts/input-requests.server";

export function ContractInputRequestActions({
  requestId,
  status,
}: {
  requestId: string;
  status: ContractInputRequestStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"reissue" | "cancel" | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function reissue() {
    setBusy("reissue");
    setError("");
    try {
      const response = await fetch(`/api/admin/contracts/input-requests/${requestId}/reissue`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "入力URLを再発行できませんでした。");
      setInputUrl(payload.inputUrl);
      setCopied(false);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "入力URLを再発行できませんでした。");
    } finally {
      setBusy(null);
    }
  }

  async function cancel() {
    if (!window.confirm("この入力依頼を取り消しますか？発行済みの入力URLは直ちに無効になります。")) return;
    setBusy("cancel");
    setError("");
    try {
      const response = await fetch(`/api/admin/contracts/input-requests/${requestId}/cancel`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "入力依頼を取り消せませんでした。");
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "入力依頼を取り消せませんでした。");
    } finally {
      setBusy(null);
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(inputUrl);
      setCopied(true);
    } catch {
      setError("URLをコピーできませんでした。選択して手動でコピーしてください。");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {["pending", "expired", "failed"].includes(status) ? (
          <Button type="button" variant="outline" className="rounded-xl" disabled={Boolean(busy)} onClick={() => void reissue()}>
            {busy === "reissue" ? <Loader2 className="animate-spin" /> : <RefreshCw />}入力URLを再発行してメール送信
          </Button>
        ) : null}
        {["pending", "submitted", "expired", "failed"].includes(status) ? (
          <Button type="button" variant="destructive" className="rounded-xl" disabled={Boolean(busy)} onClick={() => void cancel()}>
            {busy === "cancel" ? <Loader2 className="animate-spin" /> : <Ban />}入力依頼を取り消す
          </Button>
        ) : null}
      </div>
      {inputUrl ? <div className="flex flex-col gap-2 sm:flex-row"><Input readOnly value={inputUrl} className="font-mono text-xs" onFocus={(event) => event.currentTarget.select()} /><Button type="button" variant="outline" className="rounded-xl" onClick={() => void copyUrl()}>{copied ? <Check /> : <Copy />}{copied ? "コピー済み" : "コピー"}</Button></div> : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
