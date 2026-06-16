import { PdfMerger } from "../components/pdf-merger";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "pdf-merge",
  title: "無料PDF合成ツール - 順番指定対応",
  description:
    "複数のPDFを順番指定して1つのPDFに合成。先頭ページにしたいPDFの並び替えもブラウザ上で無料で行えます。",
  keywords: ["PDF合成", "PDF結合", "PDFマージ", "PDF順番変更", "無料", "ローカル処理"],
});

export default function PdfMergePage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="pdf-merge" />
      <PdfMerger />
    </div>
  );
}
