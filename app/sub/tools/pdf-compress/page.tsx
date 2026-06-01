import type { Metadata } from "next";
import { PdfCompressor } from "../components/pdf-compressor";
import { toolsBaseUrl } from "../_data/tools";

export const metadata: Metadata = {
  title: "無料PDF圧縮ツール - ローカル処理",
  description:
    "PDFをブラウザ上で圧縮。スキャンPDFの画像再圧縮にも対応し、ファイルをサーバーに送信せずローカル処理で軽量化できます。",
  keywords: ["PDF圧縮", "PDF軽量化", "スキャンPDF圧縮", "オンラインPDF圧縮", "無料", "ローカル処理"],
  alternates: {
    canonical: `${toolsBaseUrl}/pdf-compress`,
  },
};

export default function PdfCompressPage() {
  return (
    <div className="tools-page-container">
      <PdfCompressor />
    </div>
  );
}
