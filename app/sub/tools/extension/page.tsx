import { FileExtensionConverter } from "../components/file-extension-converter";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "extension",
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
});

export default function ExtensionPage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="extension" />
      <FileExtensionConverter />
    </div>
  );
}
