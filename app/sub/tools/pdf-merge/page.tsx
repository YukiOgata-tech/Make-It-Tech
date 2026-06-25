import { PdfMerger } from "../components/pdf-merger";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "pdf-merge",
  title: "無料PDF合成ツール - 順番指定対応",
  description:
    "複数のPDFを好きな順番に並べ、1つのPDFへ無料で結合できるオンラインツールです。請求書、申請書、分割された資料などをドラッグ操作で整理してまとめられます。処理はブラウザ内で完結し、ファイルはサーバーへ送信されません。",
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
