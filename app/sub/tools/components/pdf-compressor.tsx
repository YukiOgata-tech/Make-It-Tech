"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { MakeItTechLoader } from "./make-it-tech-loader";

type CompressionMode = "standard" | "scan";

type CompressedPdf = {
  originalName: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  blob: Blob;
};

const formatSize = (bytes: number) => {
  if (bytes < 1000) return `${bytes} B`;
  const kilobytes = Math.round(bytes / 1000).toLocaleString("ja-JP");
  if (bytes < 10 * 1000 * 1000) return `${kilobytes} KB`;
  return `${(bytes / (1000 * 1000)).toFixed(2)} MB (${kilobytes} KB)`;
};

const toArrayBuffer = (bytes: Uint8Array) => {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
};

export function PdfCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<CompressionMode>("standard");
  const [scanScale, setScanScale] = useState(1.5);
  const [jpegQuality, setJpegQuality] = useState(0.68);
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
        const compressedBytes = mode === "scan"
          ? await compressScannedPdf(file, scanScale, jpegQuality)
          : await optimizePdfStructure(file);
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

  const optimizePdfStructure = async (file: File) => {
    const bytes = await file.arrayBuffer();
    const source = await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    const outputDoc = await PDFDocument.create();
    const pages = await outputDoc.copyPages(source, source.getPageIndices());
    pages.forEach((page) => outputDoc.addPage(page));

    outputDoc.setProducer("Make It Tech DevTools");
    outputDoc.setCreator("Make It Tech DevTools");
    outputDoc.setModificationDate(new Date());

    return outputDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
  };

  const compressScannedPdf = async (file: File, scale: number, quality: number) => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url
    ).toString();

    const data = await file.arrayBuffer();
    const source = await pdfjsLib.getDocument({ data }).promise;
    const outputDoc = await PDFDocument.create();

    for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
      const sourcePage = await source.getPage(pageNumber);
      const pageSize = sourcePage.getViewport({ scale: 1 });
      const renderViewport = sourcePage.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("PDFページの描画に失敗しました。");

      canvas.width = Math.floor(renderViewport.width);
      canvas.height = Math.floor(renderViewport.height);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await sourcePage.render({ canvas, canvasContext: ctx, viewport: renderViewport }).promise;

      const jpegBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((nextBlob) => {
          if (nextBlob) resolve(nextBlob);
          else reject(new Error("PDFページのJPEG化に失敗しました。"));
        }, "image/jpeg", quality);
      });

      const embeddedImage = await outputDoc.embedJpg(await jpegBlob.arrayBuffer());
      const outputPage = outputDoc.addPage([pageSize.width, pageSize.height]);
      outputPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: pageSize.width,
        height: pageSize.height,
      });

      canvas.width = 1;
      canvas.height = 1;
    }

    outputDoc.setProducer("Make It Tech DevTools");
    outputDoc.setCreator("Make It Tech DevTools");
    outputDoc.setModificationDate(new Date());

    return outputDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 25,
    });
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
        PDFをブラウザ内で軽量化します。スキャンPDFは画像として再圧縮できます。内容はサーバーに送信されません。
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
                onClick={() => setMode("standard")}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  mode === "standard" ? "border-blue-500 bg-blue-600/20" : "border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
                }`}
              >
                <span className="font-medium">通常圧縮</span>
                <span className="mt-1 block text-xs text-neutral-400">ページを新規PDFへコピーして余分な情報を削ります。</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("scan")}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  mode === "scan" ? "border-blue-500 bg-blue-600/20" : "border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
                }`}
              >
                <span className="font-medium">スキャンPDF向け</span>
                <span className="mt-1 block text-xs text-neutral-400">ページを画像化し、JPEG品質を落として軽量化します。</span>
              </button>
            </div>
          </div>

          {mode === "scan" ? (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-100">スキャンPDF向け設定</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-100/70">
                容量は大きく下がりやすい一方、テキスト選択・検索・リンクは失われます。書類の控えや共有用の軽量版に向いています。
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-neutral-300">解像度: {scanScale}x</span>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.25"
                    value={scanScale}
                    onChange={(event) => setScanScale(Number(event.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <span className="mt-1 block text-xs text-neutral-500">低いほど軽量、高いほど文字が読みやすくなります。</span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-neutral-300">JPEG品質: {Math.round(jpegQuality * 100)}%</span>
                  <input
                    type="range"
                    min="0.45"
                    max="0.9"
                    step="0.05"
                    value={jpegQuality}
                    onChange={(event) => setJpegQuality(Number(event.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <span className="mt-1 block text-xs text-neutral-500">低いほど軽量、写真や細かい文字は粗くなります。</span>
                </label>
              </div>
            </div>
          ) : null}

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
