import { z } from "zod";
import type Stripe from "stripe";

const httpsUrl = z
  .string()
  .url()
  .refine(
    (value) => new URL(value).protocol === "https:",
    "HTTPS のURLを入力してください。",
  );
export const paymentOrderSchema = z
  .object({
    orderId: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "注文IDは半角英数字・ハイフン・アンダースコアで入力してください。",
      ),
    title: z.string().trim().min(1).max(120),
    customerName: z.string().trim().max(120),
    salesperson: z.string().trim().max(120),
    quotedAt: z.iso.date(),
    internalMemo: z.string().max(3000),
    publicDescription: z.string().trim().min(1).max(2000),
    collectShipping: z.boolean(),
    approved: z.literal(true, {
      error: "商品・価格・送料・取引条件を確認して承認してください。",
    }),
    items: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(150),
          productId: z
            .string()
            .regex(
              /^prod_[A-Za-z0-9]+$/,
              "既存の Stripe 商品を指定してください。",
            ),
          shopifyProductId: z.string().trim().min(1).max(100),
          variantId: z.string().trim().min(1).max(100),
          sku: z.string().trim().max(100),
          specification: z.string().trim().min(1).max(500),
          evidenceUrl: httpsUrl,
          baselineUnitAmount: z.number().int().positive().max(9999999),
          unitAmount: z.number().int().positive().max(9999999),
          quantity: z.number().int().min(1).max(999),
        }),
      )
      .min(1)
      .max(20),
  })
  .refine(
    (value) => orderTotal(value) <= 9999999,
    "請求総額は9,999,999円以下にしてください。",
  );

export type PaymentOrderInput = z.infer<typeof paymentOrderSchema>;
export type PaymentOrder = PaymentOrderInput & {
  id: string;
  entityId: string;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  state: "draft" | "issuing" | "issued" | "deleting" | "deleted";
  paymentState: "unpaid" | "processing" | "failed" | "paid";
  linkId?: string;
  stripeUrl?: string;
  liveMode?: boolean;
  active?: boolean;
  issuedAt?: string;
  issuingStartedAt?: string;
  leaseUntil?: string;
  deletedAt?: string;
  issuingLiveMode?: boolean;
  sessionId?: string;
  paymentIntentId?: string;
  paidAt?: string;
  saleId?: string;
  salesSyncError?: boolean;
};

export function orderTotal(order: {
  items: readonly { unitAmount: number; quantity: number }[];
}): number {
  return order.items.reduce(
    (sum, item) => sum + item.unitAmount * item.quantity,
    0,
  );
}

export function buildPaymentLinkParams(
  order: PaymentOrder,
  origin: string,
): Stripe.PaymentLinkCreateParams {
  const metadata = {
    mit_payment_order_id: order.id,
    order_id: order.orderId,
    source: "mit_admin_console",
  };
  return {
    line_items: order.items.map((item) => ({
      price_data: {
        currency: "jpy",
        product: item.productId,
        unit_amount: item.unitAmount,
        tax_behavior: "inclusive",
      },
      quantity: item.quantity,
    })),
    metadata,
    payment_intent_data: { metadata },
    restrictions: { completed_sessions: { limit: 1 } },
    automatic_tax: { enabled: false },
    billing_address_collection: "required",
    ...(order.collectShipping
      ? { shipping_address_collection: { allowed_countries: ["JP"] } }
      : {}),
    name_collection: {
      business: { enabled: true, optional: true },
      individual: { enabled: true },
    },
    custom_text: {
      submit: {
        message:
          "Make It Techへのお支払いです。ご案内済みの注文内容・取引条件をご確認ください。表示額は送料・追加費用を含む税込請求総額です。",
      },
    },
    inactive_message:
      "この決済リンクは受付を終了しました。Make It Techへお問い合わせください。",
    after_completion: {
      type: "redirect",
      redirect: { url: `${origin}/pay/${order.publicToken}?submitted=1` },
    },
  };
}

export function sessionMatchesOrder(
  order: PaymentOrder,
  session: Stripe.Checkout.Session,
) {
  const linkId =
    typeof session.payment_link === "string"
      ? session.payment_link
      : session.payment_link?.id;
  return (
    linkId === order.linkId &&
    session.metadata?.mit_payment_order_id === order.id &&
    session.currency === "jpy" &&
    session.amount_total === orderTotal(order) &&
    session.livemode === order.liveMode
  );
}

export function nextPaymentState(
  current: PaymentOrder["paymentState"],
  incoming: PaymentOrder["paymentState"],
) {
  if (current === "paid" || incoming === "paid") return "paid";
  if (current === "failed" && incoming === "processing") return "failed";
  return incoming;
}
