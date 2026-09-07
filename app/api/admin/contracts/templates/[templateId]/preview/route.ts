import { requireAdmin } from "@/lib/admin-auth";
import {
  ContractTemplateInputError,
  generateContractTemplateWord,
} from "@/lib/contracts/generated-template.server";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { convertWordToPdf } from "@/lib/contracts/word-to-pdf.server";
import {
  CONTRACT_TEMPLATE_IDS,
  type ContractTemplateId,
} from "@/lib/contracts/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  if (!isAllowedSameOriginRequest(request)) {
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  }
  await requireAdmin();
  const { templateId } = await params;
  if (!CONTRACT_TEMPLATE_IDS.includes(templateId as ContractTemplateId)) {
    return Response.json({ error: "テンプレートが見つかりません。" }, { status: 404 });
  }

  try {
    const generated = await generateContractTemplateWord(
      templateId as ContractTemplateId,
      await request.json().catch(() => ({}))
    );
    const pdfBytes = await convertWordToPdf(generated.bytes, generated.fileName);
    const pdfFileName = generated.fileName.replace(/\.docx$/i, ".pdf");
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `inline; filename="contract-preview.pdf"; filename*=UTF-8''${encodeURIComponent(pdfFileName)}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof ContractTemplateInputError) {
      return Response.json(
        { error: error.message, details: error.details },
        { status: 400 }
      );
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "確認用PDFを生成できませんでした。" },
      { status: 500 }
    );
  }
}
