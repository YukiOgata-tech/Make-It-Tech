import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { SALE_DOCUMENT_KINDS } from "@/lib/sales/constants";
import type { SaleDocumentKind } from "@/lib/sales/constants";
import { addSaleDocument } from "@/lib/sales/server";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedSameOriginRequest(request)) return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  const session = await requireAdmin();
  const { id } = await params;
  const data = await request.formData();
  const kind = String(data.get("kind") ?? "");
  if (!SALE_DOCUMENT_KINDS.includes(kind as SaleDocumentKind)) {
    return Response.json({ error: "資料の種類を確認してください。" }, { status: 400 });
  }
  const file = data.get("file");
  try {
    await addSaleDocument(session, id, {
      kind: kind as SaleDocumentKind,
      title: String(data.get("title") ?? ""),
      paymentId: String(data.get("paymentId") ?? "") || undefined,
      url: String(data.get("url") ?? "").trim() || undefined,
      file: file instanceof File && file.size > 0 ? file : undefined,
    });
    revalidatePath(`/sub/admin-console/sales/${id}`);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "資料を保存できませんでした。" }, { status: 400 });
  }
}
