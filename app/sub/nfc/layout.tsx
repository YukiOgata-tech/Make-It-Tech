import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { NfcField } from "./_components/nfc-field";
import { nfcSite } from "@/content/nfc/site";
import "./nfc-theme.css";

/**
 * NFCサブドメイン全体の外枠。
 *
 * ヘッダー・フッターはここに置かない。中間URL（/r/[slug]）や /tap の遷移先は
 * 「かざしたらすぐ行き先へ送る」ためのページで、一瞬でも余計な要素が出ると
 * 邪魔になる。画面の枠が必要なページだけ (site) グループに入れている。
 *
 * 一方、配色・書体・背景の「場」はタグ先すべてで共通にしたいので、この階層で
 * 適用している。本体サイトとは別の見た目にするため、テーマ変数には依存しない。
 */
const nfcDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-nfc-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(nfcSite.url),
  title: {
    // absolute にしないと、ルートレイアウトの template（"%s | Make It Tech"）が
    // 重ねて適用されてサイト名が二重になる。template は配下のページに効く。
    absolute: nfcSite.title,
    template: `%s | ${nfcSite.name}`,
  },
  description: nfcSite.description,
  keywords: [...nfcSite.keywords],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: nfcSite.title,
    description: nfcSite.description,
    url: nfcSite.url,
    siteName: nfcSite.name,
    type: "website",
    locale: nfcSite.locale,
    images: [nfcSite.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: nfcSite.title,
    description: nfcSite.description,
    images: [nfcSite.ogImage.url],
  },
  // 中身が揃うまでは検索結果に出さない。content/nfc/site.ts の indexable で切り替える。
  robots: nfcSite.indexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : { index: false, follow: false },
};

export default function NfcLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`nfc-root ${nfcDisplay.variable}`}>
      <NfcField />
      <div className="nfc-above flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
