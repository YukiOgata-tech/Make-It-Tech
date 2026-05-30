"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { MakeItTechLoader } from "./make-it-tech-loader";

type PdfItem = {
  id: string;
  file: File;
  pageCount: number;
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

export function PdfMerger() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [message, setMessage] = useState("");

  const addFiles = async (inputFiles: File[]) => {
    const pdfFiles = inputFiles.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (!pdfFiles.length) return;

    setIsReading(true);
    setMessage("");
    try {
      const nextItems: PdfItem[] = [];
      for (const file of pdfFiles) {
        const doc = await PDFDocument.load(await file.arrayBuffer(), {
          ignoreEncryption: true,
          updateMetadata: false,
        });
        nextItems.push({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          pageCount: doc.getPageCount(),
        });
      }
      setItems((prev) => [...prev, ...nextItems]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDFの読み込みに失敗しました。");
    } finally {
      setIsReading(false);
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, item);
      return updated;
    });
  };

  const moveToTop = (index: number) => {
    setItems((prev) => {
      if (index <= 0) return prev;
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.unshift(item);
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const merge = async () => {
    if (items.length < 2) {
      setMessage("PDFを2件以上選択してください。");
      return;
    }

    setIsProcessing(true);
    setMessage("");
    try {
      const merged = await PDFDocument.create();
      for (const item of items) {
        const source = await PDFDocument.load(await item.file.arrayBuffer(), {
          ignoreEncryption: true,
          updateMetadata: false,
        });
        const pages = await merged.copyPages(source, source.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }

      merged.setProducer("Make It Tech DevTools");
      merged.setCreator("Make It Tech DevTools");
      merged.setModificationDate(new Date());

      const bytes = await merged.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });
      const blob = new Blob([toArrayBuffer(bytes)], { type: "application/pdf" });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDFの合成に失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = "merged.pdf";
    link.click();
  };

  return (
    <div className="tools-panel">
      <h2 className="mb-2 text-xl font-semibold sm:text-xl">PDF合成</h2>
      <p className="mb-4 text-sm text-neutral-400">
        複数のPDFを指定した順番で1つのPDFに結合します。先頭にしたいPDFは「先頭へ」で並び替えできます。
      </p>

      <div
        onDrop={(event) => {
          event.preventDefault();
          void addFiles(Array.from(event.dataTransfer.files));
        }}
        onDragOver={(event) => event.preventDefault()}
        className="tools-dropzone"
        onClick={() => document.getElementById("pdf-merge-input")?.click()}
      >
        <input
          id="pdf-merge-input"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={(event) => {
            void addFiles(Array.from(event.target.files || []));
            event.target.value = "";
          }}
          className="hidden"
        />
        <div className="text-neutral-400">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 text-lg">
            PDF
          </div>
          <p>ドラッグ＆ドロップ または クリックして選択</p>
          <p className="mt-1 text-xs">上から順に結合されます</p>
        </div>
      </div>

      {isReading ? (
        <div className="mt-4 flex justify-center text-blue-300">
          <MakeItTechLoader label="PDF読み込み中..." />
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">結合順 ({items.length}件)</h3>
            <button className="text-xs text-neutral-400 hover:text-white" onClick={() => setItems([])}>
              すべて削除
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-lg bg-neutral-800 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-600 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.file.name}</p>
                    <p className="text-xs text-neutral-500">
                      {item.pageCount}ページ / {formatSize(item.file.size)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs sm:flex">
                  <button className="tools-secondary-button" onClick={() => moveToTop(index)} disabled={index === 0}>
                    先頭へ
                  </button>
                  <button className="tools-secondary-button" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                    上へ
                  </button>
                  <button className="tools-secondary-button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}>
                    下へ
                  </button>
                  <button className="tools-secondary-button" onClick={() => removeItem(item.id)}>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={merge}
            disabled={isProcessing || items.length < 2}
            className="tools-primary-button"
          >
            {isProcessing ? <MakeItTechLoader label="PDF合成中..." compact /> : "この順番でPDFを合成"}
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}

      {outputUrl ? (
        <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-green-200">合成PDFを作成しました</h3>
              <p className="mt-1 text-xs text-green-100/70">{items.reduce((total, item) => total + item.pageCount, 0)}ページ / {formatSize(outputSize)}</p>
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
