"use client";

import * as React from "react";
import { Archive, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ExpenseArchiveButton({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const archive = async () => {
    if (!window.confirm("この経費をアーカイブしますか？")) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/expenses/${expenseId}/archive`, { method: "POST" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "アーカイブできませんでした。");
      router.push("/sub/admin-console/expenses");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "アーカイブできませんでした。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" className="rounded-xl text-destructive" disabled={loading} onClick={() => void archive()}>
      {loading ? <Loader2 className="animate-spin" /> : <Archive />}
      アーカイブ
    </Button>
  );
}
