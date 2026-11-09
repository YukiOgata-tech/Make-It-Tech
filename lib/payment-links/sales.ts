import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { orderTotal, type PaymentOrder } from "./domain";

// A stable primary key makes retries safe even when an INSERT response is lost.
export function paymentOrderSaleId(
  order: Pick<PaymentOrder, "entityId" | "id">,
) {
  const hex = createHash("sha256")
    .update(`mit-stripe-sale:${order.entityId}:${order.id}`)
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function buildPaymentSale(order: PaymentOrder) {
  if (
    order.paymentState !== "paid" ||
    !order.liveMode ||
    !order.sessionId ||
    !order.paidAt
  ) {
    throw new Error("本番の入金確認済み注文のみ売上へ転記できます。");
  }
  return {
    id: paymentOrderSaleId(order),
    entity_id: order.entityId,
    status: "draft",
    recognized_on: null,
    customer_name: order.customerName || `顧客名未確認（${order.orderId}）`,
    title: order.title,
    amount_yen: orderTotal(order),
    tax_amount_yen: null,
    created_by: order.createdBy,
    updated_by: order.createdBy,
    notes: [
      "Stripe決済から自動作成。入金確認済み。売上計上日・税額は内容を確認して設定してください。",
      `MIT注文ID: ${order.orderId}`,
      `入金確認日時: ${order.paidAt}`,
      `Payment Link: ${order.linkId || ""}`,
      `Checkout Session: ${order.sessionId}`,
      `PaymentIntent: ${order.paymentIntentId || ""}`,
      "入金先: Stripe（銀行への振込日・入金額・決済手数料とは別管理）",
      ...order.items.map(
        (item) =>
          `${item.title} / ${item.quantity}点 / 単価${item.unitAmount}円`,
      ),
    ]
      .join("\n")
      .slice(0, 2000),
  };
}

export async function ensurePaymentSale(order: PaymentOrder) {
  const row = buildPaymentSale(order);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("売上連携のSupabase設定が不足しています。");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // Use INSERT rather than UPSERT: retries must never overwrite an accountant's edits.
  const { error } = await client.from("mit_sales_records").insert(row);
  if (error && error.code !== "23505")
    throw new Error(
      "売上下書きへの転記に失敗しました。入金照合から再試行してください。",
    );
  if (error) {
    const result = await client
      .from("mit_sales_records")
      .select("id, entity_id")
      .eq("id", row.id)
      .maybeSingle();
    if (
      result.error ||
      !result.data ||
      result.data.entity_id !== order.entityId
    )
      throw new Error("売上の連携先を確認できませんでした。");
  }
  return row.id;
}
