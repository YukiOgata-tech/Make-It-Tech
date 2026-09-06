"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CONTRACT_TOKEN_DEFAULT_DAYS,
  type ContractStatus,
} from "@/lib/contracts/constants";
import { canVoidContractStatus } from "@/lib/contracts/token-policy";

export function ContractActions({ contractId, status }: { contractId: string; status: ContractStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [expiresInDays, setExpiresInDays] = useState(CONTRACT_TOKEN_DEFAULT_DAYS);
  const [error, setError] = useState("");

  async function run(action: "accept" | "send" | "void") {
    if (
      action === "accept" &&
      !window.confirm(
        "PDF内の契約当事者・署名者・締結方法と、管理画面の登録情報が一致していることを確認しましたか？確定後は原本を差し替えできません。"
      )
    ) return;
    if (action === "void" && !window.confirm("この契約と署名URLを失効します。締結前の取消として記録されます。続行しますか？")) return;
    setBusy(action);
    setError("");
    try {
      const response = await fetch(`/api/admin/contracts/${contractId}/${action}`, {
        method: "POST",
        headers: action === "send" ? { "Content-Type": "application/json" } : undefined,
        body: action === "send" ? JSON.stringify({ expiresInDays }) : undefined,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "操作に失敗しました。");
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "操作に失敗しました。");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        {status === "draft" ? (
          <Button className="rounded-xl" disabled={Boolean(busy)} onClick={() => void run("accept")}>
            {busy === "accept" ? <Loader2 className="animate-spin" /> : null}
            Make It Techとして内容を確定
          </Button>
        ) : null}
        {status === "ready" ? (
          <>
            <label className="space-y-1 text-xs text-muted-foreground">
              署名期限（日・既定48時間）
              <Input className="w-24" type="number" min={1} max={30} value={expiresInDays} onChange={(event) => setExpiresInDays(Number(event.target.value))} />
            </label>
            <Button className="rounded-xl" disabled={Boolean(busy)} onClick={() => void run("send")}>
              {busy === "send" ? <Loader2 className="animate-spin" /> : null}
              署名依頼メールを送信
            </Button>
          </>
        ) : null}
        {canVoidContractStatus(status) ? (
          <Button variant="destructive" className="rounded-xl" disabled={Boolean(busy)} onClick={() => void run("void")}>
            {busy === "void" ? <Loader2 className="animate-spin" /> : null}
            契約を失効
          </Button>
        ) : null}
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
