import Link from "next/link";
import { nfcHref } from "@/content/nfc/site";

/**
 * NFCサブドメインの404。
 *
 * 存在しない中間URL（/r/xxxx）にアクセスされたときにも出るため、
 * ヘッダー・フッターは被せずこの画面だけで完結させる。
 */
export default function NfcNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <p className="nfc-numeric text-5xl" style={{ color: "var(--nfc-alert)" }}>
        404
      </p>
      <p className="nfc-label mt-4">Signal not found</p>

      <h1 className="nfc-display mt-8 text-xl">このリンクは見つかりませんでした</h1>
      <p
        className="mt-4 max-w-sm text-sm leading-relaxed"
        style={{ color: "var(--nfc-dim)" }}
      >
        URLが間違っているか、設定が解除された可能性があります。
        お手数ですが、お店の方にお知らせください。
      </p>

      <Link
        href={nfcHref("/")}
        className="nfc-display mt-10 inline-flex h-11 items-center px-5 text-xs"
        style={{ border: "1px solid var(--nfc-line-bright)" }}
      >
        NFCスタンドについて見る
      </Link>
    </div>
  );
}
