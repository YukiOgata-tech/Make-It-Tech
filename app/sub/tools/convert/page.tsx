import { ImageConverter } from "../components/image-converter";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "convert",
  title: "無料画像フォーマット変換 - JPEG/PNG/WebP対応",
  description:
    "画像をJPEG、PNG、WebP形式へ無料で変換できるオンラインツールです。複数ファイルの一括変換に対応し、画質を確認しながら保存形式を変更できます。処理はブラウザ内で完結し、画像はサーバーへ送信されません。",
  keywords: [
    "画像変換",
    "フォーマット変換",
    "JPEG変換",
    "PNG変換",
    "WebP変換",
    "オンライン変換",
    "無料",
  ],
});

export default function ConvertPage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="convert" />
      <ImageConverter />
    </div>
  );
}
