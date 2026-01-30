"use client";

import { useState } from "react";

interface ConvertedFile {
  original: File;
  converted: Blob;
  newName: string;
  preview: string;
}

const SUPPORTED_EXTENSIONS = [
  { ext: "txt", label: "TXT", mime: "text/plain" },
  { ext: "html", label: "HTML", mime: "text/html" },
  { ext: "js", label: "JavaScript", mime: "text/javascript" },
  { ext: "ts", label: "TypeScript", mime: "text/typescript" },
  { ext: "jsx", label: "JSX", mime: "text/javascript" },
  { ext: "tsx", label: "TSX", mime: "text/typescript" },
  { ext: "css", label: "CSS", mime: "text/css" },
  { ext: "json", label: "JSON", mime: "application/json" },
  { ext: "md", label: "Markdown", mime: "text/markdown" },
  { ext: "xml", label: "XML", mime: "text/xml" },
  { ext: "svg", label: "SVG", mime: "image/svg+xml" },
];

export function FileExtensionConverter() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [targetExtension, setTargetExtension] = useState("txt");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await processFiles(selectedFiles);
    e.target.value = "";
  };

  const processFiles = async (inputFiles: File[]) => {
    if (inputFiles.length === 0) return;
    setIsProcessing(true);

    const results: ConvertedFile[] = [];

    for (const file of inputFiles) {
      const content = await file.text();
      const targetMime = SUPPORTED_EXTENSIONS.find(e => e.ext === targetExtension)?.mime || "text/plain";
      const blob = new Blob([content], { type: targetMime });

      const baseName = file.name.replace(/\.[^.]+$/, "");
      const newName = `${baseName}.${targetExtension}`;

      results.push({
        original: file,
        converted: blob,
        newName,
        preview: content.slice(0, 200) + (content.length > 200 ? "..." : ""),
      });
    }

    setFiles(prev => [...prev, ...results]);
    setIsProcessing(false);
  };

  const downloadFile = (file: ConvertedFile) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file.converted);
    link.download = file.newName;
    link.click();
  };

  const downloadAll = async () => {
    if (files.length === 1) {
      downloadFile(files[0]);
      return;
    }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.newName, file.converted);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "converted_files.zip";
    link.click();
  };

  const clearAll = () => {
    setFiles([]);
  };

  const getExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-xl font-semibold mb-2">ファイル拡張子変換</h2>
      <p className="text-sm text-neutral-400 mb-4">
        HTML / JS / TS / CSS などのテキストファイルの拡張子を変換
      </p>

      {/* Target Extension */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label className="text-sm text-neutral-400">変換先:</label>
        <div className="flex flex-wrap gap-1">
          {SUPPORTED_EXTENSIONS.map((ext) => (
            <button
              key={ext.ext}
              onClick={() => setTargetExtension(ext.ext)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                targetExtension === ext.ext
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              .{ext.ext}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById("ext-converter-input")?.click()}
      >
        <input
          id="ext-converter-input"
          type="file"
          multiple
          accept=".txt,.html,.htm,.js,.ts,.jsx,.tsx,.css,.json,.md,.xml,.svg"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-neutral-400">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>ドラッグ＆ドロップ または クリックして選択</p>
          <p className="text-xs mt-1">HTML, JS, TS, CSS, JSON, MD, XML, SVG, TXT</p>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-4 text-center text-blue-400">
          <div className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          変換中...
        </div>
      )}

      {/* Results */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">結果 ({files.length}件)</h3>
            <div className="flex gap-2">
              <button
                onClick={downloadAll}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              >
                {files.length === 1 ? "ダウンロード" : "すべてダウンロード (ZIP)"}
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
              >
                クリア
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="bg-neutral-800 rounded-lg p-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-700 rounded flex items-center justify-center text-xs font-mono">
                    .{getExtension(file.original.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {file.original.name} → <span className="text-blue-400">{file.newName}</span>
                    </p>
                    <p className="text-xs text-neutral-500 truncate mt-1 font-mono">
                      {file.preview}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadFile(file)}
                    className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors shrink-0"
                  >
                    保存
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-xs text-neutral-500">
        <p>※ ファイルの内容は変更されません。拡張子のみ変換されます。</p>
      </div>
    </div>
  );
}
