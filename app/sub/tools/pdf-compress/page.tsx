import { PdfCompressor } from "../components/pdf-compressor";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "pdf-compress",
  title: "無料PDF圧縮ツール - ローカル処理",
  description:
    "PDFをブラウザ上で圧縮。読みやすさを保つ下限を設け、ページ画像化と再保存の候補から軽い結果を自動判定します。ファイルはサーバーに送信されません。",
  keywords: ["PDF圧縮", "PDF軽量化", "スキャンPDF圧縮", "オンラインPDF圧縮", "無料", "ローカル処理"],
});

export default function PdfCompressPage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="pdf-compress" />
      <PdfCompressor />
    </div>
  );
}
