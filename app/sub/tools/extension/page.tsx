import type { Metadata } from "next";
import { FileExtensionConverter } from "../components/file-extension-converter";

export const metadata: Metadata = {
  title: "無料拡張子変換ツール - HTML/JS/TS/CSSファイル",
  description:
    "HTML、JavaScript、TypeScript、CSSなどテキストファイルの拡張子を変換。ブラウザ上で完結、サーバー送信なし。複数ファイル一括変換対応。",
  keywords: [
    "拡張子変換",
    "ファイル変換",
    "HTML",
    "JavaScript",
    "TypeScript",
    "CSS",
    "ファイル形式",
    "無料",
  ],
};

export default function ExtensionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <FileExtensionConverter />
    </div>
  );
}
