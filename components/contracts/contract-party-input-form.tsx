"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DATA_HANDLING_FIELD_GROUPS,
  FDE_MASTER_FIELD_GROUPS,
  INITIAL_DATA_HANDLING_FIELDS,
  INITIAL_FDE_MASTER_FIELDS,
  type DataHandlingFieldKey,
  type FdeMasterFieldKey,
} from "@/lib/contracts/form-config";
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
  const [effectiveDate, setEffectiveDate] = useState("");
  const [contractPurpose, setContractPurpose] = useState("");
  const [termYears, setTermYears] = useState(3);
  const [terminationNoticeDays, setTerminationNoticeDays] = useState(30);
  const [renewalYears, setRenewalYears] = useState(1);
  const [confidentialityYears, setConfidentialityYears] = useState(5);
  const [dataFields, setDataFields] = useState(INITIAL_DATA_HANDLING_FIELDS);
  const [fdeFields, setFdeFields] = useState(INITIAL_FDE_MASTER_FIELDS);
  const [electronicExecutionAccepted, setElectronicExecutionAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  function buildPayload() {
    const common = {
      companyName,
      corporateNumber,
      companyAddress,
      representativeName,
      representativeRole,
      effectiveDate,
      electronicExecutionAccepted,
    };
    if (request.formKind === "nda") {
      return {
        ...common,
        contractPurpose: contractPurpose.trim() || undefined,
        termYears,
        terminationNoticeDays,
        renewalYears,
        confidentialityYears,
      };
    }
    if (request.formKind === "data_handling") return { ...common, ...dataFields };
    return {
      ...common,
      latePaymentInterestRate: Number(fdeFields.latePaymentInterestRate),
      confidentialityYears: Number(fdeFields.confidentialityYears),
      suspensionDelayDays: Number(fdeFields.suspensionDelayDays),
      curePeriodDays: Number(fdeFields.curePeriodDays),
      handoverDays: Number(fdeFields.handoverDays),
      dataDeletionDays: Number(fdeFields.dataDeletionDays),
      termYears: Number(fdeFields.termYears),
      renewalNoticeDays: Number(fdeFields.renewalNoticeDays),
      renewalYears: Number(fdeFields.renewalYears),
      terminationNoticeDays: Number(fdeFields.terminationNoticeDays),
      jurisdiction: fdeFields.jurisdiction,
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
        <p className="mt-3 text-sm leading-relaxed text-emerald-800">Make It Techが入力内容を確認し、契約書PDFを作成します。確認完了後、正式な署名URLをメールでお送りします。</p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-slate-950">貴社情報・署名予定者</h2>
        <p className="mt-1 text-sm text-slate-600">入力内容は契約書へそのまま記載されます。登記・社内情報をご確認ください。</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="party-company">法人名</Label><Input id="party-company" required maxLength={200} value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="party-number">法人番号（任意）</Label><Input id="party-number" maxLength={30} inputMode="numeric" value={corporateNumber} onChange={(event) => setCorporateNumber(event.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="party-address">所在地</Label><Input id="party-address" required maxLength={500} value={companyAddress} onChange={(event) => setCompanyAddress(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="party-role">代表者・署名者の役職</Label><Input id="party-role" required maxLength={120} value={representativeRole} onChange={(event) => setRepresentativeRole(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="party-name">代表者・署名者氏名</Label><Input id="party-name" required maxLength={120} value={representativeName} onChange={(event) => setRepresentativeName(event.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>確認先メールアドレス</Label><Input readOnly value={request.signerEmailMasked} className="bg-slate-50" /></div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-slate-950">契約条件</h2>
        <div className="mt-5 max-w-sm space-y-2">
          <Label htmlFor="party-effective-date">契約発効日</Label>
          <Input id="party-effective-date" type="date" required value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
        </div>

        {request.formKind === "nda" ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="party-purpose">契約目的（任意）</Label><Input id="party-purpose" maxLength={500} value={contractPurpose} onChange={(event) => setContractPurpose(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="party-term">契約期間（年）</Label><Input id="party-term" type="number" min={1} max={99} required value={termYears} onChange={(event) => setTermYears(Number(event.target.value))} /></div>
            <div className="space-y-2"><Label htmlFor="party-notice">終了通知期限（日）</Label><Input id="party-notice" type="number" min={1} max={365} required value={terminationNoticeDays} onChange={(event) => setTerminationNoticeDays(Number(event.target.value))} /></div>
            <div className="space-y-2"><Label htmlFor="party-renewal">自動更新期間（年）</Label><Input id="party-renewal" type="number" min={1} max={20} required value={renewalYears} onChange={(event) => setRenewalYears(Number(event.target.value))} /></div>
            <div className="space-y-2"><Label htmlFor="party-confidentiality">秘密保持期間（年）</Label><Input id="party-confidentiality" type="number" min={1} max={99} required value={confidentialityYears} onChange={(event) => setConfidentialityYears(Number(event.target.value))} /></div>
          </div>
        ) : null}

        {request.formKind === "data_handling" ? (
          <div className="mt-7 space-y-8">
            {DATA_HANDLING_FIELD_GROUPS.map((group) => (
              <fieldset key={group.title}>
                <legend className="text-sm font-semibold text-slate-950">{group.title}</legend>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  {group.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`party-${field.key}`}>{field.label}</Label>
                      <Input id={`party-${field.key}`} required maxLength={500} placeholder={field.placeholder} value={dataFields[field.key]} onChange={(event) => setDataFields((current) => ({ ...current, [field.key as DataHandlingFieldKey]: event.target.value }))} />
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        ) : null}

        {request.formKind === "fde_master" ? (
          <div className="mt-7 space-y-8">
            {FDE_MASTER_FIELD_GROUPS.map((group) => (
              <fieldset key={group.title}>
                <legend className="text-sm font-semibold text-slate-950">{group.title}</legend>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  {group.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`party-${field.key}`}>{field.label}</Label>
                      <Input id={`party-${field.key}`} type={field.type} min={field.min} max={field.max} step={field.step} required maxLength={field.type === "text" ? 100 : undefined} placeholder={field.placeholder} value={fdeFields[field.key]} onChange={(event) => setFdeFields((current) => ({ ...current, [field.key as FdeMasterFieldKey]: event.target.value }))} />
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        ) : null}
      </section>

      <label className="flex cursor-pointer gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-relaxed text-orange-950">
        <input type="checkbox" required className="mt-1 size-4 shrink-0 accent-orange-600" checked={electronicExecutionAccepted} onChange={(event) => setElectronicExecutionAccepted(event.target.checked)} />
        <span>入力内容が契約書へ反映され、契約書が電子的に締結・保管されることを確認しました。入力後、Make It Techによる内容確認を経て正式な署名依頼が届きます。</span>
      </label>
      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full rounded-xl bg-orange-600 text-white hover:bg-orange-700" disabled={busy}>
        {busy ? <><Loader2 className="animate-spin" />送信中...</> : <><Send />この内容をMake It Techへ送信</>}
      </Button>
      <p className="text-center text-xs text-slate-500">この操作は契約締結ではありません。PDF確定後に届く署名URLから最終確認・署名を行います。</p>
    </form>
  );
}
