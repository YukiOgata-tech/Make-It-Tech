"use client";

import { useEffect, useState } from "react";
import { NfcEmitter } from "./nfc-emitter";

/**
 * アプリを開き、入っていなければWeb版に落とす。
 *
 * インストール済みかどうかはWebから直接判定できないため、まずアプリのURLを
 * 開こうとし、一定時間たっても画面が表示されたまま（＝アプリに切り替わって
 * いない）ならWeb版へ移動する、という手順を踏む。アプリが起動した端末では
 * ページが背面に回るので、visibilitychange を見てWeb版への移動を取り消す。
 *
 * かざした直後に一瞬だけ見える画面なので、ヘッダー・フッターは持たない。
 */
export function NfcAppLauncher({
  label,
  appUrl,
  webUrl,
}: {
  label: string;
  appUrl: string;
  webUrl: string;
}) {
  const [fallbackVisible, setFallbackVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const goToWeb = () => {
      if (cancelled) return;
      window.location.replace(webUrl);
    };

    // アプリに切り替わったらWeb版への移動を取り消す
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelled = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const fallbackTimer = window.setTimeout(goToWeb, 1600);
    // 自動遷移が効かない環境向けに、手動リンクを少し遅れて出す
    const revealTimer = window.setTimeout(() => setFallbackVisible(true), 2600);

    window.location.href = appUrl;

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(revealTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [appUrl, webUrl]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <NfcEmitter size="md" />

      <p className="nfc-label mt-10">Connecting</p>
      <p
        className="nfc-display mt-3 text-xl"
        role="status"
        aria-live="polite"
      >
        {label}を開いています
      </p>
      <p
        className="mt-4 max-w-xs text-xs leading-relaxed"
        style={{ color: "var(--nfc-dim)" }}
      >
        アプリが入っていない場合は、そのままWeb版に移動します。
      </p>

      <a
        href={webUrl}
        className="nfc-display mt-10 inline-flex h-11 items-center px-5 text-xs transition-opacity"
        style={{
          border: "1px solid var(--nfc-line-bright)",
          opacity: fallbackVisible ? 1 : 0,
        }}
        aria-hidden={!fallbackVisible}
        tabIndex={fallbackVisible ? undefined : -1}
      >
        移動しない場合はこちら
      </a>
    </div>
  );
}
