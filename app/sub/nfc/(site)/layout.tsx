import { NfcShell } from "../_components/nfc-shell";

/**
 * ヘッダー・フッターを持つページ用のレイアウト。
 *
 * このグループ（site）はURLに影響しない。中間URL（/r/[slug]）のような
 * 遷移専用のページはこの外に置き、シェルを被せない。
 */
export default function NfcSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NfcShell>{children}</NfcShell>;
}
