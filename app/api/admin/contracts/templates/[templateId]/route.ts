import { requireAdmin } from "@/lib/admin-auth";
import {
  CONTRACT_TEMPLATE_IDS,
  type ContractTemplateId,
} from "@/lib/contracts/constants";
import { readContractTemplate } from "@/lib/contracts/templates.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isTemplateId(value: string): value is ContractTemplateId {
  return CONTRACT_TEMPLATE_IDS.includes(value as ContractTemplateId);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  await requireAdmin();
  const { templateId } = await params;
  if (!isTemplateId(templateId)) {
    return Response.json({ error: "テンプレートが見つかりません。" }, { status: 404 });
  }

  try {
    const { template, bytes } = await readContractTemplate(templateId);
    const encodedFileName = encodeURIComponent(template.fileName);
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          `attachment; filename="nda-standard-v1.docx"; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Content-SHA256": template.sourceSha256,
      },
    });
  } catch {
    return Response.json(
      { error: "テンプレートを読み込めませんでした。" },
      { status: 500 }
    );
  }
}
