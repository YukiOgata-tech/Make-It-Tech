import type { Metadata } from "next";
import { ImageConverter } from "../components/image-converter";

export const metadata: Metadata = {
  title: "無料画像フォーマット変換 - JPEG/PNG/WebP対応",
  description:
    "画像をJPEG、PNG、WebP形式に無料変換。ブラウザ上で完結、サーバー送信なし。複数ファイル一括変換対応。高品質な変換処理。",
  keywords: [
    "画像変換",
    "フォーマット変換",
    "JPEG変換",
    "PNG変換",
    "WebP変換",
    "オンライン変換",
    "無料",
  ],
};

export default function ConvertPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ImageConverter />
    </div>
  );
}
