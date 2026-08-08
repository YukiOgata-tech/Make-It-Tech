"use client";

import { useEffect, useState } from "react";
import { nfcHero } from "@/content/nfc/lp";
import { nfcLinks, isShopReady } from "@/content/nfc/site";

const toneColor: Record<string, string> = {
  sun: "#f2c56b",
  coral: "#e2673d",
  teal: "#2a9d91",
  mint: "#ceede4",
};

/**
 * ヒーロー。
 *
 * このページで唯一動きを持たせている場所。NFCの読み取り範囲を波紋で表し、
 * 開く先が入れ替わることで「1台でいろいろなページにつなげられる」ことを
 * 言葉より先に見せる。動きを減らす設定の端末では波紋を止める。
 */
export function NfcHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % nfcHero.rotation.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const active = nfcHero.rotation[index];
  const accent = toneColor[active.tone] ?? "#f2c56b";

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(38rem 22rem at 15% -10%, rgba(242,197,107,0.13), transparent 60%), radial-gradient(34rem 20rem at 90% 10%, rgba(42,157,145,0.14), transparent 55%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#f2c56b] sm:text-sm">
            -{nfcHero.eyebrow}
          </p>

          <h1 className="mt-3 font-heading text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
            {nfcHero.title}
            <br />
            <span style={{ color: accent, transition: "color 600ms ease" }}>
              {nfcHero.titleAccent}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#b0c0c6] sm:text-base">
            {nfcHero.lead}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {nfcHero.badges.map((badge) => (
              <li
                key={badge}
                className="rounded-full border border-[#32454d] bg-[#16262b] px-3 py-1.5 text-xs font-medium text-[#ceede4]"
              >
                {badge}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            {isShopReady ? (
              <a
                href={nfcLinks.shopUrl}
                className="inline-flex h-12 items-center rounded-xl bg-[#e2673d] px-6 text-sm font-semibold text-[#fff8f2] transition-colors hover:bg-[#c9552e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
              >
                商品を見る
              </a>
            ) : null}
            <a
              href={nfcLinks.contactUrl}
              className="inline-flex h-12 items-center rounded-xl border border-[#32454d] px-6 text-sm font-semibold text-[#f2ece2] transition-colors hover:border-[#f2c56b] hover:text-[#f2c56b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              相談する
            </a>
          </div>
        </div>

        {/* かざすビジュアル */}
        <div className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center sm:h-96">
          <div aria-hidden className="relative grid h-56 w-56 place-items-center sm:h-72 sm:w-72">
            {[0, 1, 2].map((ring) => (
              <span
                key={ring}
                className={`nfc-ripple absolute h-full w-full rounded-full border ${
                  ring === 1 ? "nfc-ripple-delay-1" : ring === 2 ? "nfc-ripple-delay-2" : ""
                }`}
                style={{ borderColor: accent, transition: "border-color 600ms ease" }}
              />
            ))}

            {/* スタンド */}
            <div className="absolute bottom-2 grid h-32 w-[5.6rem] place-items-center rounded-2xl border border-[#32454d] bg-[#16262b] shadow-[0_16px_40px_rgba(0,0,0,0.45)] sm:h-40 sm:w-28">
              <span
                className="text-[10px] font-bold tracking-widest"
                style={{ color: accent, transition: "color 600ms ease" }}
              >
                NFC
              </span>
            </div>

            {/* スマホ */}
            <div className="nfc-phone absolute -top-1 right-2 h-24 w-14 rounded-xl border border-[#4a5f68] bg-[#0b1417] shadow-[0_18px_45px_rgba(0,0,0,0.5)] sm:h-28 sm:w-16">
              <span className="mx-auto mt-1.5 block h-1 w-6 rounded-full bg-[#32454d]" />
            </div>
          </div>

          {/* 開く先 */}
          <div className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 text-center">
            <p className="text-[11px] text-[#7d8f96]">かざすと開くページ</p>
            <p
              key={active.label}
              className="mt-1 font-heading text-base font-bold sm:text-lg"
              style={{ color: accent }}
            >
              {active.label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
