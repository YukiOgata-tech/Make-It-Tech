"use client";

import { useEffect, useState } from "react";

/**
 * アプリを開き、入っていなければWeb版に落とす。
 *
 * インストール済みかどうかはWebから直接判定できないため、まずアプリのURLを
 * 開こうとし、一定時間たっても画面が表示されたまま（＝アプリに切り替わって
 * いない）ならWeb版へ移動する、という手順を踏む。アプリが起動した端末では
 * ページが背面に回るので、visibilitychange を見てWeb版への移動を取り消す。
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
    // 遷移専用のためヘッダー・フッターを持たない。全画面を自前で塗る。
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#101c20] px-6 py-16 text-center text-[#f2ece2]">
      <div
        aria-hidden
        className="relative grid h-20 w-20 place-items-center rounded-full border border-[#32454d]"
      >
        <span className="nfc-ripple absolute h-full w-full rounded-full border border-[#f2c56b]" />
        <span className="nfc-ripple nfc-ripple-delay-1 absolute h-full w-full rounded-full border border-[#f2c56b]" />
        <span className="font-heading text-[10px] font-bold tracking-widest text-[#f2c56b]">
          NFC
        </span>
      </div>

      <p
        className="mt-6 font-heading text-lg font-bold"
        role="status"
        aria-live="polite"
      >
        {label}を開いています
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[#b0c0c6]">
        アプリが入っていない場合は、そのままWeb版に移動します。
      </p>

      <a
        href={webUrl}
        className={`mt-8 inline-flex h-11 items-center rounded-xl border border-[#32454d] px-5 text-sm font-semibold text-[#f2ece2] transition-opacity hover:border-[#f2c56b] hover:text-[#f2c56b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b] ${
          fallbackVisible ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!fallbackVisible}
        tabIndex={fallbackVisible ? undefined : -1}
      >
        移動しない場合はこちら
      </a>
    </div>
  );
}
