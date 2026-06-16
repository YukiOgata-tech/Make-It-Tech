import { MarkdownPreview } from "../components/markdown-preview";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "markdown",
  title: "無料Markdownプレビュー - GFM対応リアルタイムプレビュー",
  description:
    "Markdownをリアルタイムでプレビュー。GitHub Flavored Markdown (GFM) 対応。テーブル、コードブロック、タスクリスト対応。ブラウザ上で完結。",
  keywords: [
    "Markdown",
    "Markdownプレビュー",
    "GFM",
    "GitHub Markdown",
    "リアルタイムプレビュー",
    "オンラインエディタ",
    "無料",
  ],
});

export default function MarkdownPage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="markdown" />
      <MarkdownPreview />
    </div>
  );
}
