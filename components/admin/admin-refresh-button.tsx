"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminRefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRefresh = async () => {
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/refresh", { method: "POST" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "更新に失敗しました。");
      }
      router.refresh();
      setMessage("更新しました。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新に失敗しました。");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" onClick={handleRefresh} disabled={loading} className="rounded-xl">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            更新中...
          </span>
        ) : (
          "最新に更新"
        )}
      </Button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  );
}
