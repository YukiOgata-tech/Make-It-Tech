import type { Metadata } from "next";
import { PdfCompressor } from "../components/pdf-compressor";
import { toolsBaseUrl } from "../_data/tools";

export const metadata: Metadata = {
  title: "無料PDF圧縮ツール - ローカル処理",
  description:
    "PDFをブラウザ上で安全に圧縮。ファイルはサーバーに送信されず、ローカル処理でPDFを軽量化できます。",
  keywords: ["PDF圧縮", "PDF軽量化", "オンラインPDF圧縮", "無料", "ローカル処理"],
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
