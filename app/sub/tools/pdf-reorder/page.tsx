import { PdfReorder } from "../components/pdf-reorder";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "pdf-reorder",
  title: "無料PDF並び替えツール - ページ順変更・削除",
  description:
    "PDFのページ順をドラッグ操作で並び替え、不要なページを削除して新しいPDFとして保存できる無料ツールです。ファイル処理はブラウザ上で完結し、資料提出前のページ整理に使えます。",
  keywords: ["PDF並び替え", "PDFページ順変更", "PDFページ削除", "無料", "ローカル処理"],
});

export default function PdfReorderPage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="pdf-reorder" />
      <PdfReorder />
    </div>
  );
}
