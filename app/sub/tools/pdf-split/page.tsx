import type { Metadata } from "next";
import { PdfSplitter } from "../components/pdf-splitter";

export const metadata: Metadata = {
  title: "無料PDF分割ツール - ページ範囲指定対応",
  description:
    "PDFをページごと、または指定範囲ごとに分割して保存。ブラウザ上で完結し、ファイルはサーバーに送信されません。",
  keywords: ["PDF分割", "PDFページ抽出", "PDF範囲指定", "無料", "ローカル処理"],
};

export default function PdfSplitPage() {
  return (
    <div className="tools-page-container">
      <PdfSplitter />
    </div>
  );
}
