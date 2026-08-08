import type { Metadata } from "next";
import { NfcShell } from "./_components/nfc-shell";
import { nfcSite } from "@/content/nfc/site";

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
  return <NfcShell>{children}</NfcShell>;
}
