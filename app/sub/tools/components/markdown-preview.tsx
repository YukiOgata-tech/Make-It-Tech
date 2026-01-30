"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SAMPLE_MARKDOWN = `# Markdownプレビュー

## 見出し2

### 見出し3

**太字** と *斜体* と ~~取り消し線~~

- リスト1
- リスト2
  - ネストしたリスト

1. 番号付きリスト
2. 番号付きリスト

> 引用文

\`インラインコード\`

\`\`\`javascript
const hello = "Hello, World!";
console.log(hello);
\`\`\`

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |

[リンク](https://example.com)

---

タスクリスト:
- [x] 完了したタスク
- [ ] 未完了のタスク
`;

export function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMarkdown(reader.result as string);
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.type === "text/markdown" || file.type === "text/plain")) {
      const reader = new FileReader();
      reader.onload = () => {
        setMarkdown(reader.result as string);
      };
      reader.readAsText(file);
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.md";
    link.click();
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(markdown);
  };

  const clearContent = () => {
    setMarkdown("");
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Markdown プレビュー</h2>
          <p className="text-sm text-neutral-400">
            Markdownをリアルタイムでプレビュー（GFM対応）
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-neutral-800 rounded p-1">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                viewMode === "edit" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              編集
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                viewMode === "split" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              分割
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                viewMode === "preview" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              プレビュー
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <label className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm cursor-pointer transition-colors">
          ファイルを開く
          <input
            type="file"
            accept=".md,.markdown,text/markdown,text/plain"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
        <button
          onClick={downloadMarkdown}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
        >
          保存
        </button>
        <button
          onClick={copyToClipboard}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
        >
          コピー
        </button>
        <button
          onClick={clearContent}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
        >
          クリア
        </button>
      </div>

      {/* Editor and Preview */}
      <div className={`grid gap-4 ${viewMode === "split" ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* Editor */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div className="flex flex-col">
            <div className="text-xs text-neutral-500 mb-1">Markdown</div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              placeholder="Markdownを入力またはファイルをドロップ..."
              className="flex-1 min-h-[500px] bg-neutral-800 border border-neutral-700 rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="flex flex-col">
            <div className="text-xs text-neutral-500 mb-1">プレビュー</div>
            <div className="flex-1 min-h-[500px] bg-neutral-800 border border-neutral-700 rounded-lg p-4 overflow-auto prose prose-invert prose-sm max-w-none
              prose-headings:border-b prose-headings:border-neutral-700 prose-headings:pb-2
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-a:text-blue-400
              prose-code:bg-neutral-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-700
              prose-blockquote:border-l-blue-500 prose-blockquote:bg-neutral-800/50 prose-blockquote:py-1
              prose-table:border prose-table:border-neutral-700
              prose-th:bg-neutral-800 prose-th:p-2 prose-th:border prose-th:border-neutral-700
              prose-td:p-2 prose-td:border prose-td:border-neutral-700
              prose-hr:border-neutral-700
              prose-img:rounded-lg
              prose-li:marker:text-neutral-500
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown || "*プレビューするコンテンツがありません*"}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 text-xs text-neutral-500 flex gap-4">
        <span>{markdown.length} 文字</span>
        <span>{markdown.split(/\n/).length} 行</span>
        <span>{markdown.split(/\s+/).filter(Boolean).length} 単語</span>
      </div>
    </div>
  );
}
