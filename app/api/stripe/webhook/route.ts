import { handlePaymentWebhook, stripeClient } from "@/lib/payment-links/server";
import {
  getStripeWebhookSecret,
  isStripeLiveMode,
} from "@/lib/payment-links/config";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = getStripeWebhookSecret();
  if (!secret)
    return Response.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return Response.json({ error: "Missing signature." }, { status: 400 });
  const stripe = stripeClient();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }
  if (event.livemode !== isStripeLiveMode()) {
    return Response.json({ error: "Stripe mode mismatch." }, { status: 400 });
  }
  try {
    await handlePaymentWebhook(event);
    return Response.json({ received: true });
  } catch {
    return Response.json(
      { error: "Processing failed. Retry this event." },
      { status: 500 },
    );
  }
}
