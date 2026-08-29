import Link from "next/link";
import { LineButton } from "@/components/ui/line-button";
import { nfcLinks, nfcHref, isShopReady } from "@/content/nfc/site";

/**
 * ヘッダーとフッター。
 *
 * 本体サイトのように面や影で区切らず、細い罫線だけで構造を示す。
 * 中身の邪魔をせず、背景の「場」が主役に見えるよう最小限にしている。
 */
export function NfcShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 backdrop-blur"
        style={{
          borderBottom: "1px solid var(--nfc-line)",
          backgroundColor: "rgb(5 7 13 / 0.72)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href={nfcHref("/")} className="group flex items-center gap-3">
            <span
              className="nfc-blink block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: "var(--nfc-signal)" }}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="nfc-display block truncate text-[0.95rem] leading-none">
                NFC FIELD
              </span>
              <span className="nfc-label mt-1 block">Make It Tech</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href={nfcHref("/demo")}
              className="hidden px-3 py-2 text-xs font-medium transition-colors md:block"
              style={{ color: "var(--nfc-dim)" }}
            >
              できること
            </Link>
            {isShopReady ? (
              <a
                href={nfcLinks.shopUrl}
                className="nfc-display hidden h-9 shrink-0 items-center px-4 text-xs transition-opacity hover:opacity-85 sm:inline-flex"
                style={{
                  backgroundColor: "var(--nfc-signal)",
                  color: "var(--nfc-void)",
                }}
              >
                商品を見る
              </a>
            ) : null}
            <LineButton
              href={nfcLinks.lineUrl}
              size="sm"
              className="h-9 shrink-0 rounded-lg px-3 text-xs"
            >
              <span className="sm:hidden">LINE</span>
              <span className="hidden sm:inline">LINEで相談</span>
            </LineButton>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer style={{ borderTop: "1px solid var(--nfc-line)" }}>
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="nfc-display text-sm leading-none">NFC FIELD</p>
              <p className="nfc-label mt-2">Make It Tech / Niigata</p>
              <p
                className="mt-4 max-w-xs text-xs leading-relaxed"
                style={{ color: "var(--nfc-dim)" }}
              >
                かざすだけで、見てほしいページへつなぐ。設定まで済ませてお届けします。
              </p>
            </div>

            <nav className="grid gap-2.5 text-xs">
              {[
                { href: nfcHref("/"), label: "商品について", internal: true },
                { href: nfcHref("/demo"), label: "できること", internal: true },
                { href: nfcLinks.lineUrl, label: "公式LINEで相談", internal: false },
                { href: nfcLinks.parentUrl, label: "Make It Tech 本体", internal: false },
                {
                  href: `${nfcLinks.parentUrl}/privacy`,
                  label: "プライバシーポリシー",
                  internal: false,
                },
              ].map((item) =>
                item.internal ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="transition-colors hover:opacity-80"
                    style={{ color: "var(--nfc-dim)" }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className="transition-colors hover:opacity-80"
                    style={{ color: "var(--nfc-dim)" }}
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>
          </div>

          <p
            className="nfc-label mt-10"
            style={{ borderTop: "1px solid var(--nfc-line)", paddingTop: "1.25rem" }}
          >
            © {new Date().getFullYear()} Make It Tech
          </p>
        </div>
      </footer>
    </>
  );
}
