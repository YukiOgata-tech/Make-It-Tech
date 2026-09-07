"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTRACT_ACCEPTANCE_STATEMENTS } from "@/lib/contracts/constants";

const statements = [
  ["identityAccepted", CONTRACT_ACCEPTANCE_STATEMENTS.identity],
  ["authorityAccepted", CONTRACT_ACCEPTANCE_STATEMENTS.authority],
  ["reviewedAccepted", CONTRACT_ACCEPTANCE_STATEMENTS.reviewed],
  ["consentAccepted", CONTRACT_ACCEPTANCE_STATEMENTS.consent],
] as const;

export function ContractSigningForm({
  token,
  expectedSignerName,
}: {
  token: string;
  expectedSignerName: string;
}) {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [typedSignerName, setTypedSignerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [documentAccessToken, setDocumentAccessToken] = useState("");
  const [documentAccessExpiresAt, setDocumentAccessExpiresAt] = useState("");
  const [error, setError] = useState("");
  const allAccepted = statements.every(([key]) => accepted[key]) && typedSignerName.trim();

  async function submit() {
    if (!allAccepted) return;
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/contracts/c/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typedSignerName,
          ...Object.fromEntries(statements.map(([key]) => [key, true])),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "契約を締結できませんでした。");
      setDocumentAccessToken(
        typeof payload.documentAccessToken === "string" ? payload.documentAccessToken : ""
      );
      setDocumentAccessExpiresAt(
        typeof payload.documentAccessExpiresAt === "string"
          ? payload.documentAccessExpiresAt
          : ""
      );
      setIsCompleted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "契約を締結できませんでした。");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCompleted) {
    const encodedDocumentToken = encodeURIComponent(documentAccessToken);
    const deadline = documentAccessExpiresAt
      ? new Intl.DateTimeFormat("ja-JP", {
          timeZone: "Asia/Tokyo",
          dateStyle: "long",
          timeStyle: "short",
        }).format(new Date(documentAccessExpiresAt))
      : "";
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 sm:p-6">
        <div className="flex items-center gap-2 font-semibold"><ShieldCheck />契約締結が完了しました</div>
        {documentAccessToken ? (
          <>
            <p className="mt-2 text-sm">締結済みPDFと締結証明書をダウンロードできます。</p>
            {deadline ? <p className="mt-1 text-xs">取得期限：{deadline} JST</p> : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild className="rounded-xl"><a href={`/api/contracts/c/${encodedDocumentToken}/documents/executed`} target="_blank" rel="noreferrer">締結済みPDF</a></Button>
              <Button asChild variant="outline" className="rounded-xl bg-white"><a href={`/api/contracts/c/${encodedDocumentToken}/documents/certificate`} target="_blank" rel="noreferrer">締結証明書</a></Button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm">締結書類の取得URLをメールでご確認ください。</p>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <h2 className="text-lg font-semibold text-slate-950">契約締結確認</h2>
      <p className="mt-1 text-sm text-slate-600">以下をすべて確認し、チェックしてください。</p>
      <div className="mt-5 space-y-2 rounded-xl border border-orange-200 bg-orange-50 p-4">
        <Label htmlFor="typedSignerName" className="text-slate-900">電子署名者氏名</Label>
        <Input
          id="typedSignerName"
          required
          maxLength={120}
          autoComplete="name"
          value={typedSignerName}
          onChange={(event) => setTypedSignerName(event.target.value)}
          placeholder={expectedSignerName}
          className="bg-white text-slate-950"
        />
        <p className="text-xs text-slate-600">上に表示されている署名予定者本人が、氏名を入力してください。登録氏名と一致しない場合は締結できません。</p>
      </div>
      <div className="mt-5 space-y-3">
        {statements.map(([key, label]) => (
          <label key={key} className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-800 hover:border-orange-300">
            <input type="checkbox" className="mt-1 size-4 shrink-0 accent-orange-600" checked={Boolean(accepted[key])} onChange={(event) => setAccepted((current) => ({ ...current, [key]: event.target.checked }))} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <Button type="button" size="lg" className="mt-6 w-full rounded-xl bg-orange-600 text-white hover:bg-orange-700" disabled={!allAccepted || isSubmitting} onClick={() => void submit()}>
        {isSubmitting ? <><Loader2 className="animate-spin" />締結処理中...</> : "契約内容に同意して締結する"}
      </Button>
      <p className="mt-3 text-center text-xs text-slate-500">操作日時と接続情報は契約証跡として記録されます。</p>
    </section>
  );
}
