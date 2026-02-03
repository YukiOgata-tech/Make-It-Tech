"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusOptions = [
  { value: "new", label: "新規" },
  { value: "reviewing", label: "確認中" },
  { value: "in_progress", label: "対応中" },
  { value: "contracted", label: "契約中" },
  { value: "closed", label: "クローズ" },
] as const;

type StatusValue = (typeof statusOptions)[number]["value"];

type IntakeStatusFormProps = {
  id: string;
  status: StatusValue;
  contractEndAt?: string;
};

export function IntakeStatusForm({
  id,
  status,
  contractEndAt,
}: IntakeStatusFormProps) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<StatusValue>(status);
  const [nextContractEndAt, setNextContractEndAt] = useState(contractEndAt ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/intake/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status: nextStatus,
        contractEndAt: nextStatus === "contracted" ? nextContractEndAt : undefined,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setMessage(payload?.error ?? "更新に失敗しました。");
      setSaving(false);
      return;
    }

    setMessage("更新しました。");
    setSaving(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-border/60 bg-background/80 p-4">
      <div className="grid gap-2">
        <Label htmlFor="status">ステータス</Label>
        <select
          id="status"
          className="h-11 rounded-xl border border-border/70 bg-background px-3 text-sm"
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value as StatusValue)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {nextStatus === "contracted" ? (
        <div className="grid gap-2">
          <Label htmlFor="contractEndAt">契約終了日（YYYY-MM-DD）</Label>
          <Input
            id="contractEndAt"
            type="date"
            value={nextContractEndAt}
            onChange={(event) => setNextContractEndAt(event.target.value)}
          />
        </div>
      ) : null}

      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}

      <Button type="submit" className="rounded-xl" disabled={saving}>
        {saving ? "更新中..." : "更新する"}
      </Button>
    </form>
  );
}
