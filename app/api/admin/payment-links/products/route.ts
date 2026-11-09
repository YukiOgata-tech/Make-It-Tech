import { getAdminSession } from "@/lib/admin-auth";
import { listStripeProducts } from "@/lib/payment-links/server";

export async function GET() {
  if (!(await getAdminSession()))
    return Response.json(
      { error: "管理者ログインが必要です。" },
      { status: 401 },
    );
  try {
    return Response.json(
      { products: await listStripeProducts() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        error:
          "Stripe商品を取得できません。APIキーと商品の読み取り権限を確認してください。",
      },
      { status: 503 },
    );
  }
}
