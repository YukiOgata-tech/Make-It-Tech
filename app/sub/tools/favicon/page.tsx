import type { Metadata } from "next";
import { FaviconGenerator } from "../components/favicon-generator";

export const metadata: Metadata = {
  title: "無料Favicon生成ツール - 各種サイズ一括生成",
  description:
    "画像から16x16、32x32、180x180など各種サイズのfaviconを一括生成。ICO形式対応。ブラウザ上で完結、サーバー送信なし。Webサイト制作に必須。",
  keywords: [
    "Favicon生成",
    "アイコン生成",
    "ICO変換",
    "ファビコン",
    "Webサイトアイコン",
    "オンライン生成",
    "無料",
  ],
};

export default function FaviconPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <FaviconGenerator />
    </div>
  );
}
