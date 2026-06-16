import { ImageCompressor } from "../components/image-compressor";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "compress",
  title: "無料画像圧縮ツール - JPG/PNG/WebP/GIF対応",
  description:
    "JPG、PNG、WebP、GIF画像をブラウザ上で圧縮。元のファイル形式を保ちながら自動で縮小・画質調整し、サーバーにアップロードせずローカル処理で軽量化できます。",
  keywords: [
    "画像圧縮",
    "JPEG圧縮",
    "PNG圧縮",
    "WebP圧縮",
    "ファイルサイズ削減",
    "オンライン圧縮",
    "無料",
  ],
});

export default function CompressPage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="compress" />
      <ImageCompressor />
    </div>
  );
}
