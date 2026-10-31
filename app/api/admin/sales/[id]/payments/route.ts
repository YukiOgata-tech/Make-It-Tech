import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { parsePaymentFormData } from "@/lib/sales/schemas";
import { addSaleDocument, recordPayment } from "@/lib/sales/server";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedSameOriginRequest(request)) return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  const session = await requireAdmin();
  const { id } = await params;
  const data = await request.formData();
  const parsed = parsePaymentFormData(data);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "入金内容を確認してください。" }, { status: 400 });
  const file = data.get("proofFile");
  const proofFile = file instanceof File && file.size > 0 ? file : undefined;
  const proofUrl = String(data.get("proofUrl") ?? "").trim();
  if (proofFile && proofUrl) return Response.json({ error: "入金証明はファイルかURLの一方を選択してください。" }, { status: 400 });
  try {
    const paymentId = await recordPayment(session, id, parsed.data);
    let warning: string | undefined;
    if (proofFile || proofUrl) {
      try {
        await addSaleDocument(session, id, {
          kind: "payment_proof", title: "入金証明", paymentId,
          file: proofFile, url: proofUrl || undefined,
        });
      } catch (error) {
        warning = error instanceof Error ? error.message : "入金証明を保存できませんでした。";
      }
    }
    revalidatePath("/sub/admin-console/sales");
    revalidatePath(`/sub/admin-console/sales/${id}`);
    revalidatePath("/sub/admin-console/sales/stats");
    return Response.json({ paymentId, warning }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "入金を保存できませんでした。" }, { status: 400 });
  }
}
