"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Copy, FileInput, Loader2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTRACT_TEMPLATES,
  CONTRACT_TEMPLATE_IDS,
  CONTRACT_TYPE_LABELS,
  type ContractTemplateId,
} from "@/lib/contracts/constants";
import {
  DATA_HANDLING_FIELD_GROUPS,
  FDE_MASTER_FIELD_GROUPS,
  INITIAL_DATA_HANDLING_FIELDS,
  INITIAL_FDE_MASTER_FIELDS,
  type DataHandlingFieldKey,
  type FdeMasterFieldKey,
} from "@/lib/contracts/form-config";

type IssuedRequest = { id: string; inputUrl: string; expiresAt: string };

export function ContractInputRequestForm() {
  const [sourceTemplateId, setSourceTemplateId] = useState<ContractTemplateId | "">("");
  const [title, setTitle] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [internalMemo, setInternalMemo] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [contractPurpose, setContractPurpose] = useState("");
  const [termYears, setTermYears] = useState(3);
  const [terminationNoticeDays, setTerminationNoticeDays] = useState(30);
  const [renewalYears, setRenewalYears] = useState(1);
  const [confidentialityYears, setConfidentialityYears] = useState(5);
  const [dataFields, setDataFields] = useState(INITIAL_DATA_HANDLING_FIELDS);
  const [fdeFields, setFdeFields] = useState(INITIAL_FDE_MASTER_FIELDS);
  const [electronicExecutionAccepted, setElectronicExecutionAccepted] = useState(false);
  const [issued, setIssued] = useState<IssuedRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  function selectTemplate(templateId: ContractTemplateId) {
    setSourceTemplateId(templateId);
    setTitle(CONTRACT_TEMPLATES[templateId].defaultTitle);
    setElectronicExecutionAccepted(false);
    setError("");
  }

  function buildContractConditions() {
    if (!sourceTemplateId) throw new Error("契約テンプレートを選択してください。");
    const template = CONTRACT_TEMPLATES[sourceTemplateId];
    if (template.formKind === "nda") {
      return {
        effectiveDate,
        contractPurpose: contractPurpose.trim() || undefined,
        termYears,
        terminationNoticeDays,
        renewalYears,
        confidentialityYears,
      };
    }
    if (template.formKind === "data_handling") {
      return { effectiveDate, ...dataFields };
    }
    return {
      effectiveDate,
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
      const response = await fetch("/api/admin/contracts/input-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          signerEmail,
          internalMemo,
          sourceTemplateId,
          contractConditions: buildContractConditions(),
          electronicExecutionAccepted,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "入力依頼を送信できませんでした。");
      setIssued({ id: payload.id, inputUrl: payload.inputUrl, expiresAt: payload.expiresAt });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "入力依頼を送信できませんでした。");
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl() {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.inputUrl);
      setCopied(true);
    } catch {
      setError("URLをコピーできませんでした。選択して手動でコピーしてください。");
    }
  }

  if (issued) {
    const deadline = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(issued.expiresAt));
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Mail className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-100">相手方へ入力依頼を送信しました</h2>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">入力期限：{deadline} JST</p>
            <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-200">URLの平文は保存されないため、この画面を離れると再表示できません。</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input value={issued.inputUrl} readOnly className="bg-background font-mono text-xs" onFocus={(event) => event.currentTarget.select()} />
              <Button type="button" variant="outline" className="shrink-0 rounded-xl bg-background" onClick={() => void copyUrl()}>
                {copied ? <Check /> : <Copy />}{copied ? "コピー済み" : "URLをコピー"}
              </Button>
            </div>
            {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
            <Button asChild className="mt-5 rounded-xl">
              <Link href={`/sub/admin-console/contracts/input-requests/${issued.id}`}>入力依頼の状態を見る<ChevronRight /></Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-3xl border bg-card p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <FileInput className="mt-0.5 size-5 text-orange-600 dark:text-orange-300" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">相手方が入力する契約書を選択</h2>
            <p className="mt-1 text-sm text-muted-foreground">契約条件はMake It Tech側で確定し、相手方には法人・署名者情報だけを入力してもらいます。</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {CONTRACT_TEMPLATE_IDS.map((templateId) => {
            const template = CONTRACT_TEMPLATES[templateId];
            const selected = sourceTemplateId === templateId;
            return (
              <button
                key={templateId}
                type="button"
                aria-pressed={selected}
                onClick={() => selectTemplate(templateId)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${selected ? "border-orange-400 bg-orange-50/70 ring-2 ring-orange-100 dark:border-orange-600 dark:bg-orange-950/20 dark:ring-orange-950" : "bg-background hover:border-foreground/25"}`}
              >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  {selected ? <Check className="size-4" /> : <FileInput className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold">{template.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{template.description}</span>
                </span>
                <Badge variant="outline" className="bg-background">{CONTRACT_TYPE_LABELS[template.contractType]}</Badge>
              </button>
            );
          })}
        </div>
      </section>

      {sourceTemplateId ? (
        <section className="rounded-3xl border bg-card p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Make It Tech側で契約条件を確定</h2>
          <p className="mt-1 text-sm text-muted-foreground">ここで設定した条件は相手方入力画面では変更できません。</p>
          <div className="mt-5 max-w-sm space-y-2">
            <Label htmlFor="request-effective-date">契約発効日</Label>
            <Input id="request-effective-date" type="date" required value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
          </div>

          {CONTRACT_TEMPLATES[sourceTemplateId].formKind === "nda" ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="request-purpose">契約目的（任意）</Label><Input id="request-purpose" maxLength={500} value={contractPurpose} onChange={(event) => setContractPurpose(event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="request-term">契約期間（年）</Label><Input id="request-term" type="number" min={1} max={99} required value={termYears} onChange={(event) => setTermYears(Number(event.target.value))} /></div>
              <div className="space-y-2"><Label htmlFor="request-notice">終了通知期限（日）</Label><Input id="request-notice" type="number" min={1} max={365} required value={terminationNoticeDays} onChange={(event) => setTerminationNoticeDays(Number(event.target.value))} /></div>
              <div className="space-y-2"><Label htmlFor="request-renewal">自動更新期間（年）</Label><Input id="request-renewal" type="number" min={1} max={20} required value={renewalYears} onChange={(event) => setRenewalYears(Number(event.target.value))} /></div>
              <div className="space-y-2"><Label htmlFor="request-confidentiality">秘密保持期間（年）</Label><Input id="request-confidentiality" type="number" min={1} max={99} required value={confidentialityYears} onChange={(event) => setConfidentialityYears(Number(event.target.value))} /></div>
            </div>
          ) : null}

          {CONTRACT_TEMPLATES[sourceTemplateId].formKind === "data_handling" ? (
            <div className="mt-7 space-y-8">
              {DATA_HANDLING_FIELD_GROUPS.map((group) => (
                <fieldset key={group.title}>
                  <legend className="text-sm font-semibold">{group.title}</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    {group.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={`request-${field.key}`}>{field.label}</Label>
                        <Input id={`request-${field.key}`} required maxLength={500} placeholder={field.placeholder} value={dataFields[field.key]} onChange={(event) => setDataFields((current) => ({ ...current, [field.key as DataHandlingFieldKey]: event.target.value }))} />
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          ) : null}

          {CONTRACT_TEMPLATES[sourceTemplateId].formKind === "fde_master" ? (
            <div className="mt-7 space-y-8">
              {FDE_MASTER_FIELD_GROUPS.map((group) => (
                <fieldset key={group.title}>
                  <legend className="text-sm font-semibold">{group.title}</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    {group.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={`request-${field.key}`}>{field.label}</Label>
                        <Input id={`request-${field.key}`} type={field.type} min={field.min} max={field.max} step={field.step} required maxLength={field.type === "text" ? 100 : undefined} placeholder={field.placeholder} value={fdeFields[field.key]} onChange={(event) => setFdeFields((current) => ({ ...current, [field.key as FdeMasterFieldKey]: event.target.value }))} />
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          ) : null}

          <label className="mt-7 flex cursor-pointer gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <input type="checkbox" required className="mt-1 size-4 shrink-0 accent-orange-600" checked={electronicExecutionAccepted} onChange={(event) => setElectronicExecutionAccepted(event.target.checked)} />
            <span>紙契約用の記名押印欄を電子締結用文言へ置き換え、相手方には会社・署名者情報だけを入力してもらうことを確認しました。</span>
          </label>
        </section>
      ) : null}

      {sourceTemplateId ? (
        <section className="rounded-3xl border bg-card p-5 sm:p-7">
          <h2 className="text-lg font-semibold">送信設定</h2>
          <div className="mt-5 grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="request-title">管理用タイトル</Label>
              <Input id="request-title" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-email">相手方の入力依頼先メールアドレス</Label>
              <Input id="request-email" required type="email" maxLength={320} value={signerEmail} onChange={(event) => setSignerEmail(event.target.value)} />
              <p className="text-xs text-muted-foreground">入力完了後の正式な署名依頼も同じメールアドレスへ送信します。</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-memo">内部メモ（任意）</Label>
              <Textarea id="request-memo" maxLength={2000} rows={3} value={internalMemo} onChange={(event) => setInternalMemo(event.target.value)} />
            </div>
          </div>
          {error ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" className="rounded-xl" disabled={busy}>
              {busy ? <><Loader2 className="animate-spin" />送信中...</> : <><Mail />入力URLを発行してメール送信</>}
            </Button>
          </div>
        </section>
      ) : null}
    </form>
  );
}
