import type { Metadata } from "next";
import { ToolsShell } from "./components/tools-shell";

export const metadata: Metadata = {
  title: {
    default: "無料オンライン開発ツール | DevTools by Make It Tech",
    template: "%s | DevTools",
  },
  description:
    "画像圧縮・変換・リサイズ、Base64変換、Favicon生成、Markdownプレビュー、JSON変換、QRコード生成など、開発に必要なツールをブラウザ上で無料で使用。データはサーバーに送信されず、完全ローカル処理で安心。",
  keywords: [
    "開発ツール",
    "画像圧縮",
    "画像変換",
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
      "画像圧縮・変換、Base64、Favicon生成、Markdownプレビュー、JSON変換、QRコード生成など。すべてブラウザ内で完結、サーバー送信なし。",
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
