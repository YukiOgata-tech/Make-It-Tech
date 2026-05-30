import type { Metadata } from "next";
import { MarkdownPreview } from "../components/markdown-preview";
import { toolsBaseUrl } from "../_data/tools";

export const metadata: Metadata = {
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
  alternates: {
    canonical: `${toolsBaseUrl}/markdown`,
  },
};

export default function MarkdownPage() {
  return (
    <div className="tools-page-container">
      <MarkdownPreview />
    </div>
  );
}
