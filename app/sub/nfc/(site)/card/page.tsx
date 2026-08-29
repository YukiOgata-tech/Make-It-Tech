import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Check } from "lucide-react";
import { NfcSection } from "../../_components/nfc-section";
import { STAMP_COOKIE, parseStamp } from "../../_lib/stamp";
import { stampConfig, stampContent } from "@/content/nfc/stamp";
import { nfcHref, nfcLinks, nfcSite } from "@/content/nfc/site";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

/** Cookie を読むため毎回サーバーで描画する。 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "この札と出会った回数（デモ）",
  description:
    "スマホをかざした回数を数え、3回目に特典を出すスタンプカードのデモです。アプリのダウンロードも会員登録も必要ありません。",
  robots: { index: false, follow: false },
};

async function readStats() {
  try {
    const { firestore } = getFirebaseAdmin();
    const snapshot = await firestore
      .collection("nfcDemoStats")
      .doc("mit-card")
      .get();
    const data = snapshot.data();
    if (!data) return null;

    return {
      total: Number(data.totalTaps ?? 0),
      devices: Number(data.uniqueDevices ?? 0),
    };
  } catch {
    return null;
  }
}

export default async function NfcCardPage() {
  const store = await cookies();
  const state = parseStamp(store.get(STAMP_COOKIE)?.value);
  const count = state?.count ?? 0;
  const goal = stampConfig.goal;
  const reached = count >= goal;
  const remaining = Math.max(goal - count, 0);
  const stats = await readStats();

  return (
    <>
      <NfcSection divide={false} eyebrow={stampContent.eyebrow} title={stampContent.title}>
        <div className="px-6 py-12 sm:px-10 sm:py-16" style={{ border: "1px solid var(--nfc-line)" }}>
          {/* 回数 */}
          <div className="text-center">
            {count === 0 ? (
              <p className="text-sm leading-relaxed" style={{ color: "var(--nfc-dim)" }}>
                まだ数えていません。NFCタグをタップすると最初の1回が記録されます。
              </p>
            ) : (
              <>
                <p className="nfc-label">Count</p>
                <p
                  className="nfc-numeric nfc-pop mt-3 text-7xl leading-none sm:text-8xl"
                  style={{ color: "var(--nfc-signal)" }}
                  key={count}
                >
                  {count}
                  <span className="nfc-label ml-3 align-super">
                    {stampContent.progress.unit}
                  </span>
                </p>
                <p className="nfc-label mt-6">
                  {reached
                    ? stampContent.progress.goalLabel
                    : stampContent.progress.remainingLabel(remaining)}
                </p>
              </>
            )}
          </div>

          {/* スタンプ */}
          <ul className="mt-12 flex items-center justify-center gap-5 sm:gap-8">
            {Array.from({ length: goal }, (_, index) => {
              const filled = index < Math.min(count, goal);
              const isLatest = index === Math.min(count, goal) - 1;
              return (
                <li
                  key={index}
                  className={`grid h-20 w-20 place-items-center rounded-full sm:h-24 sm:w-24 ${
                    filled && isLatest ? "nfc-pop" : ""
                  }`}
                  style={{
                    border: `1px ${filled ? "solid" : "dashed"} ${
                      filled ? "var(--nfc-signal)" : "var(--nfc-line-bright)"
                    }`,
                    backgroundColor: filled ? "var(--nfc-signal)" : "transparent",
                    color: filled ? "var(--nfc-void)" : "var(--nfc-faint)",
                  }}
                >
                  {filled ? (
                    <Check className="h-8 w-8" aria-hidden />
                  ) : (
                    <span className="nfc-numeric text-lg">{index + 1}</span>
                  )}
                  <span className="sr-only">
                    {index + 1}個目のスタンプ{filled ? "（獲得済み）" : "（未獲得）"}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* 特典 */}
          {reached && (
            <div
              className="nfc-pop mt-12 p-7 text-center sm:p-9"
              style={{ border: "1px solid var(--nfc-signal)" }}
            >
              <p className="nfc-label" style={{ color: "var(--nfc-signal)" }}>
                {stampContent.reward.couponLabel}
              </p>
              <p className="nfc-display mt-4 text-xl sm:text-2xl">
                {stampContent.reward.couponText}
              </p>
              <p
                className="mt-5 text-sm leading-relaxed"
                style={{ color: "var(--nfc-dim)" }}
              >
                {stampContent.reward.body}
              </p>
              <p
                className="nfc-label mt-6 pt-5 leading-relaxed"
                style={{ borderTop: "1px solid var(--nfc-line)" }}
              >
                {stampContent.reward.note}
              </p>
            </div>
          )}

          <p className="nfc-label mt-12 text-center leading-relaxed">
            次の回数は、この端末でNFCタグをもう一度タップしたときに加算されます
          </p>
        </div>

        {/* 集計 */}
        {stats && (
          <div
            className="mt-8 grid gap-px sm:grid-cols-2"
            style={{ backgroundColor: "var(--nfc-line)" }}
          >
            <div className="px-6 py-7 text-center" style={{ backgroundColor: "var(--nfc-void)" }}>
              <p className="nfc-label">{stampContent.stats.label}</p>
              <p className="nfc-numeric mt-3 text-3xl" style={{ color: "var(--nfc-pulse)" }}>
                {stats.total.toLocaleString("ja-JP")}
              </p>
            </div>
            <div className="px-6 py-7 text-center" style={{ backgroundColor: "var(--nfc-void)" }}>
              <p className="nfc-label">{stampContent.stats.devicesLabel}</p>
              <p className="nfc-numeric mt-3 text-3xl" style={{ color: "var(--nfc-pulse)" }}>
                {stats.devices.toLocaleString("ja-JP")}
              </p>
            </div>
          </div>
        )}
        {stats && <p className="nfc-label mt-4 text-center">{stampContent.stats.note}</p>}
      </NfcSection>

      {/* 経営者向けの説明 */}
      <NfcSection eyebrow="For owners" title={stampContent.explain.title}>
        <ul className="grid gap-px sm:grid-cols-2" style={{ backgroundColor: "var(--nfc-line)" }}>
          {stampContent.explain.items.map((item) => (
            <li key={item.title} className="p-7" style={{ backgroundColor: "var(--nfc-void)" }}>
              <h3 className="nfc-display text-sm">{item.title}</h3>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "var(--nfc-dim)" }}
              >
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <p className="nfc-label" style={{ color: "var(--nfc-alert)" }}>
            {stampContent.limits.title}
          </p>
          <ul className="mt-5 grid gap-3">
            {stampContent.limits.items.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm"
                style={{ color: "var(--nfc-dim)" }}
              >
                <span
                  aria-hidden
                  className="mt-2 h-px w-3 shrink-0"
                  style={{ backgroundColor: "var(--nfc-line-bright)" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </NfcSection>

      {/* CTA */}
      <NfcSection>
        <h2 className="nfc-display max-w-3xl text-2xl leading-[1.25] sm:text-3xl">
          {stampContent.cta.title}
        </h2>
        <p
          className="mt-5 max-w-2xl text-sm leading-relaxed"
          style={{ color: "var(--nfc-dim)" }}
        >
          {stampContent.cta.body}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={nfcLinks.contactUrl}
            className="nfc-display inline-flex h-12 items-center gap-2 px-7 text-sm transition-opacity hover:opacity-85"
            style={{
              backgroundColor: "var(--nfc-signal)",
              color: "var(--nfc-void)",
            }}
          >
            {stampContent.cta.primary}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <Link
            href={nfcHref("/")}
            className="nfc-display inline-flex h-12 items-center px-7 text-sm"
            style={{ border: "1px solid var(--nfc-line-bright)" }}
          >
            {stampContent.cta.secondary}
          </Link>
        </div>

        <p
          className="nfc-label mt-16 max-w-3xl pt-8 leading-relaxed"
          style={{ borderTop: "1px solid var(--nfc-line)" }}
        >
          このページは仕組みを体験してもらうためのデモです。実際のお店では、
          同じ日に何度かざしても1回だけ数える、特典を使い切りにするなどの調整を行います。
          NFCタグに書き込むURLは {nfcSite.host}/tap です。
        </p>
      </NfcSection>
    </>
  );
}
