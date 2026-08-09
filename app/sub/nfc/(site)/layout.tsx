import { NfcShell } from "../_components/nfc-shell";

/**
 * ヘッダー・フッターを持つページ用のレイアウト。
 *
 * このグループ（site）はURLに影響しない。中間URL（/r/[slug]）や /tap の
 * 遷移先のような、かざした直後に一瞬だけ表示されるページはこの外に置き、
 * シェルを被せない。配色と背景は親の layout が全ページに適用している。
 */
export default function NfcSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NfcShell>{children}</NfcShell>;
}
