import type { Metadata } from "next";
import { ImageCompressor } from "../components/image-compressor";

export const metadata: Metadata = {
  title: "無料画像圧縮ツール - JPG/PNG/WebP/GIF対応",
  description:
    "JPG、PNG、WebP、GIF画像をブラウザ上で高品質圧縮。品質調整・最大幅指定可能。サーバーにアップロードせず完全ローカル処理で安全。複数ファイル一括処理対応。",
  keywords: [
    "画像圧縮",
    "JPEG圧縮",
    "PNG圧縮",
    "WebP圧縮",
    "ファイルサイズ削減",
    "オンライン圧縮",
    "無料",
  ],
};

export default function CompressPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ImageCompressor />
    </div>
  );
}
