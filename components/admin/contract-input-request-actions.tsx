"use client";

import { useState } from "react";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContractInputRequestActions({ requestId }: { requestId: string }) {
  const [busy, setBusy] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function reissue() {
    setBusy(true);
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
      setBusy(false);
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
      <Button type="button" variant="outline" className="rounded-xl" disabled={busy} onClick={() => void reissue()}>
        {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}入力URLを再発行してメール送信
      </Button>
      {inputUrl ? <div className="flex flex-col gap-2 sm:flex-row"><Input readOnly value={inputUrl} className="font-mono text-xs" onFocus={(event) => event.currentTarget.select()} /><Button type="button" variant="outline" className="rounded-xl" onClick={() => void copyUrl()}>{copied ? <Check /> : <Copy />}{copied ? "コピー済み" : "コピー"}</Button></div> : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
