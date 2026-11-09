import "server-only";

export type StripeMode = "test" | "live";

export function getStripeMode(): StripeMode {
  const mode = process.env.STRIPE_MODE;
  if (mode === "test" || mode === "live") return mode;
  if (mode) {
    throw new Error("STRIPE_MODEはtestまたはliveを指定してください。");
  }
  return process.env.VERCEL_ENV === "production" ? "live" : "test";
}

export function getStripeKey() {
  const mode = getStripeMode();
  const suffix = mode === "live" ? "LIVE" : "TEST";
  const key =
    process.env[`STRIPE_SECRET_KEY_${suffix}`] || process.env.STRIPE_SECRET_KEY;
  if (!key) return undefined;
  if (!new RegExp(`^(rk|sk)_${mode}_`).test(key)) {
    throw new Error(`Stripeの${mode}環境に対応したAPIキーを設定してください。`);
  }
  return key;
}

export function getStripeWebhookSecret() {
  const mode = getStripeMode();
  const scoped =
    process.env[
      mode === "live"
        ? "STRIPE_WEBHOOK_SECRET_LIVE"
        : "STRIPE_WEBHOOK_SECRET_TEST"
    ];
  if (scoped) return scoped;
  // Keep the original single-key setup compatible. With two API keys, require
  // scoped webhook secrets rather than guessing which mode an unlabelled secret belongs to.
  if (
    !process.env.STRIPE_SECRET_KEY_TEST &&
    !process.env.STRIPE_SECRET_KEY_LIVE &&
    getStripeKey()
  ) {
    return process.env.STRIPE_WEBHOOK_SECRET;
  }
  return undefined;
}

export function isStripeLiveMode() {
  return getStripeMode() === "live";
}
