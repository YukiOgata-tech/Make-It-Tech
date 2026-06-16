import type { Metadata } from "next";
// import Script from "next/script";
import { ToolsShell } from "./components/tools-shell";
import { toolsBaseUrl } from "./_data/tools";

// const adsenseClient = "ca-pub-3927353202195333";

export const metadata: Metadata = {
  metadataBase: new URL(toolsBaseUrl),
  title: {
    default: "無料オンライン開発ツール | DevTools by Make It Tech",
    template: "%s | DevTools",
  },
  description:
    "画像圧縮・変換・リサイズ、PDF圧縮・結合・分割、Base64変換、Markdownプレビュー、JSON変換、QRコード生成など、開発や資料作成に使える無料オンラインツール集。多くの処理はブラウザ内で完結します。",
  keywords: [
    "開発ツール",
    "画像圧縮",
    "画像変換",
    "PDF圧縮",
    "PDF結合",
    "PDF分割",
    "Base64",
    "Favicon",
    "Markdown",
    "JSON変換",
    "QRコード",
    "オンラインツール",
    "無料",
  ],
  openGraph: {
    title: "無料オンライン開発ツール | DevTools",
    description:
      "画像圧縮・変換、PDF圧縮・結合・分割、Base64、Favicon生成、Markdownプレビュー、JSON変換、QRコード生成など。日々の制作・開発作業をブラウザで手早く処理できます。",
    url: toolsBaseUrl,
    siteName: "DevTools by Make It Tech",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: "無料オンライン開発ツール | DevTools",
    description:
      "画像・PDF・テキスト・データ変換に使える無料オンラインツール集。多くの処理はブラウザ内で完結します。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
      {process.env.NODE_ENV === "production" ? (
        <Script
          id="tools-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      ) : null}
      */}
      <ToolsShell>{children}</ToolsShell>
    </>
  );
}
