import { headers } from "next/headers";
import { AlertTriangle, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import { ContractSigningForm } from "@/components/contracts/contract-signing-form";
import { Button } from "@/components/ui/button";
import { CONTRACT_TYPE_LABELS } from "@/lib/contracts/constants";
import { getRequestEvidence } from "@/lib/contracts/http";
import { openSignSession } from "@/lib/contracts/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date(value)) + " JST";
}

function StateMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <AlertTriangle className="mx-auto size-10 text-orange-600" />
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        <p className="mt-6 text-xs text-slate-500">Make It Tech 電子契約</p>
      </div>
    </main>
  );
}

export default async function ContractSignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const requestHeaders = await headers();
  const evidence = getRequestEvidence(new Request("https://sign.make-it-tech.com", { headers: requestHeaders }));
  const result = await openSignSession(token, evidence);

  if (result.state === "invalid") return <StateMessage title="署名URLを確認できません" message="URLが正しいか確認してください。解決しない場合はMake It Techへお問い合わせください。" />;
  if (result.state === "expired") return <StateMessage title="URLの有効期限が切れています" message="このURLの有効期限は終了しました。Make It Techへ再発行をご依頼ください。" />;
  if (result.state === "void") return <StateMessage title="この契約は失効しています" message="この署名URLは利用できません。詳細はMake It Techへお問い合わせください。" />;
  if (!result.contract) return <StateMessage title="契約を表示できません" message="時間をおいて再度お試しください。" />;

  const contract = result.contract;
  const encodedToken = encodeURIComponent(token);
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div><p className="text-xs font-medium text-orange-600">Make It Tech</p><p className="font-semibold">電子契約</p></div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="size-4" />署名専用ページ</div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="font-mono text-xs text-slate-500">{contract.contractNumber}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{contract.title}</h1><p className="mt-2 text-sm text-slate-600">{CONTRACT_TYPE_LABELS[contract.type]}</p></div>
          <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">本人確認：会社メールリンク</div>
        </div>

        <section className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:rounded-3xl sm:p-6 lg:grid-cols-4">
          <div><p className="text-xs text-slate-500">契約先法人</p><p className="mt-1 text-sm font-medium">{contract.companyName}</p></div>
          <div><p className="text-xs text-slate-500">署名予定者</p><p className="mt-1 text-sm font-medium">{contract.signerRole} {contract.signerName}</p></div>
          <div><p className="text-xs text-slate-500">送信先</p><p className="mt-1 text-sm font-medium">{contract.signerEmailMasked}</p></div>
          <div><p className="text-xs text-slate-500">{result.state === "completed" ? "書類取得期限" : "署名期限"}</p><p className="mt-1 text-sm font-medium">{formatDate(contract.tokenExpiresAt)}</p></div>
        </section>

        {result.state === "completed" ? (
          <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
            <div className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck />契約締結済み</div>
            <p className="mt-2 text-sm">電子締結最終確定日時：{formatDate(contract.completedAt)}</p>
            <div className="mt-5 flex flex-wrap gap-3"><Button asChild className="rounded-xl"><a href={`/api/contracts/c/${encodedToken}/documents/executed`} target="_blank" rel="noreferrer">締結済みPDF</a></Button><Button asChild variant="outline" className="rounded-xl bg-white"><a href={`/api/contracts/c/${encodedToken}/documents/certificate`} target="_blank" rel="noreferrer">締結証明書</a></Button></div>
          </section>
        ) : result.state === "processing" ? (
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-semibold text-amber-950">締結書類を生成中です</h2><p className="mt-2 text-sm text-amber-800">処理が中断された場合は、下のボタンから安全に再開できます。</p><div className="mt-4"><ContractSigningForm token={token} expectedSignerName={contract.signerName} /></div></section>
        ) : (
          <>
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6"><div className="flex items-center gap-2 text-sm font-semibold"><FileCheck2 className="size-4 text-orange-600" />契約書原本</div><a href={`/api/contracts/c/${encodedToken}/documents/original`} target="_blank" rel="noreferrer" className="text-xs font-medium text-orange-700 hover:underline">別画面で開く</a></div>
              <iframe title={`${contract.title} 契約書PDF`} src={`/api/contracts/c/${encodedToken}/documents/original`} className="h-[65vh] min-h-[520px] w-full bg-slate-100" />
            </section>
            <div className="mt-6"><ContractSigningForm token={token} expectedSignerName={contract.signerName} /></div>
          </>
        )}
        <p className="mt-8 text-center text-xs leading-relaxed text-slate-500">本システムは、契約書・本人確認方法・権限表明・契約意思・日時を証跡として保存します。<br />外部認証局または認定電子署名サービスによる電子証明書ではありません。</p>
      </main>
    </>
  );
}
