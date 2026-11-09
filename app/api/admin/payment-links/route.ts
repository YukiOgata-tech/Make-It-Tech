import { getAdminSession } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/origin";
import { paymentOrderSchema } from "@/lib/payment-links/domain";
import { savePaymentOrder } from "@/lib/payment-links/server";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!isAllowedSameOriginRequest(request))
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  const session = await getAdminSession();
  if (!session)
    return Response.json(
      { error: "管理者ログインが必要です。" },
      { status: 401 },
    );
  try {
    const parsed = paymentOrderSchema.safeParse(await request.json());
    if (!parsed.success)
      return Response.json(
        { error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    const order = await savePaymentOrder(session, parsed.data);
    return Response.json({ id: order.id }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "保存できませんでした。",
      },
      { status: 400 },
    );
  }
}
