import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Check, RotateCcw, Smartphone } from "lucide-react";
import { NfcSection } from "../../_components/nfc-section";
import { STAMP_COOKIE, parseStamp } from "../../_lib/stamp";
import { resetStamp } from "./actions";
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
      {/* 回数表示 */}
      <NfcSection eyebrow={stampContent.eyebrow} title={stampContent.title}>
        <div className="rounded-3xl border border-[#32454d] bg-[#16262b] p-7 sm:p-10">
          {count === 0 ? (
            <div className="text-center">
              <p className="text-sm leading-relaxed text-[#b0c0c6]">
                まだ数えていません。下のボタンから、かざしたときの動きを試せます。
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-heading text-6xl font-bold leading-none text-[#f2c56b] sm:text-7xl">
                {count}
                <span className="ml-2 align-baseline text-2xl font-bold text-[#b0c0c6] sm:text-3xl">
                  {stampContent.progress.unit}
                </span>
              </p>
              <p className="mt-4 text-sm text-[#b0c0c6]">
                {reached
                  ? stampContent.progress.goalLabel
                  : stampContent.progress.remainingLabel(remaining)}
              </p>
            </div>
          )}

          {/* スタンプ */}
          <ul className="mt-8 flex items-center justify-center gap-4">
            {Array.from({ length: goal }, (_, index) => {
              const filled = index < Math.min(count, goal);
              return (
                <li
                  key={index}
                  className={`grid h-16 w-16 place-items-center rounded-full border-2 transition-colors sm:h-20 sm:w-20 ${
                    filled
                      ? "border-[#f2c56b] bg-[#f2c56b] text-[#101c20]"
                      : "border-dashed border-[#32454d] text-[#4a5f68]"
                  }`}
                >
                  {filled ? (
                    <Check className="h-7 w-7" aria-hidden />
                  ) : (
                    <span className="font-heading text-lg font-bold">{index + 1}</span>
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
            <div className="mt-8 rounded-2xl border-2 border-[#e2673d] bg-[#101c20] p-6 text-center">
              <p className="font-heading text-[11px] font-bold tracking-widest text-[#e2673d]">
                {stampContent.reward.couponLabel}
              </p>
              <p className="mt-3 font-heading text-xl font-bold sm:text-2xl">
                {stampContent.reward.couponText}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#b0c0c6]">
                {stampContent.reward.body}
              </p>
              <p className="mt-4 border-t border-[#32454d] pt-4 text-xs leading-relaxed text-[#7d8f96]">
                {stampContent.reward.note}
              </p>
            </div>
          )}

          {/* 操作 */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* /tap は Route Handler なので Link ではなく通常のリンクで遷移する */}
            <a
              href={nfcHref("/tap")}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#e2673d] px-6 text-sm font-semibold text-[#fff8f2] transition-colors hover:bg-[#c9552e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              <Smartphone className="h-4 w-4" aria-hidden />
              {count === 0 ? "かざしてみる" : "もう一度かざす"}
            </a>

            <form action={resetStamp}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#7d8f96] transition-colors hover:text-[#b0c0c6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                {stampContent.reset.label}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#7d8f96]">
          {stampContent.reset.note}
        </p>

        {/* 集計 */}
        {stats && (
          <div className="mt-6 rounded-2xl border border-[#32454d] bg-[#16262b] p-5">
            <div className="flex flex-wrap items-baseline justify-center gap-x-8 gap-y-2 text-center">
              <p className="text-sm text-[#b0c0c6]">
                {stampContent.stats.label}
                <span className="ml-2 font-heading text-xl font-bold text-[#2a9d91]">
                  {stats.total.toLocaleString("ja-JP")}
                </span>
              </p>
              <p className="text-sm text-[#b0c0c6]">
                {stampContent.stats.devicesLabel}
                <span className="ml-2 font-heading text-xl font-bold text-[#2a9d91]">
                  {stats.devices.toLocaleString("ja-JP")}
                </span>
              </p>
            </div>
            <p className="mt-3 text-center text-xs text-[#7d8f96]">
              {stampContent.stats.note}
            </p>
          </div>
        )}
      </NfcSection>

      {/* 経営者向けの説明 */}
      <NfcSection tone="surface" title={stampContent.explain.title}>
        <ul className="grid gap-4 sm:grid-cols-2">
          {stampContent.explain.items.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-[#32454d] bg-[#101c20] p-5"
            >
              <h3 className="font-heading text-sm font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#b0c0c6]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl border border-[#32454d] bg-[#101c20] p-6">
          <h3 className="font-heading text-sm font-bold text-[#f2c56b]">
            {stampContent.limits.title}
          </h3>
          <ul className="mt-3 grid gap-2">
            {stampContent.limits.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-[#b0c0c6]">
                <span
                  aria-hidden
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#7d8f96]"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </NfcSection>

      {/* CTA */}
      <NfcSection>
        <div className="rounded-3xl border border-[#32454d] bg-[#16262b] p-7 sm:p-10">
          <h2 className="font-heading text-xl font-bold leading-snug sm:text-2xl">
            {stampContent.cta.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b0c0c6]">
            {stampContent.cta.body}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={nfcLinks.contactUrl}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#e2673d] px-6 text-sm font-semibold text-[#fff8f2] transition-colors hover:bg-[#c9552e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              {stampContent.cta.primary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href={nfcHref("/")}
              className="inline-flex h-12 items-center rounded-xl border border-[#32454d] px-6 text-sm font-semibold text-[#f2ece2] transition-colors hover:border-[#f2c56b] hover:text-[#f2c56b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              {stampContent.cta.secondary}
            </Link>
          </div>

          <p className="mt-8 border-t border-[#32454d] pt-6 text-[11px] leading-relaxed text-[#7d8f96]">
            ※ このページは仕組みを体験してもらうためのデモです。実際のお店では、
            同じ日に何度かざしても1回だけ数える、特典を使い切りにするなどの調整を行います。
            NFCタグに書き込むURLは {nfcSite.host}/tap です。
          </p>
        </div>
      </NfcSection>
    </>
  );
}
