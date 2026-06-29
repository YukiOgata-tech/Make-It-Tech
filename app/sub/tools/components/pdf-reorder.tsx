"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { MakeItTechLoader } from "./make-it-tech-loader";
import { trackToolEvent } from "../_lib/analytics";

type PageItem = {
  id: string;
  originalIndex: number;
  label: string;
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

export function PdfReorder() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [message, setMessage] = useState("");

  const loadFile = async (nextFile: File) => {
    setIsReading(true);
    setMessage("");
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl("");
    try {
      const doc = await PDFDocument.load(await nextFile.arrayBuffer(), {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      setFile(nextFile);
      setPages(
        Array.from({ length: doc.getPageCount() }, (_, index) => ({
          id: `${index}-${crypto.randomUUID()}`,
          originalIndex: index,
          label: `Page ${index + 1}`,
        }))
      );
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

  const movePage = (index: number, direction: -1 | 1) => {
    setPages((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const updated = [...prev];
      const [page] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, page);
      return updated;
    });
  };

  const moveToTop = (index: number) => {
    setPages((prev) => {
      if (index <= 0) return prev;
      const updated = [...prev];
      const [page] = updated.splice(index, 1);
      updated.unshift(page);
      return updated;
    });
  };

  const moveToBottom = (index: number) => {
    setPages((prev) => {
      if (index >= prev.length - 1) return prev;
      const updated = [...prev];
      const [page] = updated.splice(index, 1);
      updated.push(page);
      return updated;
    });
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id));
  };

  const reorder = async () => {
    if (!file || !pages.length) return;
    trackToolEvent("tool_run", {
      toolId: "pdf-reorder",
      toolName: "PDF並び替え",
      action: "reorder",
      fileCount: 1,
      inputBytes: file.size,
    });
    setIsProcessing(true);
    setMessage("");
    try {
      const source = await PDFDocument.load(await file.arrayBuffer(), {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      const output = await PDFDocument.create();
      const copiedPages = await output.copyPages(
        source,
        pages.map((page) => page.originalIndex)
      );
      copiedPages.forEach((page) => output.addPage(page));
      output.setProducer("Make It Tech DevTools");
      output.setCreator("Make It Tech DevTools");
      output.setModificationDate(new Date());
      const bytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([toArrayBuffer(bytes)], { type: "application/pdf" });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      trackToolEvent("tool_success", {
        toolId: "pdf-reorder",
        toolName: "PDF並び替え",
        action: "reorder",
        fileCount: 1,
        inputBytes: file.size,
        outputBytes: blob.size,
      });
    } catch (error) {
      trackToolEvent("tool_error", {
        toolId: "pdf-reorder",
        toolName: "PDF並び替え",
        action: "reorder",
        fileCount: 1,
      });
      setMessage(error instanceof Error ? error.message : "PDFの並び替えに失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = file ? `reordered_${file.name}` : "reordered.pdf";
    link.click();
    trackToolEvent("tool_download", {
      toolId: "pdf-reorder",
      toolName: "PDF並び替え",
      action: "download",
      fileCount: 1,
      outputBytes: outputSize,
    });
  };

  return (
    <div className="tools-panel">
      <h2 className="mb-2 text-xl font-semibold sm:text-xl">PDF並び替え</h2>
      <p className="mb-4 text-sm text-neutral-400">
        PDF内のページ順を入れ替え、不要なページを削除して新しいPDFとして保存します。
      </p>

      <div
        onDrop={(event) => {
          event.preventDefault();
          addFiles(Array.from(event.dataTransfer.files));
        }}
        onDragOver={(event) => event.preventDefault()}
        className="tools-dropzone"
        onClick={() => document.getElementById("pdf-reorder-input")?.click()}
      >
        <input
          id="pdf-reorder-input"
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
          <p className="mt-1 text-xs">ページ順を変更して出力します</p>
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
            <p className="text-xs text-neutral-500">{pages.length}ページ / {formatSize(file.size)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="tools-secondary-button" onClick={() => setPages((prev) => [...prev].reverse())}>
              逆順
            </button>
            <button
              className="tools-secondary-button"
              onClick={() =>
                setPages((prev) => [...prev].sort((a, b) => a.originalIndex - b.originalIndex))
              }
            >
              元に戻す
            </button>
          </div>
          <div className="space-y-2">
            {pages.map((page, index) => (
              <div key={page.id} className="rounded-lg bg-neutral-800 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-600 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{page.label}</p>
                    <p className="text-xs text-neutral-500">元のページ: {page.originalIndex + 1}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2 text-xs sm:flex">
                  <button className="tools-secondary-button" onClick={() => moveToTop(index)} disabled={index === 0}>
                    先頭
                  </button>
                  <button className="tools-secondary-button" onClick={() => movePage(index, -1)} disabled={index === 0}>
                    上へ
                  </button>
                  <button className="tools-secondary-button" onClick={() => movePage(index, 1)} disabled={index === pages.length - 1}>
                    下へ
                  </button>
                  <button className="tools-secondary-button" onClick={() => moveToBottom(index)} disabled={index === pages.length - 1}>
                    末尾
                  </button>
                  <button className="tools-secondary-button" onClick={() => removePage(page.id)}>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="tools-primary-button" onClick={reorder} disabled={isProcessing || !pages.length}>
            {isProcessing ? <MakeItTechLoader label="PDF作成中..." compact /> : "この順番でPDFを作成"}
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}

      {outputUrl ? (
        <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-green-200">並び替えPDFを作成しました</h3>
              <p className="mt-1 text-xs text-green-100/70">{formatSize(outputSize)}</p>
            </div>
            <button onClick={download} className="tools-secondary-button bg-blue-600 hover:bg-blue-700">
              ダウンロード
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
