"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { MakeItTechLoader } from "./make-it-tech-loader";

type SplitMode = "ranges" | "each";
type SplitResult = {
  name: string;
  blob: Blob;
  url: string;
  pages: number;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const toArrayBuffer = (bytes: Uint8Array) => {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
};

const parseRanges = (input: string, pageCount: number) => {
  const chunks = input
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (!chunks.length) throw new Error("ページ範囲を入力してください。");

  return chunks.map((chunk) => {
    const match = chunk.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error("ページ範囲は 1-3,5,8-10 のように入力してください。");
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > pageCount) {
      throw new Error(`ページ範囲は 1〜${pageCount} の中で指定してください。`);
    }
    return Array.from({ length: end - start + 1 }, (_, index) => start + index - 1);
  });
};

export function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<SplitMode>("ranges");
  const [ranges, setRanges] = useState("1-1");
  const [isReading, setIsReading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [message, setMessage] = useState("");

  const clearResults = () => {
    results.forEach((result) => URL.revokeObjectURL(result.url));
    setResults([]);
  };

  const loadFile = async (nextFile: File) => {
    setIsReading(true);
    setMessage("");
    clearResults();
    try {
      const doc = await PDFDocument.load(await nextFile.arrayBuffer(), {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      const count = doc.getPageCount();
      setFile(nextFile);
      setPageCount(count);
      setRanges(count >= 3 ? "1-3" : "1-1");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDFの読み込みに失敗しました。");
    } finally {
      setIsReading(false);
    }
  };

  const addFiles = (inputFiles: File[]) => {
    const nextFile = inputFiles.find((item) => item.type === "application/pdf" || item.name.toLowerCase().endsWith(".pdf"));
    if (nextFile) void loadFile(nextFile);
  };

  const split = async () => {
    if (!file || !pageCount) return;
    setIsProcessing(true);
    setMessage("");
    clearResults();

    try {
      const source = await PDFDocument.load(await file.arrayBuffer(), {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      const groups =
        mode === "each"
          ? Array.from({ length: pageCount }, (_, index) => [index])
          : parseRanges(ranges, pageCount);
      const baseName = file.name.replace(/\.pdf$/i, "");
      const nextResults: SplitResult[] = [];

      for (const [groupIndex, group] of groups.entries()) {
        const output = await PDFDocument.create();
        const copiedPages = await output.copyPages(source, group);
        copiedPages.forEach((page) => output.addPage(page));
        output.setProducer("Make It Tech DevTools");
        output.setCreator("Make It Tech DevTools");
        const bytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
        const blob = new Blob([toArrayBuffer(bytes)], { type: "application/pdf" });
        const label =
          mode === "each"
            ? `page_${String(group[0] + 1).padStart(3, "0")}`
            : `range_${group[0] + 1}-${group[group.length - 1] + 1}`;
        nextResults.push({
          name: `${baseName}_${label}_${groupIndex + 1}.pdf`,
          blob,
          url: URL.createObjectURL(blob),
          pages: group.length,
        });
      }

      setResults(nextResults);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDFの分割に失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = (result: SplitResult) => {
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.name;
    link.click();
  };

  const downloadAll = async () => {
    if (results.length === 1) {
      download(results[0]);
      return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    results.forEach((result) => zip.file(result.name, result.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "split_pdfs.zip";
    link.click();
  };

  return (
    <div className="tools-panel">
      <h2 className="mb-2 text-xl font-semibold sm:text-xl">PDF分割</h2>
      <p className="mb-4 text-sm text-neutral-400">
        PDFをページごと、または指定範囲ごとに分割して出力します。
      </p>

      <div
        onDrop={(event) => {
          event.preventDefault();
          addFiles(Array.from(event.dataTransfer.files));
        }}
        onDragOver={(event) => event.preventDefault()}
        className="tools-dropzone"
        onClick={() => document.getElementById("pdf-split-input")?.click()}
      >
        <input
          id="pdf-split-input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => {
            addFiles(Array.from(event.target.files || []));
            event.target.value = "";
          }}
          className="hidden"
        />
        <div className="text-neutral-400">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 text-lg">
            PDF
          </div>
          <p>PDFを選択</p>
          <p className="mt-1 text-xs">範囲指定またはページ単位で分割</p>
        </div>
      </div>

      {isReading ? (
        <div className="mt-4 flex justify-center text-blue-300">
          <MakeItTechLoader label="PDF読み込み中..." />
        </div>
      ) : null}

      {file ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-lg bg-neutral-800 p-3">
            <p className="truncate text-sm">{file.name}</p>
            <p className="text-xs text-neutral-500">{pageCount}ページ / {formatSize(file.size)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("ranges")}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${mode === "ranges" ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
            >
              範囲指定
            </button>
            <button
              type="button"
              onClick={() => setMode("each")}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${mode === "each" ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
            >
              1ページずつ
            </button>
          </div>
          {mode === "ranges" ? (
            <div className="rounded-lg bg-neutral-800/50 p-4">
              <label className="mb-2 block text-sm text-neutral-400">分割範囲</label>
              <input
                value={ranges}
                onChange={(event) => setRanges(event.target.value)}
                placeholder="例: 1-3,4-6,9"
                className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-neutral-500">カンマ区切りで複数PDFを作成します。</p>
            </div>
          ) : null}
          <button className="tools-primary-button" onClick={split} disabled={isProcessing}>
            {isProcessing ? <MakeItTechLoader label="PDF分割中..." compact /> : "PDFを分割"}
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}

      {results.length > 0 ? (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">分割結果 ({results.length}件)</h3>
            <button onClick={downloadAll} className="tools-secondary-button bg-blue-600 hover:bg-blue-700">
              {results.length === 1 ? "ダウンロード" : "すべてダウンロード (ZIP)"}
            </button>
          </div>
          <div className="space-y-2">
            {results.map((result) => (
              <div key={result.url} className="flex items-center gap-3 rounded-lg bg-neutral-800 p-3">
                <div className="rounded bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300">PDF</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{result.name}</p>
                  <p className="text-xs text-neutral-500">{result.pages}ページ / {formatSize(result.blob.size)}</p>
                </div>
                <button onClick={() => download(result)} className="tools-secondary-button shrink-0">
                  保存
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
