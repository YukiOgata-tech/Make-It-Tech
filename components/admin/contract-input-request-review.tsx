"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, FileCheck2, Loader2, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContractInputRequestReview({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [preview, setPreview] = useState<{ blob: Blob; url: string; fileName: string } | null>(null);
  const [busy, setBusy] = useState<"preview" | "finalize" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  async function generatePreview() {
    setBusy("preview");
    setError("");
    try {
      const response = await fetch(
        `/api/admin/contracts/input-requests/${requestId}/preview`,
        { method: "POST" }
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "確認用PDFを生成できませんでした。");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") ?? "";
      const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      setPreview({
        blob,
        url: URL.createObjectURL(blob),
        fileName: encoded ? decodeURIComponent(encoded) : "contract.pdf",
      });
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "確認用PDFを生成できませんでした。");
    } finally {
      setBusy(null);
    }
  }

  async function finalize() {
    if (!preview) return;
    setBusy("finalize");
    setError("");
    try {
      const formData = new FormData();
      formData.set("pdf", preview.blob, preview.fileName);
      const response = await fetch(
        `/api/admin/contracts/input-requests/${requestId}/finalize`,
        { method: "POST", body: formData }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "契約を作成できませんでした。");
      router.push(`/sub/admin-console/contracts/${payload.id}`);
      router.refresh();
    } catch (finalizeError) {
      setError(finalizeError instanceof Error ? finalizeError.message : "契約を作成できませんでした。");
    } finally {
      setBusy(null);
    }
  }

  if (!preview) {
    return (
      <div>
        <p className="text-sm leading-relaxed text-muted-foreground">相手方の入力内容を確認したら、その内容をテンプレートへ反映してPDFを生成します。生成後に全文確認画面を挟みます。</p>
        {error ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
        <Button type="button" size="lg" className="mt-5 rounded-xl" onClick={() => void generatePreview()} disabled={Boolean(busy)}>
          {busy === "preview" ? <><Loader2 className="animate-spin" />PDF変換中...</> : <><ScanSearch />PDFにして内容確認へ</>}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-muted/20 p-3">
        <object data={preview.url} type="application/pdf" className="h-[68vh] min-h-[520px] w-full rounded-xl border bg-background" aria-label="相手方入力から生成した契約書PDF">
          <div className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
            <p className="text-sm">このブラウザではPDFを埋め込み表示できません。</p>
            <Button asChild variant="outline" className="mt-4 rounded-xl"><a href={preview.url} target="_blank" rel="noreferrer"><ExternalLink />別画面で確認</a></Button>
          </div>
        </object>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">このPDFを原本登録した後、契約詳細画面で内容を確定すると正式な署名URLを発行できます。</p>
      {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setPreview(null)} disabled={Boolean(busy)}><ArrowLeft />入力内容へ戻る</Button>
        <Button type="button" size="lg" className="rounded-xl" onClick={() => void finalize()} disabled={Boolean(busy)}>
          {busy === "finalize" ? <><Loader2 className="animate-spin" />原本登録中...</> : <><FileCheck2 />確認したPDFを原本登録</>}
        </Button>
      </div>
    </div>
  );
}
