"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicContractInputRequest } from "@/lib/contracts/input-requests.server";

export function ContractPartyInputForm({
  token,
  request,
}: {
  token: string;
  request: PublicContractInputRequest;
}) {
  const [companyName, setCompanyName] = useState("");
  const [corporateNumber, setCorporateNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [representativeRole, setRepresentativeRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  function buildPayload() {
    return {
      companyName,
      corporateNumber,
      companyAddress,
      representativeName,
      representativeRole,
    };
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/contracts/i/${encodeURIComponent(token)}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "入力内容を送信できませんでした。");
      setCompleted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "入力内容を送信できませんでした。");
    } finally {
      setBusy(false);
    }
  }

  if (completed) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 sm:p-8">
        <CheckCircle2 className="size-10 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-semibold">契約情報を送信しました</h1>
        <p className="mt-3 text-sm leading-relaxed text-emerald-800">Make It Techが会社・署名者情報を確認し、設定済みの契約条件と組み合わせて契約書PDFを作成します。確認完了後、正式な署名URLをメールでお送りします。</p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-slate-950">貴社情報・署名予定者</h2>
        <p className="mt-1 text-sm text-slate-600">入力できるのは会社・署名予定者情報だけです。契約条件はMake It Techが設定し、正式署名画面でPDF全文をご確認いただきます。</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="party-company">法人名</Label><Input id="party-company" required maxLength={200} value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="party-number">法人番号（任意）</Label><Input id="party-number" maxLength={30} inputMode="numeric" value={corporateNumber} onChange={(event) => setCorporateNumber(event.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="party-address">所在地</Label><Input id="party-address" required maxLength={500} value={companyAddress} onChange={(event) => setCompanyAddress(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="party-role">代表者・署名者の役職</Label><Input id="party-role" required maxLength={120} value={representativeRole} onChange={(event) => setRepresentativeRole(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="party-name">代表者・署名者氏名</Label><Input id="party-name" required maxLength={120} value={representativeName} onChange={(event) => setRepresentativeName(event.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>確認先メールアドレス</Label><Input readOnly value={request.signerEmailMasked} className="bg-slate-50" /></div>
        </div>
      </section>
      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full rounded-xl bg-orange-600 text-white hover:bg-orange-700" disabled={busy}>
        {busy ? <><Loader2 className="animate-spin" />送信中...</> : <><Send />この内容をMake It Techへ送信</>}
      </Button>
      <p className="text-center text-xs text-slate-500">この操作は契約締結ではありません。契約条件を含むPDFは、後日届く正式署名URLから全文確認・署名します。</p>
    </form>
  );
}
