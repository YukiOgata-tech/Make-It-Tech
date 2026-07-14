"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { MakeItTechLoader } from "./make-it-tech-loader";
import { trackToolEvent } from "../_lib/analytics";

type CompressionMode = "standard" | "compat";
type CompatQuality = "readable" | "balanced" | "compact";

type CompressedPdf = {
  originalName: string;
  originalSize: number;
  compressedSize: number;
  mode: CompressionMode;
  compatQuality?: CompatQuality;
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

const PDF_RASTER_PROFILES: Record<CompatQuality, { label: string; scale: number; jpegQuality: number }> = {
  readable: { label: "高品質", scale: 2.25, jpegQuality: 0.9 },
  balanced: { label: "標準", scale: 1.8, jpegQuality: 0.84 },
  compact: { label: "軽量", scale: 1.5, jpegQuality: 0.78 },
};

export function PdfCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<CompressionMode>("standard");
  const [compatQuality, setCompatQuality] = useState<CompatQuality>("readable");
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
    const inputBytes = files.reduce((sum, file) => sum + file.size, 0);
    const action = mode === "compat" ? `compat_${compatQuality}` : "standard";
    trackToolEvent("tool_run", {
      toolId: "pdf-compress",
      toolName: "PDF圧縮",
      action,
      fileCount: files.length,
      inputBytes,
    });
    setIsProcessing(true);
    setMessage("");

    try {
      const compressedResults: CompressedPdf[] = [];

      for (const file of files) {
        const compressedBytes = await compressPdf(file, mode, compatQuality);
        const blob = new Blob([toArrayBuffer(compressedBytes)], { type: "application/pdf" });

        compressedResults.push({
          originalName: file.name,
          originalSize: file.size,
          compressedSize: blob.size,
          mode,
          compatQuality: mode === "compat" ? compatQuality : undefined,
          blob,
          url: URL.createObjectURL(blob),
        });
      }

      results.forEach((result) => URL.revokeObjectURL(result.url));
      setResults(compressedResults);
      const outputBytes = compressedResults.reduce((sum, result) => sum + result.compressedSize, 0);
      trackToolEvent("tool_success", {
        toolId: "pdf-compress",
        toolName: "PDF圧縮",
        action,
        fileCount: compressedResults.length,
        inputBytes,
        outputBytes,
        reductionPercent: inputBytes > 0 ? (1 - outputBytes / inputBytes) * 100 : undefined,
      });
      setFiles([]);
    } catch (error) {
      trackToolEvent("tool_error", {
        toolId: "pdf-compress",
        toolName: "PDF圧縮",
        action,
        fileCount: files.length,
      });
      const errorMessage = error instanceof Error ? error.message : "";
      setMessage(
        mode === "standard"
          ? errorMessage || "PDFの通常圧縮に失敗しました。互換モードを試してください。"
          : errorMessage || "PDFの互換モード圧縮に失敗しました。"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const compressPdf = async (file: File, compressionMode: CompressionMode, quality: CompatQuality) => {
    const bytes = await file.arrayBuffer();
    if (compressionMode === "compat") {
      return rasterizePdf(bytes, PDF_RASTER_PROFILES[quality]);
    }

    const originalBytes = new Uint8Array(bytes);
    const optimized = await optimizePdfStructure(bytes).catch(() => null);
    if (!optimized) {
      return originalBytes;
    }

    return optimized.byteLength < originalBytes.byteLength ? optimized : originalBytes;
  };

  const optimizePdfStructure = async (bytes: ArrayBuffer) => {
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

  const rasterizePdf = async (bytes: ArrayBuffer, profile: { scale: number; jpegQuality: number }) => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url
    ).toString();

    const source = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    const outputDoc = await PDFDocument.create();

    try {
      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
        const sourcePage = await source.getPage(pageNumber);
        const pageSize = sourcePage.getViewport({ scale: 1 });
        const renderViewport = sourcePage.getViewport({ scale: profile.scale });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("PDFページの描画に失敗しました。");

        canvas.width = Math.max(1, Math.floor(renderViewport.width));
        canvas.height = Math.max(1, Math.floor(renderViewport.height));
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await sourcePage.render({ canvas, canvasContext: ctx, viewport: renderViewport }).promise;

        const jpegBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((nextBlob) => {
            if (nextBlob) resolve(nextBlob);
            else reject(new Error("PDFページのJPEG化に失敗しました。"));
          }, "image/jpeg", profile.jpegQuality);
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
    } finally {
      await source.destroy();
    }
  };

  const download = (result: CompressedPdf) => {
    const link = document.createElement("a");
    link.href = result.url;
    link.download = `compressed_${result.originalName}`;
    link.click();
    trackToolEvent("tool_download", {
      toolId: "pdf-compress",
      toolName: "PDF圧縮",
      action: "download_single",
      fileCount: 1,
      outputBytes: result.compressedSize,
    });
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
    trackToolEvent("tool_download", {
      toolId: "pdf-compress",
      toolName: "PDF圧縮",
      action: "download_all",
      fileCount: results.length,
      outputBytes: results.reduce((sum, result) => sum + result.compressedSize, 0),
    });
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

          <div className="space-y-3 rounded-lg bg-neutral-800/50 p-4">
            <p className="text-sm font-medium text-neutral-200">圧縮方式</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("standard")}
                className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                  mode === "standard"
                    ? "border-blue-500 bg-blue-600/20 text-white"
                    : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500"
                }`}
              >
                <span className="block text-sm font-semibold">通常モード</span>
                <span className="mt-1 block text-xs leading-relaxed text-neutral-400">
                  画質とテキスト選択を維持して、PDF構造だけを軽量化します。
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMode("compat")}
                className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                  mode === "compat"
                    ? "border-amber-400 bg-amber-500/15 text-white"
                    : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500"
                }`}
              >
                <span className="block text-sm font-semibold">互換モード</span>
                <span className="mt-1 block text-xs leading-relaxed text-neutral-400">
                  ページを画像化して再PDF化します。スキャンPDFや構造を読みにくいPDF向けです。
                </span>
              </button>
            </div>
            {mode === "compat" ? (
              <div className="rounded-lg border border-amber-500/20 bg-neutral-900 p-3">
                <p className="mb-2 text-xs font-medium text-amber-100">互換モードの画質</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["readable", "balanced", "compact"] as const).map((quality) => (
                    <button
                      key={quality}
                      type="button"
                      onClick={() => setCompatQuality(quality)}
                      className={`rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                        compatQuality === quality
                          ? "bg-amber-500 text-neutral-950"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {PDF_RASTER_PROFILES[quality].label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <p className={`text-xs leading-relaxed ${mode === "compat" ? "text-amber-100/80" : "text-neutral-500"}`}>
              {mode === "compat"
                ? "互換モードは最小サイズより可読性を優先します。高品質で読みにくい場合は、元PDFの解像度や保護状態に依存している可能性があります。"
                : "まずは通常モードを推奨します。画質が荒くなる画像化処理は行いません。"}
            </p>
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
              const sizeChangeLabel =
                reduction > 0
                  ? `-${reduction}%`
                  : reduction < 0
                    ? `+${Math.abs(reduction)}%`
                    : "サイズ維持";
              return (
                <div key={`${result.originalName}-${index}`} className="flex items-center gap-3 rounded-lg bg-neutral-800 p-3">
                  <div className="rounded bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300">PDF</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{result.originalName}</p>
                    <p className="text-xs text-neutral-400">
                      {formatSize(result.originalSize)} → {formatSize(result.compressedSize)}
                      <span className={`ml-2 ${reduction > 0 ? "text-green-400" : "text-yellow-400"}`}>
                        {sizeChangeLabel}
                      </span>
                      <span className="ml-2 text-neutral-500">
                        {result.mode === "compat"
                          ? `互換モード/${result.compatQuality ? PDF_RASTER_PROFILES[result.compatQuality].label : "高品質"}`
                          : "通常モード"}
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
