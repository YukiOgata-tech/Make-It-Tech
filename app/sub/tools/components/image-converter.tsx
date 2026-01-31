"use client";

import { useState, useRef } from "react";
import { useImageHistory } from "../hooks/use-image-history";
import { useConsent } from "./cookie-consent";
import { ImageHistory } from "./image-history";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

interface PendingFile {
  file: File;
  preview: string;
}

interface ConvertedImage {
  original: File;
  converted: Blob;
  preview: string;
  format: string;
}

const FORMAT_OPTIONS: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

export function ImageConverter() {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(0.9);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { allowsFunctional } = useConsent();
  const history = useImageHistory("convert", allowsFunctional);

  const addFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const newPending = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const clearPendingFiles = () => {
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
    setPendingFiles([]);
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const processFiles = async () => {
    if (pendingFiles.length === 0) return;
    setIsProcessing(true);

    const results: ConvertedImage[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (const pending of pendingFiles) {
      try {
        const img = await loadImage(pending.file);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (outputFormat !== "image/png") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Conversion failed"));
            },
            outputFormat,
            quality
          );
        });

        const preview = URL.createObjectURL(blob);
        const formatInfo = FORMAT_OPTIONS.find((f) => f.value === outputFormat);

        results.push({
          original: pending.file,
          converted: blob,
          preview,
          format: formatInfo?.ext || "unknown",
        });

        // Add to history
        if (allowsFunctional) {
          const fromFormat = pending.file.type.split("/")[1]?.toUpperCase() || "?";
          const toFormat = formatInfo?.ext.toUpperCase() || "?";
          await history.addItem(pending.file, blob, {
            from: fromFormat,
            to: toFormat,
            quality: Math.round(quality * 100),
          });
        }
      } catch (error) {
        console.error("Conversion failed:", error);
      }
    }

    // Clear pending files
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
    setPendingFiles([]);

    setImages((prev) => [...prev, ...results]);
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = "";
  };

  const downloadImage = (image: ConvertedImage) => {
    const link = document.createElement("a");
    link.href = image.preview;
    const baseName = image.original.name.replace(/\.[^.]+$/, "");
    link.download = `${baseName}.${image.format}`;
    link.click();
  };

  const downloadAll = async () => {
    if (images.length === 1) {
      downloadImage(images[0]);
      return;
    }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    images.forEach((image, index) => {
      const baseName = image.original.name.replace(/\.[^.]+$/, "");
      const name = `${index + 1}_${baseName}.${image.format}`;
      zip.file(name, image.converted);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "converted_images.zip";
    link.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
        <h2 className="text-xl font-semibold mb-2">フォーマット変換</h2>
        <p className="text-sm text-neutral-400 mb-4">
          画像を JPEG / PNG / WebP に変換
        </p>

        <canvas ref={canvasRef} className="hidden" />

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => document.getElementById("convert-input")?.click()}
        >
          <input
            id="convert-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-neutral-400">
            <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p>ドラッグ＆ドロップ または クリックして選択</p>
            <p className="text-xs mt-1">複数ファイル対応</p>
          </div>
        </div>

        {/* Pending Files */}
        {pendingFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">選択中のファイル ({pendingFiles.length}件)</h3>
              <button
                onClick={clearPendingFiles}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                すべて削除
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {pendingFiles.map((pending, index) => (
                <div key={index} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pending.preview}
                    alt=""
                    className="w-full aspect-square object-cover rounded-lg border border-neutral-700"
                  />
                  <button
                    onClick={() => removePendingFile(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] px-2 py-1 rounded-b-lg truncate">
                    {pending.file.name}
                  </div>
                  <div className="absolute top-1 left-1 bg-black/70 text-[10px] px-1.5 py-0.5 rounded">
                    {pending.file.type.split("/")[1]?.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            {/* Settings */}
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-400">出力形式:</label>
                <div className="flex gap-1">
                  {FORMAT_OPTIONS.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setOutputFormat(format.value)}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        outputFormat === format.value
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>
              {outputFormat !== "image/png" && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-400">品質:</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-24 accent-blue-500"
                  />
                  <span className="text-sm w-10">{Math.round(quality * 100)}%</span>
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={processFiles}
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  変換中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  変換を開始
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {images.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">結果 ({images.length}件)</h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadAll}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  {images.length === 1 ? "ダウンロード" : "すべてダウンロード (ZIP)"}
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
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-neutral-800 rounded-lg p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.preview}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{image.original.name}</p>
                    <p className="text-xs text-neutral-400">
                      {image.original.type.split("/")[1].toUpperCase()} → {image.format.toUpperCase()}
                      <span className="ml-2">{formatSize(image.converted.size)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => downloadImage(image)}
                    className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
                  >
                    保存
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {allowsFunctional && history.isLoaded && (
        <ImageHistory
          items={history.items}
          title="変換履歴"
          onRemove={history.removeItem}
          onClear={history.clearHistory}
          formatSize={history.formatSize}
          formatTimestamp={history.formatTimestamp}
          getTimeRemaining={history.getTimeRemaining}
          renderBadge={(item) => (
            <span className="px-1.5 py-0.5 bg-blue-600/90 rounded text-[10px] font-medium">
              {item.metadata.from} → {item.metadata.to}
            </span>
          )}
        />
      )}
    </div>
  );
}
