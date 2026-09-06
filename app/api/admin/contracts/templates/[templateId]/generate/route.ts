import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import {
  generateNdaWordDocument,
  getGeneratedNdaFileName,
} from "@/lib/contracts/nda-word-template";
import { ndaTemplateGenerationSchema } from "@/lib/contracts/schemas";
import { readContractTemplate } from "@/lib/contracts/templates.server";

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
  if (templateId !== "nda-standard-v1") {
    return Response.json({ error: "テンプレートが見つかりません。" }, { status: 404 });
  }

  const parsed = ndaTemplateGenerationSchema.safeParse(
    await request.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Wordへ入力する内容を確認してください。", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const { bytes } = await readContractTemplate(templateId);
    const generated = await generateNdaWordDocument(bytes, parsed.data);
    const fileName = getGeneratedNdaFileName(parsed.data);
    return new Response(Buffer.from(generated), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          `attachment; filename="nda-filled.docx"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
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
