import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import {
  generateNdaWordDocument,
  getGeneratedNdaFileName,
} from "@/lib/contracts/nda-word-template";
import {
  generateDataHandlingWordDocument,
  getGeneratedDataHandlingFileName,
} from "@/lib/contracts/data-handling-word-template";
import {
  generateFdeMasterWordDocument,
  getGeneratedFdeMasterFileName,
} from "@/lib/contracts/fde-master-word-template";
import {
  dataHandlingTemplateGenerationSchema,
  fdeMasterTemplateGenerationSchema,
  ndaTemplateGenerationSchema,
} from "@/lib/contracts/schemas";
import { readContractTemplate } from "@/lib/contracts/templates.server";
import {
  CONTRACT_TEMPLATE_IDS,
  CONTRACT_TEMPLATES,
  type ContractTemplateId,
} from "@/lib/contracts/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const contractTemplateId = templateId as ContractTemplateId;
  const template = CONTRACT_TEMPLATES[contractTemplateId];
  const payload = await request.json().catch(() => ({}));

  try {
    const { bytes } = await readContractTemplate(contractTemplateId);
    let generated: Uint8Array;
    let fileName: string;

    if (template.formKind === "nda") {
      const parsed = ndaTemplateGenerationSchema.safeParse(payload);
      if (!parsed.success) {
        return Response.json(
          { error: "Wordへ入力する内容を確認してください。", details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      generated = await generateNdaWordDocument(bytes, parsed.data);
      fileName = getGeneratedNdaFileName(parsed.data);
    } else if (template.formKind === "data_handling") {
      const parsed = dataHandlingTemplateGenerationSchema.safeParse(payload);
      if (!parsed.success) {
        return Response.json(
          { error: "Wordへ入力する内容を確認してください。", details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      generated = await generateDataHandlingWordDocument(bytes, parsed.data);
      fileName = getGeneratedDataHandlingFileName(parsed.data);
    } else {
      const parsed = fdeMasterTemplateGenerationSchema.safeParse(payload);
      if (!parsed.success) {
        return Response.json(
          { error: "Wordへ入力する内容を確認してください。", details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      generated = await generateFdeMasterWordDocument(bytes, parsed.data);
      fileName = getGeneratedFdeMasterFileName(parsed.data);
    }

    return new Response(Buffer.from(generated), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          `attachment; filename="contract-filled.docx"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Wordを生成できませんでした。" },
      { status: 500 }
    );
  }
}
