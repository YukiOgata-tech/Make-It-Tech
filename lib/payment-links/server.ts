import "server-only";
import { randomBytes, createHash } from "node:crypto";
import Stripe from "stripe";
import { siteDocumentStore as db } from "@/lib/supabase/site-documents";
import type { MitSession } from "@/lib/admin-auth";
import { ensurePaymentSale } from "./sales";
import {
  getStripeKey,
  getStripeWebhookSecret,
  isStripeLiveMode,
} from "./config";
import {
  buildPaymentLinkParams,
  nextPaymentState,
  orderTotal,
  sessionMatchesOrder,
  type PaymentOrder,
  type PaymentOrderInput,
} from "./domain";

const orders = db.collection("paymentOrders");
const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const now = () => new Date().toISOString();
export function stripeConfigured() {
  return Boolean(getStripeKey() && getStripeWebhookSecret());
}
export function stripeClient() {
  const key = getStripeKey();
  if (!key)
    throw new Error("Stripe APIキーが未設定です。下書き保存は利用できます。");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 20000 });
}
export function paymentSiteOrigin() {
  const url = new URL(
    process.env.PAYMENT_SITE_URL || "https://make-it-tech.com",
  );
  if (
    url.protocol !== "https:" &&
    !(process.env.NODE_ENV !== "production" && url.hostname === "localhost")
  )
    throw new Error("PAYMENT_SITE_URLにはHTTPSの公開URLを設定してください。");
  return url.origin;
}
function read(data: unknown) {
  return data as PaymentOrder;
}
function assertOrderMode(order: PaymentOrder) {
  if (order.linkId && order.liveMode !== isStripeLiveMode()) {
    throw new Error(
      "この注文を発行したStripeのテスト・本番環境へ切り替えて操作してください。",
    );
  }
}
export async function listPaymentOrders(session: MitSession) {
  const result = await orders
    .where("entityId", "==", session.entityId)
    .orderBy("createdAt", "desc")
    .get();
  return result.docs.map((doc) => read(doc.data()));
}
export async function getPaymentOrder(session: MitSession, id: string) {
  if (!/^[a-f0-9]{32}$/.test(id)) throw new Error("注文が見つかりません。");
  const data = read((await orders.doc(id).get()).data());
  if (!data || data.entityId !== session.entityId)
    throw new Error("注文が見つかりません。");
  return data;
}
export async function savePaymentOrder(
  session: MitSession,
  input: PaymentOrderInput,
) {
  const id = randomBytes(16).toString("hex");
  const publicToken = randomBytes(32).toString("hex");
  const record: PaymentOrder = {
    ...input,
    id,
    publicToken,
    entityId: session.entityId,
    state: "draft",
    paymentState: "unpaid",
    createdAt: now(),
    updatedAt: now(),
    createdBy: session.uid,
  };
  const uniqueRef = db
    .collection("paymentOrderNumbers")
    .doc(tokenHash(`${session.entityId}:${input.orderId}`));
  await db.runTransaction(async (tx) => {
    if ((await tx.get(uniqueRef)).exists)
      throw new Error("この注文IDは登録済みです。既存注文を確認してください。");
    tx.create(uniqueRef, { id });
    tx.create(orders.doc(id), {
      ...record,
      approvedBy: session.uid,
      approvedAt: now(),
    });
    tx.create(db.collection("paymentOrderTokens").doc(tokenHash(publicToken)), {
      id,
    });
  });
  return record;
}
export async function updatePaymentOrder(
  session: MitSession,
  id: string,
  input: PaymentOrderInput,
) {
  await getPaymentOrder(session, id);
  await db.runTransaction(async (tx) => {
    const ref = orders.doc(id);
    const order = read((await tx.get(ref)).data());
    if (order.state !== "draft")
      throw new Error("発行開始後の注文は編集できません。");
    if (input.orderId !== order.orderId)
      throw new Error("注文IDは変更できません。");
    tx.update(ref, {
      ...input,
      updatedAt: now(),
      approvedBy: session.uid,
      approvedAt: now(),
    });
  });
}
export async function publicPaymentOrder(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const mapping = (
    await db.collection("paymentOrderTokens").doc(tokenHash(token)).get()
  ).data();
  if (!mapping || typeof mapping.id !== "string") return null;
  const record = read((await orders.doc(mapping.id).get()).data());
  if (!record || record.state !== "issued") return null;
  return record;
}
export async function listStripeProducts() {
  const stripe = stripeClient();
  const products = [];
  for await (const product of stripe.products.list({
    active: true,
    limit: 100,
  })) {
    products.push({ id: product.id, name: product.name });
    if (products.length >= 1000) break;
  }
  return products;
}
export async function issuePaymentOrder(session: MitSession, id: string) {
  if (!getStripeWebhookSecret()) {
    throw new Error("リンク発行にはWebhook署名シークレットの設定も必要です。");
  }
  const stripe = stripeClient();
  const origin = paymentSiteOrigin();
  const initial = await getPaymentOrder(session, id);
  assertOrderMode(initial);
  const ref = orders.doc(id);
  const order = await db.runTransaction(async (tx) => {
    const value = read((await tx.get(ref)).data());
    if (value.state === "issued") return value;
    if (!["draft", "issuing"].includes(value.state))
      throw new Error("この注文は発行できません。");
    const issuingLiveMode = isStripeLiveMode();
    if (value.state === "issuing" && value.issuingLiveMode !== issuingLiveMode)
      throw new Error(
        "発行開始時とStripeのテスト・本番環境が異なります。元の環境で発行結果を確認してください。",
      );
    if (value.leaseUntil && value.leaseUntil > now())
      throw new Error("リンクを発行中です。しばらくしてから更新してください。");
    if (
      value.issuingStartedAt &&
      Date.now() - Date.parse(value.issuingStartedAt) > 23 * 3600000
    )
      throw new Error(
        "発行開始から23時間を超えました。Stripeで注文IDを照合し、重複がないことを確認してください。",
      );
    const locked = {
      ...value,
      state: "issuing" as const,
      issuingLiveMode,
      issuingStartedAt: value.issuingStartedAt || now(),
      leaseUntil: new Date(Date.now() + 300000).toISOString(),
    };
    tx.update(ref, locked);
    return locked;
  });
  if (order.state === "issued") return order;
  let attemptedCreation = false;
  try {
    for (const item of order.items) {
      const product = await stripe.products.retrieve(item.productId);
      if (!product.active)
        throw new Error("無効なStripe商品が含まれています。");
    }
    attemptedCreation = true;
    const link = await stripe.paymentLinks.create(
      buildPaymentLinkParams(order, origin),
      { idempotencyKey: `mit-payment-order-${id}` },
    );
    await db.runTransaction(async (tx) => {
      const current = read((await tx.get(ref)).data());
      if (!["issuing", "issued"].includes(current.state))
        throw new Error(
          "注文の状態が変わりました。Stripeの発行結果を確認してください。",
        );
      tx.update(ref, {
        state: "issued",
        linkId: link.id,
        stripeUrl: link.url,
        liveMode: link.livemode,
        active: current.paymentState === "paid" ? false : link.active,
        issuedAt: current.issuedAt || now(),
        leaseUntil: "",
        updatedAt: now(),
      });
    });
    return await getPaymentOrder(session, id);
  } catch (error) {
    await ref.update({
      leaseUntil: "",
      ...(!attemptedCreation && initial.state === "draft"
        ? { state: "draft", issuingStartedAt: "" }
        : {}),
    });
    throw error;
  }
}
async function recordSession(
  order: PaymentOrder,
  session: Stripe.Checkout.Session,
  eventId?: string,
  failed = false,
  confirmedAt?: string,
) {
  if (!sessionMatchesOrder(order, session))
    throw new Error("決済の注文ID・通貨・請求額・モードが一致しません。");
  const state =
    session.payment_status === "paid"
      ? "paid"
      : failed
        ? "failed"
        : "processing";
  await db.runTransaction(async (tx) => {
    const ref = orders.doc(order.id);
    const current = read((await tx.get(ref)).data());
    const eventRef = eventId
      ? db.collection("paymentWebhookEvents").doc(eventId)
      : null;
    if (eventRef && (await tx.get(eventRef)).exists) return;
    const preservePaidEvidence =
      current.paymentState === "paid" && state !== "paid";
    tx.update(ref, {
      paymentState: nextPaymentState(current.paymentState, state),
      ...(!preservePaidEvidence
        ? {
            sessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || "",
          }
        : {}),
      ...(state === "paid"
        ? { paidAt: current.paidAt || confirmedAt || now(), active: false }
        : {}),
      updatedAt: now(),
    });
    if (eventRef)
      tx.create(eventRef, {
        orderId: order.id,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        receivedAt: now(),
      });
  });
  // Run outside the event transaction, including on duplicate event deliveries.
  // A failed transfer is retried without creating another sale or losing payment evidence.
  const current = read((await orders.doc(order.id).get()).data());
  if (current.paymentState === "paid" && current.liveMode && !current.saleId) {
    try {
      const saleId = await ensurePaymentSale(current);
      await orders
        .doc(order.id)
        .update({ saleId, salesSyncError: false, updatedAt: now() });
    } catch (error) {
      await orders
        .doc(order.id)
        .update({ salesSyncError: true, updatedAt: now() });
      throw error;
    }
  }
}
export async function syncPaymentOrder(session: MitSession, id: string) {
  let order = await getPaymentOrder(session, id);
  assertOrderMode(order);
  const stripe = stripeClient();
  if (!order.linkId && order.state === "issuing") {
    if (order.leaseUntil && order.leaseUntil > now())
      throw new Error("発行処理中です。5分ほど待ってから照合してください。");
    if (order.issuingLiveMode !== isStripeLiveMode())
      throw new Error("発行開始時のStripe環境で照合してください。");
    let recovered: Stripe.PaymentLink | undefined;
    for await (const candidate of stripe.paymentLinks.list({ limit: 100 })) {
      if (candidate.metadata.mit_payment_order_id === id) {
        if (recovered)
          throw new Error(
            "同一注文のリンクが複数あります。Stripeで照合してください。",
          );
        recovered = candidate;
      }
    }
    if (!recovered)
      throw new Error(
        "Stripe上に発行済みリンクが見つかりません。発行の再試行またはStripeログの確認を行ってください。",
      );
    const link = recovered;
    await db.runTransaction(async (tx) => {
      const ref = orders.doc(id);
      const current = read((await tx.get(ref)).data());
      if (current.state !== "issuing")
        throw new Error("注文の状態が変わりました。再読み込みしてください。");
      tx.update(ref, {
        state: "issued",
        linkId: link.id,
        stripeUrl: link.url,
        liveMode: link.livemode,
        active: link.active,
        issuedAt: now(),
        leaseUntil: "",
        updatedAt: now(),
      });
    });
    order = await getPaymentOrder(session, id);
  }
  if (!order.linkId) throw new Error("未発行の注文です。");
  const link = await stripe.paymentLinks.retrieve(order.linkId);
  await orders.doc(id).update({ active: link.active, updatedAt: now() });
  for await (const checkout of stripe.checkout.sessions.list({
    payment_link: order.linkId,
    status: "complete",
    limit: 100,
  })) {
    await recordSession(order, checkout);
  }
}
export async function deletePaymentOrder(session: MitSession, id: string) {
  const initial = await getPaymentOrder(session, id);
  assertOrderMode(initial);
  const ref = orders.doc(id);
  const order = await db.runTransaction(async (tx) => {
    const value = read((await tx.get(ref)).data());
    if (value.state === "issuing")
      throw new Error(
        "発行処理中です。発行結果を確認してから削除してください。",
      );
    tx.update(ref, { state: "deleting", updatedAt: now() });
    return value;
  });
  if (order.linkId) {
    const stripe = stripeClient();
    await stripe.paymentLinks.update(order.linkId, { active: false });
    for await (const checkout of stripe.checkout.sessions.list({
      payment_link: order.linkId,
      limit: 100,
    })) {
      if (checkout.status === "open") {
        try {
          await stripe.checkout.sessions.expire(checkout.id);
        } catch (error) {
          const latest = await stripe.checkout.sessions.retrieve(checkout.id);
          if (latest.status === "open") throw error;
          if (latest.status === "complete") await recordSession(order, latest);
        }
      } else if (checkout.status === "complete")
        await recordSession(order, checkout);
    }
  }
  await ref.update({
    state: "deleted",
    active: false,
    deletedAt: now(),
    updatedAt: now(),
  });
}
export async function handlePaymentWebhook(event: Stripe.Event) {
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
    ].includes(event.type)
  )
    return;
  const checkout = event.data.object as Stripe.Checkout.Session;
  const id = checkout.metadata?.mit_payment_order_id;
  if (!id || !/^[a-f0-9]{32}$/.test(id)) return;
  const order = read((await orders.doc(id).get()).data());
  if (!order) return;
  // A webhook can arrive before the link creation response is persisted. Retry it.
  if (!order.linkId) throw new Error("決済リンクの保存待ちです。");
  await recordSession(
    order,
    checkout,
    event.id,
    event.type.endsWith("async_payment_failed"),
    event.created ? new Date(event.created * 1000).toISOString() : undefined,
  );
}
export { orderTotal };
