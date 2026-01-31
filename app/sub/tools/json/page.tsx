import type { Metadata } from "next";
import { JsonToTable } from "../components/json-to-table";

export const metadata: Metadata = {
  title: "無料JSON↔CSV/Excel変換ツール - 相互変換対応",
  description:
    "JSONをCSV/Excelに変換、またはCSV/ExcelからJSONに変換。双方向変換対応。ブラウザ上で完結、サーバー送信なし。データ変換・分析に最適。",
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
};

export default function JsonPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <JsonToTable />
    </div>
  );
}
