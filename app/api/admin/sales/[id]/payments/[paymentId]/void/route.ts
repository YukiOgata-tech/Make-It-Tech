import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { voidPayment } from "@/lib/sales/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  if (!isAllowedSameOriginRequest(request)) return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  const session = await requireAdmin();
  const { id, paymentId } = await params;
  try {
    await voidPayment(session, id, paymentId);
    revalidatePath("/sub/admin-console/sales");
    revalidatePath(`/sub/admin-console/sales/${id}`);
    revalidatePath("/sub/admin-console/sales/stats");
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "入金を取り消せませんでした。" }, { status: 400 });
  }
}
