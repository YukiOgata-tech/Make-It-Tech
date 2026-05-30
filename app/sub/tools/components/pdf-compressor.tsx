"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { MakeItTechLoader } from "./make-it-tech-loader";

type CompressionMode = "safe" | "strong";

type CompressedPdf = {
  originalName: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  blob: Blob;
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

export function PdfCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<CompressionMode>("safe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<CompressedPdf[]>([]);
  const [message, setMessage] = useState("");

  const addFiles = (inputFiles: File[]) => {
    const pdfFiles = inputFiles.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    setFiles((prev) => [...prev, ...pdfFiles]);
    setMessage("");
  };

  const processFiles = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setMessage("");

    try {
      const compressedResults: CompressedPdf[] = [];

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const source = await PDFDocument.load(bytes, {
          ignoreEncryption: true,
          updateMetadata: false,
        });

        let outputDoc = source;
        if (mode === "strong") {
          outputDoc = await PDFDocument.create();
          const pages = await outputDoc.copyPages(source, source.getPageIndices());
          pages.forEach((page) => outputDoc.addPage(page));
        }

        outputDoc.setProducer("Make It Tech DevTools");
        outputDoc.setCreator("Make It Tech DevTools");
        outputDoc.setModificationDate(new Date());

        const compressedBytes = await outputDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 50,
        });
        const blob = new Blob([toArrayBuffer(compressedBytes)], { type: "application/pdf" });

        compressedResults.push({
          originalName: file.name,
          originalSize: file.size,
          compressedSize: blob.size,
          blob,
          url: URL.createObjectURL(blob),
        });
      }

      results.forEach((result) => URL.revokeObjectURL(result.url));
      setResults(compressedResults);
      setFiles([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDFの圧縮に失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = (result: CompressedPdf) => {
    const link = document.createElement("a");
    link.href = result.url;
    link.download = `compressed_${result.originalName}`;
    link.click();
  };

  const downloadAll = async () => {
    if (results.length === 1) {
      download(results[0]);
      return;
    }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    results.forEach((result, index) => {
      zip.file(`${index + 1}_compressed_${result.originalName}`, result.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "compressed_pdfs.zip";
    link.click();
  };

  return (
    <div className="tools-panel">
      <h2 className="mb-2 text-xl font-semibold sm:text-xl">PDF圧縮</h2>
      <p className="mb-4 text-sm text-neutral-400">
        PDFをブラウザ内で再保存して軽量化します。内容はサーバーに送信されません。
      </p>

      <div
        onDrop={(event) => {
          event.preventDefault();
          addFiles(Array.from(event.dataTransfer.files));
        }}
        onDragOver={(event) => event.preventDefault()}
        className="tools-dropzone"
        onClick={() => document.getElementById("pdf-compress-input")?.click()}
      >
        <input
          id="pdf-compress-input"
          type="file"
          accept="application/pdf,.pdf"
          multiple
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
          <p>ドラッグ＆ドロップ または クリックして選択</p>
          <p className="mt-1 text-xs">複数ファイル対応</p>
        </div>
      </div>

      {files.length > 0 ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">選択中のPDF ({files.length}件)</h3>
            <button className="text-xs text-neutral-400 hover:text-white" onClick={() => setFiles([])}>
              すべて削除
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-lg bg-neutral-800 p-3 text-sm">
                <div className="rounded bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300">PDF</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{file.name}</p>
                  <p className="text-xs text-neutral-500">{formatSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="mb-2 text-sm text-neutral-400">圧縮モード</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("safe")}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  mode === "safe" ? "border-blue-500 bg-blue-600/20" : "border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
                }`}
              >
                <span className="font-medium">安全</span>
                <span className="mt-1 block text-xs text-neutral-400">ページ構造を保ったまま再保存します。</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("strong")}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  mode === "strong" ? "border-blue-500 bg-blue-600/20" : "border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
                }`}
              >
                <span className="font-medium">できる限り圧縮</span>
                <span className="mt-1 block text-xs text-neutral-400">ページを新規PDFへコピーして余分な情報を削ります。</span>
              </button>
            </div>
          </div>

          <button
            onClick={processFiles}
            disabled={isProcessing}
            className="tools-primary-button"
          >
            {isProcessing ? <MakeItTechLoader label="PDF圧縮中..." compact /> : "PDFを圧縮"}
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}

      {results.length > 0 ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-medium">結果 ({results.length}件)</h3>
            <button onClick={downloadAll} className="tools-secondary-button bg-blue-600 hover:bg-blue-700">
              {results.length === 1 ? "ダウンロード" : "すべてダウンロード (ZIP)"}
            </button>
          </div>
          <div className="space-y-2">
            {results.map((result, index) => {
              const reduction = Math.round((1 - result.compressedSize / result.originalSize) * 100);
              return (
                <div key={`${result.originalName}-${index}`} className="flex items-center gap-3 rounded-lg bg-neutral-800 p-3">
                  <div className="rounded bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300">PDF</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{result.originalName}</p>
                    <p className="text-xs text-neutral-400">
                      {formatSize(result.originalSize)} → {formatSize(result.compressedSize)}
                      <span className={`ml-2 ${reduction > 0 ? "text-green-400" : "text-yellow-400"}`}>
                        {reduction > 0 ? `-${reduction}%` : "サイズ維持"}
                      </span>
                    </p>
                  </div>
                  <button onClick={() => download(result)} className="tools-secondary-button shrink-0">
                    保存
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
