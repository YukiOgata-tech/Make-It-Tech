import Link from "next/link";
import Image from "next/image";
import { nfcSite, nfcLinks, nfcHref, isShopReady } from "@/content/nfc/site";

/**
 * NFCサブドメインの外枠。
 *
 * 本体サイト（クリーム基調）とは別の見た目にするため、テーマ変数ではなく
 * 色を直接指定している。tools サブドメインと同じ考え方で、next-themes の
 * ライト/ダーク切り替えの影響を受けずに常に同じ見た目になる。
 */
export function NfcShell({ children }: { children: React.ReactNode }) {
  const primaryCta = isShopReady
    ? { href: nfcLinks.shopUrl, label: "商品を見る", external: true }
    : { href: nfcLinks.contactUrl, label: "相談する", external: true };

  return (
    <div className="flex min-h-dvh flex-col bg-[#101c20] text-[#f2ece2]">
      <header className="sticky top-0 z-50 border-b border-[#32454d] bg-[#101c20]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href={nfcHref("/")} className="flex min-w-0 items-center gap-2.5">
            <Image
              src={nfcSite.logo}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain"
              priority
            />
            <span className="min-w-0">
              <span className="block truncate font-heading text-base font-bold tracking-tight sm:text-lg">
                NFCスタンド・プレート
              </span>
              <span className="hidden text-[11px] text-[#b0c0c6] sm:block">
                Make It Tech
              </span>
            </span>
          </Link>

          <a
            href={primaryCta.href}
            className="inline-flex h-10 shrink-0 items-center rounded-xl bg-[#e2673d] px-4 text-sm font-semibold text-[#fff8f2] transition-colors hover:bg-[#c9552e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
          >
            {primaryCta.label}
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#32454d] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-heading text-sm font-bold">Make It Tech</p>
            <p className="mt-1 text-xs leading-relaxed text-[#b0c0c6]">
              新潟県内を中心に、Web制作と業務改善を支援しています。
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#b0c0c6]">
            <a href={nfcLinks.parentUrl} className="hover:text-[#f2ece2]">
              Make It Tech 本体サイト
            </a>
            <a href={nfcLinks.contactUrl} className="hover:text-[#f2ece2]">
              お問い合わせ
            </a>
            <a href={`${nfcLinks.parentUrl}/privacy`} className="hover:text-[#f2ece2]">
              プライバシーポリシー
            </a>
            <a href={`${nfcLinks.parentUrl}/terms`} className="hover:text-[#f2ece2]">
              利用規約
            </a>
          </nav>
        </div>

        <p className="mx-auto mt-6 max-w-6xl text-[11px] text-[#7d8f96]">
          © {new Date().getFullYear()} Make It Tech
        </p>
      </footer>
    </div>
  );
}
