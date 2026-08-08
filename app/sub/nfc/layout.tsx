import type { Metadata } from "next";
import { nfcSite } from "@/content/nfc/site";

/**
 * NFCサブドメイン全体の metadata を持つだけのレイアウト。
 *
 * ヘッダー・フッターはここに置かない。中間URL（/r/[slug]）は「かざしたら
 * すぐ行き先へ送る」ためのページで、一瞬でも余計な要素が出ると邪魔になる。
 * 画面の枠が必要なページだけ (site) グループの中に置き、そちらの layout で
 * シェルを被せている。今後の中間URLも (site) の外に置くこと。
 */
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
  return children;
}
