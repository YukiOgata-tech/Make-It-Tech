"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTRACT_TEMPLATES,
  CONTRACT_TYPES,
  CONTRACT_TYPE_LABELS,
  type ContractTemplateId,
  type ContractType,
} from "@/lib/contracts/constants";

const ndaTemplate = CONTRACT_TEMPLATES["nda-standard-v1"];

export function ContractNewForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [contractType, setContractType] = useState<ContractType>("nda");
  const [sourceTemplateId, setSourceTemplateId] = useState<ContractTemplateId | "">("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signerRole, setSignerRole] = useState("");
  const [contractDate, setContractDate] = useState("");
  const [contractPurpose, setContractPurpose] = useState("");
  const [termYears, setTermYears] = useState(3);
  const [terminationNoticeDays, setTerminationNoticeDays] = useState(30);
  const [renewalYears, setRenewalYears] = useState(1);
  const [confidentialityYears, setConfidentialityYears] = useState(5);
  const [electronicExecutionAccepted, setElectronicExecutionAccepted] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [wordError, setWordError] = useState("");

  function selectSourceTemplate(value: ContractTemplateId | "") {
    setSourceTemplateId(value);
    if (!value) return;
    const template = CONTRACT_TEMPLATES[value];
    setContractType(template.contractType);
    setTitle((current) => current.trim() || template.defaultTitle);
  }

  async function generateWord() {
    setWordError("");
    setIsGeneratingWord(true);
    try {
      const response = await fetch(`${ndaTemplate.downloadPath}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyAddress,
          representativeRole: signerRole,
          representativeName: signerName,
          contractDate,
          contractPurpose: contractPurpose.trim() || undefined,
          termYears,
          terminationNoticeDays,
          renewalYears,
          confidentialityYears,
          electronicExecutionAccepted,
        }),
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
        : "秘密保持契約書_入力済み.docx";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      selectSourceTemplate("nda-standard-v1");
    } catch (generationError) {
      setWordError(
        generationError instanceof Error ? generationError.message : "Wordを生成できませんでした。"
      );
    } finally {
      setIsGeneratingWord(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
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

  const canGenerateWord = Boolean(
    companyName.trim() &&
    companyAddress.trim() &&
    signerName.trim() &&
    signerRole.trim() &&
    contractDate &&
    electronicExecutionAccepted
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 sm:rounded-3xl sm:p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-sky-700" />
          <div>
            <h2 className="text-lg font-semibold text-slate-950">NDA標準Wordテンプレート</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              下のフォームへ法人・代表者・契約日を入力すると、テンプレートへ自動反映したWordを生成できます。
            </p>
          </div>
        </div>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
          <li>「NDA自動作成を使用」を押し、契約情報と契約先を入力する</li>
          <li>入力済みWordを生成し、必要な条文をWord上で最終確認する</li>
          <li>PDF形式で保存して、下の原本欄へ登録する</li>
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" className="rounded-xl" onClick={() => selectSourceTemplate("nda-standard-v1")}>
            NDA自動作成を使用
          </Button>
          <Button asChild variant="outline" className="rounded-xl bg-white">
            <a href={ndaTemplate.downloadPath}>
              <Download />空のWordをダウンロード
            </a>
          </Button>
          <span className="text-xs text-slate-600">{ndaTemplate.version}・管理者のみ取得可能</span>
        </div>
        <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>自動生成後も契約条文と当事者情報の最終確認は必要です。電子契約で確定される原本は、最後に登録したPDFです。</p>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-6">
        <h2 className="text-lg font-semibold">契約情報</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">契約タイトル</Label>
            <Input id="title" name="title" maxLength={160} required placeholder="FDE業務委託基本契約書" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">契約種別</Label>
            <select id="type" name="type" required value={contractType} onChange={(event) => {
              const value = event.target.value as ContractType;
              setContractType(value);
              if (sourceTemplateId && CONTRACT_TEMPLATES[sourceTemplateId].contractType !== value) {
                setSourceTemplateId("");
              }
            }} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              {CONTRACT_TYPES.map((type) => <option key={type} value={type}>{CONTRACT_TYPE_LABELS[type]}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourceTemplateId">使用したWordテンプレート</Label>
            <select id="sourceTemplateId" name="sourceTemplateId" value={sourceTemplateId} onChange={(event) => selectSourceTemplate(event.target.value as ContractTemplateId | "")} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">使用していない・不明</option>
              <option value="nda-standard-v1">{ndaTemplate.name} {ndaTemplate.version}</option>
            </select>
            <p className="text-xs text-muted-foreground">選択したテンプレートの版とHashを契約記録に残します。</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="internalMemo">内部メモ</Label>
            <Textarea id="internalMemo" name="internalMemo" maxLength={2000} rows={4} placeholder="管理者だけが確認するメモ" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-6">
        <h2 className="text-lg font-semibold">契約先法人・署名予定者</h2>
        <p className="mt-1 text-xs text-muted-foreground">ここで指定した情報を署名者画面に固定表示します。</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">法人名</Label>
            <Input id="companyName" name="companyName" maxLength={200} required value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="corporateNumber">法人番号（任意）</Label>
            <Input id="corporateNumber" name="corporateNumber" maxLength={30} inputMode="numeric" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="companyAddress">所在地（任意）</Label>
            <Input id="companyAddress" name="companyAddress" maxLength={500} value={companyAddress} onChange={(event) => setCompanyAddress(event.target.value)} />
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
            <Input id="signerEmail" name="signerEmail" type="email" maxLength={320} required />
          </div>
        </div>
      </section>

      {sourceTemplateId === "nda-standard-v1" ? (
        <section className="rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-6">
          <h2 className="text-lg font-semibold">NDA Wordへの自動入力</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            上で入力した法人名・所在地・署名予定者の役職と氏名を、甲の当事者欄へ挿入します。
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">契約書記載日</Label>
              <Input id="effectiveDate" name="effectiveDate" type="date" required value={contractDate} onChange={(event) => setContractDate(event.target.value)} />
              <p className="text-xs text-muted-foreground">実際の電子締結日時とは別に、契約書本文へ記載する日付です。</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contractPurpose">契約目的（任意）</Label>
              <Input id="contractPurpose" maxLength={500} value={contractPurpose} onChange={(event) => setContractPurpose(event.target.value)} placeholder="例：FDE業務委託、システム開発及びその検討" />
              <p className="text-xs text-muted-foreground">入力した場合、第1条の対象取引部分を置き換えます。未入力ならテンプレートの標準文言を維持します。</p>
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
          <label className="mt-5 flex cursor-pointer gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
            <input type="checkbox" required className="mt-1 size-4 shrink-0 accent-orange-600" checked={electronicExecutionAccepted} onChange={(event) => setElectronicExecutionAccepted(event.target.checked)} />
            <span>紙契約用の「本書2通・記名押印・印」欄を削除し、「甲乙双方が電子的に合意し、各自が電磁的記録を保管する」という電子締結用文言へ置き換えることを確認しました。</span>
          </label>
          {wordError ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{wordError}</p> : null}
          <Button type="button" size="lg" className="mt-5 rounded-xl" disabled={!canGenerateWord || isGeneratingWord} onClick={() => void generateWord()}>
            {isGeneratingWord ? <><Loader2 className="animate-spin" />Word生成中...</> : <><Download />入力済みWordを生成</>}
          </Button>
        </section>
      ) : null}

      <section className="rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-6">
        <h2 className="text-lg font-semibold">契約書原本</h2>
        <p className="mt-1 text-xs text-muted-foreground">PDFのみ・4MB以内。Make It Tech承認後は差し替えできません。</p>
        <Input className="mt-5" name="pdf" type="file" accept="application/pdf,.pdf" required />
      </section>

      {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="animate-spin" />作成中...</> : "下書きを作成"}
        </Button>
      </div>
    </form>
  );
}
