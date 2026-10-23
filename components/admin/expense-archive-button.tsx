"use client";

import * as React from "react";
import { Archive, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";

export function ExpenseArchiveButton({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState("");

  const archive = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/expenses/${expenseId}/archive`, { method: "POST" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "アーカイブできませんでした。");
      router.push("/sub/admin-console/expenses");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "アーカイブできませんでした。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" className="rounded-xl text-destructive" disabled={loading} onClick={() => setConfirmOpen(true)}>
        {loading ? <Loader2 className="animate-spin" /> : <Archive />}
        アーカイブ
      </Button>
      <AdminConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => { setConfirmOpen(open); if (!open) setError(""); }}
        onConfirm={() => void archive()}
        title="経費をアーカイブしますか？"
        description="この経費は通常の一覧から外れます。操作を続ける前に、対象の記録を確認してください。"
        confirmLabel="アーカイブする"
        busy={loading}
        error={error}
      />
    </>
  );
}
