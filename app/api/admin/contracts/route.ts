import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createContractSchema } from "@/lib/contracts/schemas";
import { createContract } from "@/lib/contracts/server";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAllowedSameOriginRequest(request)) {
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  }
  const session = await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("pdf");
  if (!(file instanceof File)) {
    return Response.json({ error: "契約書PDFを選択してください。" }, { status: 400 });
  }

  const parsed = createContractSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    internalMemo: formData.get("internalMemo") ?? "",
    companyName: formData.get("companyName"),
    corporateNumber: formData.get("corporateNumber") ?? "",
    companyAddress: formData.get("companyAddress") ?? "",
    signerName: formData.get("signerName"),
    signerRole: formData.get("signerRole"),
    signerEmail: formData.get("signerEmail"),
    sourceTemplateId: formData.get("sourceTemplateId") || undefined,
    effectiveDate: formData.get("effectiveDate") || undefined,
  });
  if (!parsed.success) {
    return Response.json(
      { error: "入力内容を確認してください。", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await createContract(parsed.data, file, {
      uid: session.uid,
      email: session.email,
    });
    revalidatePath("/sub/admin-console/contracts");
    return Response.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "契約の作成に失敗しました。" },
      { status: 400 }
    );
  }
}
