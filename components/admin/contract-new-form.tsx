"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  ScanSearch,
  TriangleAlert,
} from "lucide-react";
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
} from "@/lib/contracts/form-config";

export function ContractNewForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [internalMemo, setInternalMemo] = useState("");
  const [sourceTemplateId, setSourceTemplateId] = useState<ContractTemplateId | "">("");
  const [companyName, setCompanyName] = useState("");
  const [corporateNumber, setCorporateNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signerRole, setSignerRole] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [contractPurpose, setContractPurpose] = useState("");
  const [termYears, setTermYears] = useState(3);
  const [terminationNoticeDays, setTerminationNoticeDays] = useState(30);
  const [renewalYears, setRenewalYears] = useState(1);
  const [confidentialityYears, setConfidentialityYears] = useState(5);
  const [dataHandlingFields, setDataHandlingFields] = useState(INITIAL_DATA_HANDLING_FIELDS);
  const [fdeMasterFields, setFdeMasterFields] = useState(INITIAL_FDE_MASTER_FIELDS);
  const [electronicExecutionAccepted, setElectronicExecutionAccepted] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [wordError, setWordError] = useState("");
  const [reviewPdf, setReviewPdf] = useState<{ blob: Blob; url: string; fileName: string } | null>(null);

  useEffect(() => {
    return () => {
      if (reviewPdf) URL.revokeObjectURL(reviewPdf.url);
    };
  }, [reviewPdf]);

  function selectSourceTemplate(value: ContractTemplateId | "") {
    setSourceTemplateId(value);
    setWordError("");
    setReviewPdf(null);
    setElectronicExecutionAccepted(false);
    if (!value) {
      setTitle("");
      return;
    }
    const template = CONTRACT_TEMPLATES[value];
    setTitle(template.defaultTitle);
  }

  function buildGenerationInput() {
    if (!sourceTemplateId) throw new Error("契約テンプレートを選択してください。");
    const template = CONTRACT_TEMPLATES[sourceTemplateId];
    const commonInput = {
      companyName,
      companyAddress,
      representativeRole: signerRole,
      representativeName: signerName,
      effectiveDate,
      electronicExecutionAccepted,
    };
    return template.formKind === "nda"
      ? {
          ...commonInput,
          contractPurpose: contractPurpose.trim() || undefined,
          termYears,
          terminationNoticeDays,
          renewalYears,
          confidentialityYears,
        }
      : template.formKind === "data_handling"
        ? { ...commonInput, ...dataHandlingFields }
        : {
            ...commonInput,
            latePaymentInterestRate: Number(fdeMasterFields.latePaymentInterestRate),
            confidentialityYears: Number(fdeMasterFields.confidentialityYears),
            suspensionDelayDays: Number(fdeMasterFields.suspensionDelayDays),
            curePeriodDays: Number(fdeMasterFields.curePeriodDays),
            handoverDays: Number(fdeMasterFields.handoverDays),
            dataDeletionDays: Number(fdeMasterFields.dataDeletionDays),
            termYears: Number(fdeMasterFields.termYears),
            renewalNoticeDays: Number(fdeMasterFields.renewalNoticeDays),
            renewalYears: Number(fdeMasterFields.renewalYears),
            terminationNoticeDays: Number(fdeMasterFields.terminationNoticeDays),
            jurisdiction: fdeMasterFields.jurisdiction,
          };
  }

  async function generateWord() {
    setWordError("");
    setIsGeneratingWord(true);
    try {
      if (!sourceTemplateId) {
        throw new Error("契約テンプレートを選択してください。");
      }
      const template = CONTRACT_TEMPLATES[sourceTemplateId];
      const response = await fetch(template.generationPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildGenerationInput()),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Wordを生成できませんでした。");
      }
      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition") ?? "";
      const encodedFileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const fileName = encodedFileName
        ? decodeURIComponent(encodedFileName)
        : template.fileName;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (generationError) {
      setWordError(
        generationError instanceof Error ? generationError.message : "Wordを生成できませんでした。"
      );
    } finally {
      setIsGeneratingWord(false);
    }
  }

  async function generatePdfReview() {
    setWordError("");
    setIsGeneratingPdf(true);
    try {
      if (!sourceTemplateId) throw new Error("契約テンプレートを選択してください。");
      const response = await fetch(
        `/api/admin/contracts/templates/${sourceTemplateId}/preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildGenerationInput()),
        }
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "確認用PDFを生成できませんでした。");
      }
      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition") ?? "";
      const encodedFileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const fileName = encodedFileName
        ? decodeURIComponent(encodedFileName)
        : `${CONTRACT_TEMPLATES[sourceTemplateId].defaultTitle}.pdf`;
      setReviewPdf({ blob, url: URL.createObjectURL(blob), fileName });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (generationError) {
      setWordError(
        generationError instanceof Error
          ? generationError.message
          : "確認用PDFを生成できませんでした。"
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function handlePdfReviewClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (!event.currentTarget.form?.reportValidity()) return;
    void generatePdfReview();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (!sourceTemplateId || !reviewPdf) {
        throw new Error("先に確認用PDFを生成してください。");
      }
      const template = CONTRACT_TEMPLATES[sourceTemplateId];
      const formData = new FormData();
      formData.set("title", title);
      formData.set("type", template.contractType);
      formData.set("internalMemo", internalMemo);
      formData.set("companyName", companyName);
      formData.set("corporateNumber", corporateNumber);
      formData.set("companyAddress", companyAddress);
      formData.set("signerName", signerName);
      formData.set("signerRole", signerRole);
      formData.set("signerEmail", signerEmail);
      formData.set("sourceTemplateId", sourceTemplateId);
      formData.set("effectiveDate", effectiveDate);
      formData.set("pdf", reviewPdf.blob, reviewPdf.fileName);
      const response = await fetch("/api/admin/contracts", { method: "POST", body: formData });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "契約を作成できませんでした。");
      router.push(`/sub/admin-console/contracts/${payload.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "契約を作成できませんでした。");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedTemplate = sourceTemplateId
    ? CONTRACT_TEMPLATES[sourceTemplateId]
    : null;
  const dataHandlingFieldsComplete = Object.values(dataHandlingFields).every((value) => value.trim());
  const fdeMasterFieldsComplete = Object.values(fdeMasterFields).every((value) => value.trim());
  const canGenerateDocument = Boolean(
    title.trim() &&
    companyName.trim() &&
    companyAddress.trim() &&
    signerName.trim() &&
    signerRole.trim() &&
    signerEmail.trim() &&
    effectiveDate &&
    electronicExecutionAccepted &&
    (selectedTemplate?.formKind !== "data_handling" || dataHandlingFieldsComplete) &&
    (selectedTemplate?.formKind !== "fde_master" || fdeMasterFieldsComplete)
  );

  if (selectedTemplate && reviewPdf) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="overflow-hidden rounded-2xl border bg-card sm:rounded-3xl">
          <div className="border-b bg-muted/35 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <ScanSearch className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Step 2 / 3
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">PDFの内容確認</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    このPDFが電子契約の原本になります。全文と当事者情報を確認してください。
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-lg bg-background">
                {selectedTemplate.name}
              </Badge>
            </div>

            <dl className="mt-5 grid gap-3 rounded-2xl border bg-background/80 p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">契約先</dt>
                <dd className="mt-1 font-medium">{companyName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">署名予定者</dt>
                <dd className="mt-1 font-medium">{signerRole} {signerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">契約発効日</dt>
                <dd className="mt-1 font-medium">{effectiveDate}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-muted/20 p-3 sm:p-5">
            <object
              data={reviewPdf.url}
              type="application/pdf"
              className="h-[68vh] min-h-[520px] w-full rounded-xl border bg-background"
              aria-label="生成した契約書PDFのプレビュー"
            >
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border bg-background p-6 text-center">
                <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-sm">このブラウザではPDFを埋め込み表示できません。</p>
                <Button asChild variant="outline" className="mt-4 rounded-xl">
                  <a href={reviewPdf.url} target="_blank" rel="noreferrer">
                    <ExternalLink />PDFを別画面で確認
                  </a>
                </Button>
              </div>
            </object>
          </div>
        </section>

        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>登録後は原本PDFを差し替えできません。内容確定後、契約詳細画面から原本をロックして署名URLを発行します。</p>
        </div>

        {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
        {wordError ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{wordError}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => setReviewPdf(null)} disabled={isSubmitting}>
            <ArrowLeft />入力内容を修正
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => void generateWord()} disabled={isGeneratingWord || isSubmitting}>
              {isGeneratingWord ? <Loader2 className="animate-spin" /> : <Download />}
              Wordも保存
            </Button>
            <Button type="submit" size="lg" className="rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="animate-spin" />登録中...</> : <><FileCheck2 />このPDFを原本登録</>}
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border bg-muted/40 p-4 sm:rounded-3xl sm:p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-foreground" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">契約テンプレートを選択</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              登録済みのテンプレートを選ぶと、その契約書に必要な入力欄が表示されます。
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {CONTRACT_TEMPLATE_IDS.map((templateId) => {
            const template = CONTRACT_TEMPLATES[templateId];
            const isSelected = sourceTemplateId === templateId;

            return (
              <button
                key={templateId}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectSourceTemplate(templateId)}
                className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${
                  isSelected
                    ? "border-orange-400 bg-card shadow-sm ring-2 ring-orange-100 dark:border-orange-600 dark:ring-orange-950"
                    : "border-border bg-card hover:border-foreground/25 hover:bg-accent/30 hover:shadow-sm"
                }`}
              >
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${isSelected ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" : "bg-muted text-muted-foreground"}`}>
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{template.name}</span>
                    <Badge variant="outline" className="rounded-lg bg-background text-[11px]">
                      {template.version}
                    </Badge>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{template.description}</span>
                  <span className="mt-2 block text-xs font-medium text-muted-foreground">
                    {CONTRACT_TYPE_LABELS[template.contractType]}
                  </span>
                </span>
                {isSelected ? (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white dark:bg-orange-500">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                ) : (
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          現在{CONTRACT_TEMPLATE_IDS.length}種類を登録済みです。契約内容に合うものを選択してください。
        </p>
      </section>

      {selectedTemplate ? (
        <>
          <input type="hidden" name="type" value={selectedTemplate.contractType} />
          <input type="hidden" name="sourceTemplateId" value={sourceTemplateId} />

          <section className="rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">管理情報</h2>
                <p className="mt-1 text-xs text-muted-foreground">契約一覧と管理画面で使用する情報です。</p>
              </div>
              <Badge variant="secondary" className="rounded-lg">
                {CONTRACT_TYPE_LABELS[selectedTemplate.contractType]}
              </Badge>
            </div>
            <div className="mt-5 grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="title">管理用タイトル</Label>
                <Input id="title" name="title" maxLength={160} required value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalMemo">内部メモ（任意）</Label>
                <Textarea id="internalMemo" name="internalMemo" maxLength={2000} rows={3} placeholder="管理者だけが確認するメモ" value={internalMemo} onChange={(event) => setInternalMemo(event.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-6">
            <h2 className="text-lg font-semibold">契約先法人・署名予定者</h2>
            <p className="mt-1 text-xs text-muted-foreground">Wordへ反映し、署名者画面にも固定表示する情報です。</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">法人名</Label>
                <Input id="companyName" name="companyName" maxLength={200} required value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corporateNumber">法人番号（任意）</Label>
                <Input id="corporateNumber" name="corporateNumber" maxLength={30} inputMode="numeric" value={corporateNumber} onChange={(event) => setCorporateNumber(event.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="companyAddress">所在地</Label>
                <Input id="companyAddress" name="companyAddress" maxLength={500} required value={companyAddress} onChange={(event) => setCompanyAddress(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signerName">代表者・署名予定者氏名</Label>
                <Input id="signerName" name="signerName" maxLength={120} required value={signerName} onChange={(event) => setSignerName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signerRole">代表者の役職</Label>
                <Input id="signerRole" name="signerRole" maxLength={120} required value={signerRole} onChange={(event) => setSignerRole(event.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="signerEmail">署名依頼先メールアドレス</Label>
                <Input id="signerEmail" name="signerEmail" type="email" maxLength={320} required value={signerEmail} onChange={(event) => setSignerEmail(event.target.value)} />
              </div>
            </div>
          </section>

          {selectedTemplate.formKind === "nda" ? (
            <section className="rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-6">
              <h2 className="text-lg font-semibold">NDAの空欄を入力</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                法人名・所在地・代表者に加えて、以下の内容をNDAテンプレートへ反映します。
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">契約発効日</Label>
                  <Input id="effectiveDate" name="effectiveDate" type="date" required value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
                  <p className="text-xs text-muted-foreground">契約の効力が発生する日です。実際の電子署名・締結完了日時はシステムが別に記録します。</p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="contractPurpose">契約目的（任意）</Label>
                  <Input id="contractPurpose" maxLength={500} value={contractPurpose} onChange={(event) => setContractPurpose(event.target.value)} placeholder="例：FDE業務委託、システム開発及びその検討" />
                  <p className="text-xs text-muted-foreground">入力した場合、第1条の対象取引部分を置き換えます。未入力なら標準文言を維持します。</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termYears">契約期間（年）</Label>
                  <Input id="termYears" type="number" min={1} max={99} required value={termYears} onChange={(event) => setTermYears(Number(event.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terminationNoticeDays">終了通知期限（満了日の何日前）</Label>
                  <Input id="terminationNoticeDays" type="number" min={1} max={365} required value={terminationNoticeDays} onChange={(event) => setTerminationNoticeDays(Number(event.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewalYears">自動更新期間（年）</Label>
                  <Input id="renewalYears" type="number" min={1} max={20} required value={renewalYears} onChange={(event) => setRenewalYears(Number(event.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confidentialityYears">契約終了後の秘密保持期間（年）</Label>
                  <Input id="confidentialityYears" type="number" min={1} max={99} required value={confidentialityYears} onChange={(event) => setConfidentialityYears(Number(event.target.value))} />
                </div>
              </div>
              <label className="mt-5 flex cursor-pointer gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                <input type="checkbox" required className="mt-1 size-4 shrink-0 accent-orange-600" checked={electronicExecutionAccepted} onChange={(event) => setElectronicExecutionAccepted(event.target.checked)} />
                <span>紙契約用の「本書2通・記名押印・印」欄を削除し、「甲乙双方が電子的に合意し、各自が電磁的記録を保管する」という電子締結用文言へ置き換えることを確認しました。</span>
              </label>
              {wordError ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{wordError}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" size="lg" className="rounded-xl" disabled={!canGenerateDocument || isGeneratingPdf} onClick={handlePdfReviewClick}>
                  {isGeneratingPdf ? <><Loader2 className="animate-spin" />PDF変換中...</> : <><ScanSearch />PDFにして内容確認へ</>}
                </Button>
                <Button type="button" variant="outline" className="rounded-xl" disabled={!canGenerateDocument || isGeneratingWord} onClick={() => void generateWord()}>
                  {isGeneratingWord ? <Loader2 className="animate-spin" /> : <Download />}
                  Wordを保存
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">PDFは自動生成され、次の画面で原本登録前に全文を確認できます。</p>
            </section>
          ) : null}

          {selectedTemplate.formKind === "data_handling" ? (
            <section className="rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-6">
              <h2 className="text-lg font-semibold">個人情報・データ取扱特約の空欄を入力</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                別紙の全項目を契約条件として確定してください。該当しない項目も「なし」「対象外」「特段の定めなし」など、意味のある値を入力します。
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                保存期間、アクセス範囲、事故報告、終了時の取扱いには標準的な初期値を入れています。実際の運用に合わせて必ず確認・変更してください。
              </p>
              <div className="mt-5 max-w-sm space-y-2">
                <Label htmlFor="effectiveDate">契約発効日</Label>
                <Input id="effectiveDate" name="effectiveDate" type="date" required value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
                <p className="text-xs text-muted-foreground">特約の効力が発生する日です。実際の電子署名・締結完了日時はシステムが別に記録します。</p>
              </div>

              <div className="mt-7 space-y-8">
                {DATA_HANDLING_FIELD_GROUPS.map((group) => (
                  <fieldset key={group.title}>
                    <legend className="text-sm font-semibold text-foreground">{group.title}</legend>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      {group.fields.map((field) => {
                        const inputId = `dataHandling-${field.key}`;
                        return (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={inputId}>{field.label}</Label>
                            <Input
                              id={inputId}
                              maxLength={500}
                              required
                              value={dataHandlingFields[field.key]}
                              onChange={(event) => setDataHandlingFields((current) => ({
                                ...current,
                                [field.key]: event.target.value,
                              }))}
                              placeholder={field.placeholder}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              <label className="mt-7 flex cursor-pointer gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                <input type="checkbox" required className="mt-1 size-4 shrink-0 accent-orange-600" checked={electronicExecutionAccepted} onChange={(event) => setElectronicExecutionAccepted(event.target.checked)} />
                <span>紙契約用の「本書2通・記名押印・印」欄を削除し、「甲乙双方が電子的に合意し、各自が電磁的記録を保管する」という電子締結用文言へ置き換えることを確認しました。</span>
              </label>
              {wordError ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{wordError}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" size="lg" className="rounded-xl" disabled={!canGenerateDocument || isGeneratingPdf} onClick={handlePdfReviewClick}>
                  {isGeneratingPdf ? <><Loader2 className="animate-spin" />PDF変換中...</> : <><ScanSearch />PDFにして内容確認へ</>}
                </Button>
                <Button type="button" variant="outline" className="rounded-xl" disabled={!canGenerateDocument || isGeneratingWord} onClick={() => void generateWord()}>
                  {isGeneratingWord ? <Loader2 className="animate-spin" /> : <Download />}
                  Wordを保存
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">PDFは自動生成され、次の画面で原本登録前に本文と別紙を確認できます。</p>
            </section>
          ) : null}

          {selectedTemplate.formKind === "fde_master" ? (
            <section className="rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-6">
              <h2 className="text-lg font-semibold">FDE業務委託基本契約の空欄を入力</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                原本に〇で残されている契約条件をすべて入力します。委託料や個別業務の内容は、基本契約ではなく個別契約で定めます。
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                数値欄には一般的な取引条件を想定した初期値を入れています。案件と相手方との合意に応じて変更してください。
              </p>
              <div className="mt-5 max-w-sm space-y-2">
                <Label htmlFor="effectiveDate">契約発効日</Label>
                <Input id="effectiveDate" name="effectiveDate" type="date" required value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
                <p className="text-xs text-muted-foreground">契約の効力が発生する日です。実際の電子署名・締結完了日時はシステムが別に記録します。</p>
              </div>

              <div className="mt-7 space-y-8">
                {FDE_MASTER_FIELD_GROUPS.map((group) => (
                  <fieldset key={group.title}>
                    <legend className="text-sm font-semibold text-foreground">{group.title}</legend>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      {group.fields.map((field) => {
                        const inputId = `fdeMaster-${field.key}`;
                        return (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={inputId}>{field.label}</Label>
                            <Input
                              id={inputId}
                              type={field.type}
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              maxLength={field.type === "text" ? 100 : undefined}
                              required
                              value={fdeMasterFields[field.key]}
                              onChange={(event) => setFdeMasterFields((current) => ({
                                ...current,
                                [field.key]: event.target.value,
                              }))}
                              placeholder={field.placeholder}
                            />
                            {field.key === "jurisdiction" ? (
                              <p className="text-xs text-muted-foreground">入力した地域名を「地方裁判所」と「簡易裁判所」の前へ挿入します。</p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              <label className="mt-7 flex cursor-pointer gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                <input type="checkbox" required className="mt-1 size-4 shrink-0 accent-orange-600" checked={electronicExecutionAccepted} onChange={(event) => setElectronicExecutionAccepted(event.target.checked)} />
                <span>紙契約用の「本書2通・記名押印・印」欄を削除し、「甲乙双方が電子的に合意し、各自が電磁的記録を保管する」という電子締結用文言へ置き換えることを確認しました。</span>
              </label>
              {wordError ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{wordError}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" size="lg" className="rounded-xl" disabled={!canGenerateDocument || isGeneratingPdf} onClick={handlePdfReviewClick}>
                  {isGeneratingPdf ? <><Loader2 className="animate-spin" />PDF変換中...</> : <><ScanSearch />PDFにして内容確認へ</>}
                </Button>
                <Button type="button" variant="outline" className="rounded-xl" disabled={!canGenerateDocument || isGeneratingWord} onClick={() => void generateWord()}>
                  {isGeneratingWord ? <Loader2 className="animate-spin" /> : <Download />}
                  Wordを保存
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">PDFは自動生成され、次の画面で原本登録前に全条件と条文を確認できます。</p>
            </section>
          ) : null}

          {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed bg-muted/30 px-5 py-10 text-center sm:rounded-3xl">
          <FileText className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium">最初に契約テンプレートを選択してください</p>
          <p className="mt-1 text-xs text-muted-foreground">選択したテンプレートに必要な入力欄だけを表示します。</p>
        </div>
      )}
    </form>
  );
}
