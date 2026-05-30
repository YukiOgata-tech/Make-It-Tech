import type { Metadata } from "next";
import { ImageConverter } from "../components/image-converter";
import { toolsBaseUrl } from "../_data/tools";

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
  alternates: {
    canonical: `${toolsBaseUrl}/convert`,
  },
};

export default function ConvertPage() {
  return (
    <div className="tools-page-container">
      <ImageConverter />
    </div>
  );
}
