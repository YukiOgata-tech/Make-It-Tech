import { requireAdmin } from "@/lib/admin-auth";
import { generateContractTemplateWord } from "@/lib/contracts/generated-template.server";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import {
  getContractInputRequest,
  recordContractInputPreview,
} from "@/lib/contracts/input-requests.server";
import { sha256 } from "@/lib/contracts/crypto";
import { convertWordToPdf } from "@/lib/contracts/word-to-pdf.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAllowedSameOriginRequest(request)) {
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  }
  const session = await requireAdmin();
  const { id } = await params;
  const inputRequest = await getContractInputRequest(id);
  if (!inputRequest) {
    return Response.json({ error: "入力依頼が見つかりません。" }, { status: 404 });
  }
  if (inputRequest.status !== "submitted" || !inputRequest.submittedInput) {
    return Response.json({ error: "相手方の入力が完了していません。" }, { status: 409 });
  }

  try {
    const generated = await generateContractTemplateWord(
      inputRequest.sourceTemplateId,
      inputRequest.submittedInput
    );
    const pdfBytes = await convertWordToPdf(generated.bytes, generated.fileName);
    const previewSha256 = sha256(pdfBytes);
    await recordContractInputPreview(id, previewSha256, {
      uid: session.uid,
      email: session.email,
    });
    const pdfFileName = generated.fileName.replace(/\.docx$/i, ".pdf");
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contract-preview.pdf"; filename*=UTF-8''${encodeURIComponent(pdfFileName)}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "確認用PDFを生成できませんでした。" },
      { status: 500 }
    );
  }
}
