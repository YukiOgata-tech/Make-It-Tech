import type { Metadata } from "next";
import { ToolsShell } from "./components/tools-shell";
import { toolsBaseUrl } from "./_data/tools";

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
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolsShell>{children}</ToolsShell>;
}
