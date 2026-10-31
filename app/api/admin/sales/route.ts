import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { parseSaleFormData } from "@/lib/sales/schemas";
import { addSaleDocument, createSale } from "@/lib/sales/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAllowedSameOriginRequest(request)) return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  const session = await requireAdmin();
  const data = await request.formData();
  const parsed = parseSaleFormData(data);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" }, { status: 400 });
  const file = data.get("invoiceFile");
  const invoiceFile = file instanceof File && file.size > 0 ? file : undefined;
  const invoiceUrl = String(data.get("invoiceUrl") ?? "").trim();
  if (invoiceFile && invoiceUrl) return Response.json({ error: "請求書はファイルかURLの一方を選択してください。" }, { status: 400 });
  if (!invoiceFile && !invoiceUrl && !parsed.data.customerName && !parsed.data.title && !parsed.data.amountYen) {
    return Response.json({ error: "売上情報または請求書を入力してください。" }, { status: 400 });
  }
  try {
    const id = await createSale(session, parsed.data);
    let warning: string | undefined;
    if (invoiceFile || invoiceUrl) {
      try {
        await addSaleDocument(session, id, {
          kind: "invoice", title: String(data.get("invoiceTitle") ?? "請求書") || "請求書",
          file: invoiceFile, url: invoiceUrl || undefined,
        });
      } catch (error) {
        warning = error instanceof Error ? error.message : "請求書を保存できませんでした。";
      }
    }
    revalidatePath("/sub/admin-console/sales");
    revalidatePath("/sub/admin-console/sales/stats");
    return Response.json({ id, warning }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "売上を保存できませんでした。" }, { status: 400 });
  }
}
