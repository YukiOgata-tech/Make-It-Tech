import { JsonToTable } from "../components/json-to-table";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "json",
  title: "無料JSON↔CSV/Excel変換ツール - 相互変換対応",
  description:
    "JSON、CSV、Excelファイルを相互変換できる無料オンラインツールです。JSONの表形式への変換や、CSV・ExcelからJSONへの書き出しに対応します。データはサーバーへ送信されず、ブラウザ内で処理されます。",
  keywords: [
    "JSON変換",
    "CSV変換",
    "Excel変換",
    "XLSX変換",
    "データ変換",
    "フォーマット変換",
    "オンライン変換",
    "無料",
  ],
});

export default function JsonPage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="json" />
      <JsonToTable />
    </div>
  );
}
