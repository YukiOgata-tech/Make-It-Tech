import { PdfImageConverter } from "../components/pdf-image-converter";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "pdf-image",
  title: "無料画像PDF変換ツール - 画像からPDF / PDFから画像",
  description:
    "画像をPDFにまとめる、またはPDFの各ページをPNG画像に変換。ブラウザ上で完結し、ファイルはサーバーに送信されません。",
  keywords: ["画像 PDF 変換", "PDF 画像 変換", "画像からPDF", "PDFからPNG", "無料", "ローカル処理"],
});

export default function PdfImagePage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="pdf-image" />
      <PdfImageConverter />
    </div>
  );
}
