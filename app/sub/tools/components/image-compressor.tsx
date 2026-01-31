"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { useImageHistory } from "../hooks/use-image-history";
import { useConsent } from "./cookie-consent";
import { ImageHistory } from "./image-history";

interface CompressedImage {
  original: File;
  compressed: Blob;
  originalSize: number;
  compressedSize: number;
  preview: string;
}

export function ImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);

  const { allowsFunctional } = useConsent();
  const history = useImageHistory("compress", allowsFunctional);

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const results: CompressedImage[] = [];

    for (const file of files) {
      try {
        const options = {
          maxSizeMB: 10,
          maxWidthOrHeight: maxWidth,
          useWebWorker: true,
          initialQuality: quality,
        };

        const compressed = await imageCompression(file, options);
        const preview = URL.createObjectURL(compressed);

        results.push({
          original: file,
          compressed,
          originalSize: file.size,
          compressedSize: compressed.size,
          preview,
        });

        // Add to history
        if (allowsFunctional) {
          const reduction = Math.round((1 - compressed.size / file.size) * 100);
          await history.addItem(file, compressed, {
            quality: Math.round(quality * 100),
            reduction: `${reduction}%`,
          });
        }
      } catch (error) {
        console.error("Compression failed:", error);
      }
    }

    setImages((prev) => [...prev, ...results]);
    setIsProcessing(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    e.target.value = "";
  };

  const downloadImage = (image: CompressedImage) => {
    const link = document.createElement("a");
    link.href = image.preview;
    const ext = image.original.name.split(".").pop() || "jpg";
    link.download = `compressed_${image.original.name.replace(/\.[^.]+$/, "")}.${ext}`;
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
      const ext = image.original.name.split(".").pop() || "jpg";
      const name = `compressed_${index + 1}_${image.original.name.replace(/\.[^.]+$/, "")}.${ext}`;
      zip.file(name, image.compressed);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "compressed_images.zip";
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
        <h2 className="text-xl font-semibold mb-2">画像圧縮</h2>
        <p className="text-sm text-neutral-400 mb-4">
          JPG / PNG / WebP / GIF を圧縮してファイルサイズを削減
        </p>

        {/* Settings */}
        <div className="flex flex-wrap gap-4 mb-4">
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
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-400">最大幅:</label>
            <select
              value={maxWidth}
              onChange={(e) => setMaxWidth(parseInt(e.target.value))}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm"
            >
              <option value={640}>640px</option>
              <option value={1280}>1280px</option>
              <option value={1920}>1920px</option>
              <option value={2560}>2560px</option>
              <option value={3840}>3840px</option>
            </select>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => document.getElementById("compress-input")?.click()}
        >
          <input
            id="compress-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-neutral-400">
            <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>ドラッグ＆ドロップ または クリックして選択</p>
            <p className="text-xs mt-1">複数ファイル対応</p>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 text-center text-blue-400">
            <div className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            処理中...
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
              {images.map((image, index) => {
                const reduction = Math.round(
                  ((image.originalSize - image.compressedSize) / image.originalSize) * 100
                );
                return (
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
                        {formatSize(image.originalSize)} → {formatSize(image.compressedSize)}
                        <span className={`ml-2 ${reduction > 0 ? "text-green-400" : "text-yellow-400"}`}>
                          {reduction > 0 ? `-${reduction}%` : `+${Math.abs(reduction)}%`}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => downloadImage(image)}
                      className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
                    >
                      保存
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {allowsFunctional && history.isLoaded && (
        <ImageHistory
          items={history.items}
          title="圧縮履歴"
          onRemove={history.removeItem}
          onClear={history.clearHistory}
          formatSize={history.formatSize}
          formatTimestamp={history.formatTimestamp}
          getTimeRemaining={history.getTimeRemaining}
          renderBadge={(item) => (
            <span className="px-1.5 py-0.5 bg-green-600/90 rounded text-[10px] font-medium">
              {item.metadata.reduction}
            </span>
          )}
        />
      )}
    </div>
  );
}
