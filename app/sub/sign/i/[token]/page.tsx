import { headers } from "next/headers";
import { AlertTriangle, Clock3, FilePenLine, LockKeyhole } from "lucide-react";
import { ContractPartyInputForm } from "@/components/contracts/contract-party-input-form";
import { getRequestEvidence } from "@/lib/contracts/http";
import { openContractInputRequest } from "@/lib/contracts/input-requests.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export default async function ContractInputPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const requestHeaders = await headers();
  const evidence = getRequestEvidence(
    new Request("https://sign.make-it-tech.com", { headers: requestHeaders })
  );
  const result = await openContractInputRequest(token, evidence);

  if (result.state === "invalid") return <StateMessage title="入力URLを確認できません" message="URLが正しいか確認してください。解決しない場合はMake It Techへお問い合わせください。" />;
  if (result.state === "expired") return <StateMessage title="入力期限が終了しています" message="Make It Techへ入力URLの再発行をご依頼ください。" />;
  if (result.state === "submitted") return <StateMessage title="入力内容は送信済みです" message="Make It Techによる内容確認後、正式な署名URLをメールでお送りします。" />;
  if (result.state === "cancelled") return <StateMessage title="この入力依頼は取り消されています" message="このURLでは入力できません。必要な場合はMake It Techへお問い合わせください。" />;

  const deadline = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(result.request.expiresAt));

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div><p className="text-xs font-medium text-orange-600">Make It Tech</p><p className="font-semibold">会社・署名者情報入力</p></div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="size-4" />専用ページ</div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><FilePenLine className="size-5" /></span>
            <div><p className="text-xs font-medium text-orange-700">会社・署名者情報入力のお願い</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">{result.request.title}</h1><p className="mt-2 text-sm text-slate-600">{result.request.templateName}</p></div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-600"><Clock3 className="size-4" />入力期限：{deadline} JST</div>
        </section>
        <div className="mt-6"><ContractPartyInputForm token={token} request={result.request} /></div>
      </main>
    </>
  );
}
