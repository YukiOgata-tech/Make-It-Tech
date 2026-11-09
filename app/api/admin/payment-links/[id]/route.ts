import Stripe from "stripe";
import { isStripeLiveMode } from "@/lib/payment-links/config";
import { getAdminSession } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/origin";
import {
  deletePaymentOrder,
  issuePaymentOrder,
  syncPaymentOrder,
  updatePaymentOrder,
} from "@/lib/payment-links/server";
import { paymentOrderSchema } from "@/lib/payment-links/domain";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) {
  if (!isAllowedSameOriginRequest(request))
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  const session = await getAdminSession();
  if (!session)
    return Response.json(
      { error: "管理者ログインが必要です。" },
      { status: 401 },
    );
  try {
    const { id } = await context.params;
    const { action, confirmLive, input } = await request.json();
    if (action === "save") {
      const parsed = paymentOrderSchema.safeParse(input);
      if (!parsed.success)
        return Response.json(
          { error: parsed.error.issues[0]?.message },
          { status: 400 },
        );
      await updatePaymentOrder(session, id, parsed.data);
    } else if (action === "issue") {
      if (isStripeLiveMode() && confirmLive !== true)
        return Response.json(
          { error: "本番決済リンクの発行確認が必要です。" },
          { status: 400 },
        );
      await issuePaymentOrder(session, id);
    } else if (action === "sync") await syncPaymentOrder(session, id);
    else if (action === "delete") await deletePaymentOrder(session, id);
    else return Response.json({ error: "不正な操作です。" }, { status: 400 });
    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? "Stripeとの処理に失敗しました。API権限・商品ID・Stripeのリクエストログを確認し、同じ注文から再試行してください。"
        : error instanceof Error
          ? error.message
          : "処理できませんでした。";
    return Response.json({ error: message }, { status: 400 });
  }
}
