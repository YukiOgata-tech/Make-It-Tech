import { FileExtensionConverter } from "../components/file-extension-converter";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "extension",
  title: "無料拡張子変換ツール - HTML/JS/TS/CSSファイル",
  description:
    "HTML、JavaScript、TypeScript、CSS、JSON、Markdownなど、テキストファイルの拡張子を無料で変更できるオンラインツールです。複数ファイルの一括変換に対応し、内容をサーバーへ送信せずブラウザ内で処理します。",
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
