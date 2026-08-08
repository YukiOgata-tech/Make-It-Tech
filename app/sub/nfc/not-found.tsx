import Link from "next/link";
import { nfcHref } from "@/content/nfc/site";

/**
 * NFCサブドメインの404。
 *
 * 存在しない中間URL（/r/xxxx）にアクセスされたときにも出るため、
 * 本体サイトのヘッダー・フッターは被せず、この画面だけで完結させる。
 */
export default function NfcNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#101c20] px-6 py-16 text-center text-[#f2ece2]">
      <p className="font-heading text-xs font-bold tracking-widest text-[#f2c56b]">
        404
      </p>
      <h1 className="mt-3 font-heading text-xl font-bold">
        このリンクは見つかりませんでした
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#b0c0c6]">
        URLが間違っているか、設定が解除された可能性があります。
        お手数ですが、お店の方にお知らせください。
      </p>

      <Link
        href={nfcHref("/")}
        className="mt-8 inline-flex h-11 items-center rounded-xl border border-[#32454d] px-5 text-sm font-semibold text-[#f2ece2] transition-colors hover:border-[#f2c56b] hover:text-[#f2c56b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
      >
        NFCスタンドについて見る
      </Link>
    </div>
  );
}
