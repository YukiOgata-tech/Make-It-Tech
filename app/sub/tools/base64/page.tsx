import type { Metadata } from "next";
import { Base64Converter } from "../components/base64-converter";

export const metadata: Metadata = {
  title: "無料Base64変換ツール - 画像↔Base64",
  description:
    "画像をBase64文字列に変換、またはBase64から画像に復元。Data URI形式対応。ブラウザ上で完結、サーバー送信なし。開発・埋め込み用途に最適。",
  keywords: [
    "Base64変換",
    "Base64エンコード",
    "Base64デコード",
    "Data URI",
    "画像埋め込み",
    "オンライン変換",
    "無料",
  ],
};

export default function Base64Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Base64Converter />
    </div>
  );
}
