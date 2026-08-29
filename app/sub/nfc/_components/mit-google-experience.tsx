"use client";

import Image from "next/image";
import { Check, Copy, ExternalLink, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import type { MitGoogleScanResponse } from "@/content/nfc/mit-google";
import { NfcEmitter } from "./nfc-emitter";

type ExperienceView =
  | { status: "loading" }
  | ({ status: "review" } & Extract<MitGoogleScanResponse, { state: "review" }>)
  | ({ status: "waiting" } & Extract<MitGoogleScanResponse, { state: "waiting" }>)
  | ({ status: "coupon" } & Extract<MitGoogleScanResponse, { state: "coupon" }>)
  | { status: "error" };

function MakeItTechMark() {
  return (
    <div className="flex items-center justify-center gap-3">
      <Image
        src="/images/logo-02_MIT.png"
        alt="Make It Tech"
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="text-left">
        <p className="nfc-display text-sm tracking-[-0.02em]">Make It Tech</p>
        <p className="nfc-label mt-1">NFC Experience</p>
      </div>
    </div>
  );
}

function SignalHeader({ scanCount }: { scanCount?: number }) {
  return (
    <div className="flex items-center justify-between border-b px-5 py-4 nfc-hairline">
      <span className="nfc-label flex items-center gap-2">
        <span
          className="nfc-blink h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "var(--nfc-signal)" }}
          aria-hidden
        />
        NFC connected
      </span>
      <span className="nfc-numeric text-xs" style={{ color: "var(--nfc-dim)" }}>
        TAP {scanCount ?? "--"}
      </span>
    </div>
  );
}

export function MitGoogleExperience() {
  const [view, setView] = useState<ExperienceView>({ status: "loading" });
  const [copied, setCopied] = useState(false);
  const reviewUrl = view.status === "review" ? view.reviewUrl : null;

  useEffect(() => {
    const controller = new AbortController();

    async function recordScan() {
      try {
        const response = await fetch("/api/nfc/mit-google/scan", {
          method: "POST",
          cache: "no-store",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error(`Scan API returned ${response.status}`);

        const result = (await response.json()) as MitGoogleScanResponse;
        if (controller.signal.aborted) return;

        if (result.state === "review") {
          setView({ status: "review", ...result });
        } else if (result.state === "waiting") {
          setView({ status: "waiting", ...result });
        } else {
          setView({ status: "coupon", ...result });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setView({ status: "error" });
      }
    }

    void recordScan();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!reviewUrl) return;

    const timer = window.setTimeout(() => {
      window.location.replace(reviewUrl);
    }, 1300);

    return () => window.clearTimeout(timer);
  }, [reviewUrl]);

  useEffect(() => {
    if (view.status !== "waiting") return;

    const timer = window.setInterval(() => {
      setView((current) => {
        if (current.status !== "waiting") return current;
        if (current.remainingSeconds <= 1) {
          return {
            status: "coupon",
            state: "coupon",
            scanCount: current.scanCount,
            couponCode: current.couponCode,
          };
        }

        return {
          ...current,
          remainingSeconds: current.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [view.status]);

  async function copyCoupon(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8 sm:px-6">
      <section className="w-full max-w-md">
        <div className="mb-7">
          <MakeItTechMark />
        </div>

        <div className="nfc-panel overflow-hidden">
          <SignalHeader
            scanCount={
              view.status === "review" ||
              view.status === "waiting" ||
              view.status === "coupon"
                ? view.scanCount
                : undefined
            }
          />

          <div className="min-h-[29rem] px-6 py-10 sm:px-9">
            {view.status === "loading" && (
              <div className="flex h-full min-h-[23rem] flex-col items-center justify-center text-center">
                <NfcEmitter size="md" />
                <p className="nfc-label mt-10" style={{ color: "var(--nfc-signal)" }}>
                  Reading NFC signal
                </p>
                <h1 className="nfc-display mt-4 text-2xl">タップ情報を確認しています</h1>
                <p className="mt-3 text-sm" style={{ color: "var(--nfc-dim)" }}>
                  この端末でのアクセス回数を安全に確認中です。
                </p>
              </div>
            )}

            {view.status === "review" && (
              <div className="flex h-full min-h-[23rem] flex-col items-center justify-center text-center">
                <div
                  className="grid h-20 w-20 place-items-center rounded-full border"
                  style={{ borderColor: "var(--nfc-signal)" }}
                >
                  <ExternalLink
                    className="h-7 w-7"
                    style={{ color: "var(--nfc-signal)" }}
                    aria-hidden
                  />
                </div>
                <p className="nfc-label mt-9" style={{ color: "var(--nfc-signal)" }}>
                  First tap detected
                </p>
                <h1 className="nfc-display mt-4 text-2xl">Googleレビューを開きます</h1>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--nfc-dim)" }}>
                  ご利用ありがとうございます。まもなくレビュー画面へ移動します。
                </p>
                <div
                  className="mt-8 h-px w-full overflow-hidden"
                  style={{ backgroundColor: "var(--nfc-line)" }}
                  aria-hidden
                >
                  <span
                    className="nfc-redirect-progress block h-full"
                    style={{ backgroundColor: "var(--nfc-signal)" }}
                  />
                </div>
                <a
                  href={view.reviewUrl}
                  className="nfc-label mt-6 inline-flex items-center gap-2 py-2"
                  style={{ color: "var(--nfc-dim)" }}
                >
                  自動で開かない場合はこちら
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            )}

            {view.status === "waiting" && (
              <div className="flex h-full min-h-[23rem] flex-col items-center justify-center text-center">
                <div
                  className="grid h-20 w-20 place-items-center rounded-full border"
                  style={{ borderColor: "var(--nfc-line-bright)" }}
                >
                  <LockKeyhole
                    className="h-7 w-7"
                    style={{ color: "var(--nfc-dim)" }}
                    aria-hidden
                  />
                </div>
                <p className="nfc-label mt-9">Coupon standby</p>
                <h1 className="nfc-display mt-4 text-2xl">クーポンを準備しています</h1>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--nfc-dim)" }}>
                  初回タップから1分後に利用できるようになります。
                </p>
                <p
                  className="nfc-numeric mt-8 text-6xl"
                  style={{ color: "var(--nfc-signal)" }}
                  aria-live="polite"
                >
                  {String(view.remainingSeconds).padStart(2, "0")}
                </p>
                <p className="nfc-label mt-2">seconds</p>
                <p className="mt-8 text-xs leading-relaxed" style={{ color: "var(--nfc-faint)" }}>
                  レビュー投稿の有無にかかわらず、時間経過後に表示されます。
                </p>
              </div>
            )}

            {view.status === "coupon" && (
              <div className="flex h-full min-h-[23rem] flex-col items-center justify-center text-center">
                <div
                  className="nfc-pop grid h-20 w-20 place-items-center rounded-full border"
                  style={{
                    borderColor: "var(--nfc-signal)",
                    backgroundColor: "rgb(0 229 199 / 0.08)",
                  }}
                >
                  <Check
                    className="h-8 w-8"
                    style={{ color: "var(--nfc-signal)" }}
                    aria-hidden
                  />
                </div>
                <p className="nfc-label mt-9" style={{ color: "var(--nfc-signal)" }}>
                  Coupon unlocked
                </p>
                <h1 className="nfc-display mt-4 text-2xl">ショップで使えるクーポン</h1>
                <p className="mt-3 text-sm" style={{ color: "var(--nfc-dim)" }}>
                  購入画面で、下記のコードを入力してください。
                </p>
                <div
                  className="mt-8 w-full border px-4 py-6"
                  style={{
                    borderColor: "var(--nfc-signal)",
                    backgroundColor: "rgb(0 229 199 / 0.05)",
                  }}
                >
                  <p className="nfc-label">Coupon code</p>
                  <p
                    className="nfc-numeric mt-3 break-all text-4xl tracking-[0.08em]"
                    style={{ color: "var(--nfc-signal)" }}
                  >
                    {view.couponCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyCoupon(view.couponCode)}
                  className="nfc-display mt-5 inline-flex h-12 w-full items-center justify-center gap-2 border text-sm transition-colors"
                  style={{ borderColor: "var(--nfc-line-bright)" }}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      コピーしました
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden />
                      コードをコピー
                    </>
                  )}
                </button>
                <p className="mt-6 text-xs leading-relaxed" style={{ color: "var(--nfc-faint)" }}>
                  クーポンはレビュー投稿の有無に関係なく、2回目以降のタップで表示されます。
                </p>
              </div>
            )}

            {view.status === "error" && (
              <div className="flex h-full min-h-[23rem] flex-col items-center justify-center text-center">
                <NfcEmitter size="sm" className="opacity-50" />
                <p className="nfc-label mt-9" style={{ color: "var(--nfc-alert)" }}>
                  Connection error
                </p>
                <h1 className="nfc-display mt-4 text-2xl">タップ情報を確認できませんでした</h1>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--nfc-dim)" }}>
                  通信環境を確認し、NFCタグをもう一度かざしてください。
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="nfc-label mt-7 text-center">MIT / Make It Tech</p>
      </section>
    </main>
  );
}
