"use client";

import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { NfcEmitter } from "./nfc-emitter";

type NfcRedirectLoaderProps = {
  label: string;
  destinationUrl: string;
  delayMs?: number;
};

export function NfcRedirectLoader({
  label,
  destinationUrl,
  delayMs = 1100,
}: NfcRedirectLoaderProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.replace(destinationUrl);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, destinationUrl]);

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-md text-center">
        <p className="nfc-label">
          <span
            className="nfc-blink mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
            style={{ backgroundColor: "var(--nfc-signal)" }}
            aria-hidden
          />
          NFC signal detected
        </p>

        <div className="mt-10 flex justify-center">
          <NfcEmitter size="md" />
        </div>

        <h1 className="nfc-display mt-10 text-2xl sm:text-3xl">{label}</h1>
        <p className="mt-4 text-sm" style={{ color: "var(--nfc-dim)" }}>
          安全なリンクを確認しました。自動的にページを開きます。
        </p>

        <div
          className="mt-9 h-px overflow-hidden"
          style={{ backgroundColor: "var(--nfc-line)" }}
          aria-hidden
        >
          <span
            className="nfc-redirect-progress block h-full"
            style={{ backgroundColor: "var(--nfc-signal)" }}
          />
        </div>

        <a
          href={destinationUrl}
          className="nfc-label mt-8 inline-flex items-center gap-2 py-2 transition-opacity hover:opacity-75"
          style={{ color: "var(--nfc-dim)" }}
        >
          自動で移動しない場合はこちら
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>

        <p className="nfc-label mt-16">Make It Tech / NFC Field</p>
      </div>
    </main>
  );
}
