import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { parseSaleFormData } from "@/lib/sales/schemas";
import { updateSale } from "@/lib/sales/server";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedSameOriginRequest(request)) return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  const session = await requireAdmin();
  const { id } = await params;
  const parsed = parseSaleFormData(await request.formData());
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" }, { status: 400 });
  try {
    await updateSale(session, id, parsed.data);
    revalidatePath("/sub/admin-console/sales");
    revalidatePath(`/sub/admin-console/sales/${id}`);
    revalidatePath("/sub/admin-console/sales/stats");
    return Response.json({ id });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "売上を更新できませんでした。" }, { status: 400 });
  }
}
