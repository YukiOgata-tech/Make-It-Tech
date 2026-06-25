import { PdfSplitter } from "../components/pdf-splitter";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "pdf-split",
  title: "無料PDF分割ツール - ページ範囲指定対応",
  description:
    "PDFを1ページずつ、または指定したページ範囲ごとに無料で分割できるオンラインツールです。必要なページだけを抽出し、複数のPDFとして保存できます。処理はブラウザ内で完結し、ファイルはサーバーへ送信されません。",
  keywords: ["PDF分割", "PDFページ抽出", "PDF範囲指定", "無料", "ローカル処理"],
});

export default function PdfSplitPage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="pdf-split" />
      <PdfSplitter />
    </div>
  );
}
