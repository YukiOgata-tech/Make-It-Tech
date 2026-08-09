"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { NfcEmitter } from "./nfc-emitter";
import { nfcHero } from "@/content/nfc/lp";
import { nfcLinks, isShopReady } from "@/content/nfc/site";

/**
 * ヒーロー。
 *
 * このサイトで動きを集中させている場所。読み取りリングの中で行き先が
 * 入れ替わり続けることで、「1台でいろいろなページにつなげられる」ことを
 * 説明文より先に見せる。色は増やさず、切り替わるのは言葉だけにしている。
 */
export function NfcHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % nfcHero.rotation.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  const active = nfcHero.rotation[index];

  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
      {/* 走査線 */}
      <span
        aria-hidden
        className="nfc-scan pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--nfc-signal), transparent)",
          opacity: 0.5,
        }}
      />

      <div className="mx-auto max-w-4xl text-center">
        <p className="nfc-label nfc-rise">{nfcHero.eyebrow}</p>

        <h1
          className="nfc-display nfc-rise mt-6 text-[2.6rem] leading-[1.08] sm:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          {nfcHero.title}
          <br />
          {nfcHero.titleAccent}
        </h1>

        {/* 読み取りリングと行き先 */}
        <div
          className="nfc-rise mt-14 flex flex-col items-center"
          style={{ animationDelay: "160ms" }}
        >
          <NfcEmitter size="lg" />

          <div className="mt-8">
            <p className="nfc-label">かざすと開くページ</p>
            <p
              key={active.label}
              className="nfc-display nfc-pop mt-3 text-xl sm:text-3xl"
              style={{ color: "var(--nfc-signal)" }}
              aria-live="polite"
            >
              {active.label}
            </p>
          </div>
        </div>

        <p
          className="nfc-rise mx-auto mt-14 max-w-xl text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--nfc-dim)", animationDelay: "240ms" }}
        >
          {nfcHero.lead}
        </p>

        <ul
          className="nfc-rise mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2"
          style={{ animationDelay: "300ms" }}
        >
          {nfcHero.badges.map((badge) => (
            <li key={badge} className="nfc-label" style={{ color: "var(--nfc-dim)" }}>
              {badge}
            </li>
          ))}
        </ul>

        <div
          className="nfc-rise mt-12 flex flex-wrap justify-center gap-3"
          style={{ animationDelay: "360ms" }}
        >
          {isShopReady ? (
            <a
              href={nfcLinks.shopUrl}
              className="nfc-display inline-flex h-12 items-center px-7 text-sm transition-opacity hover:opacity-85"
              style={{
                backgroundColor: "var(--nfc-signal)",
                color: "var(--nfc-void)",
              }}
            >
              購入する
            </a>
          ) : null}
          <a
            href={nfcLinks.contactUrl}
            className="nfc-display inline-flex h-12 items-center px-7 text-sm transition-colors"
            style={{
              border: "1px solid var(--nfc-line-bright)",
              color: "var(--nfc-text)",
            }}
          >
            相談する
          </a>
        </div>

        <p
          className="nfc-label mt-20 inline-flex items-center gap-2"
          aria-hidden
        >
          <ArrowDown className="h-3 w-3" />
          Scroll
        </p>
      </div>
    </section>
  );
}
