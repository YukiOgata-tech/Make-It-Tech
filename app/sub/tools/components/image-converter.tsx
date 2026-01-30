"use client";

import { useState, useRef } from "react";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

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
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(0.9);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const results: ConvertedImage[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (const file of files) {
      try {
        const img = await loadImage(file);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // PNGの場合は背景を透明に、それ以外は白背景
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
          original: file,
          converted: blob,
          preview,
          format: formatInfo?.ext || "unknown",
        });
      } catch (error) {
        console.error("Conversion failed:", error);
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

  const downloadImage = (image: ConvertedImage) => {
    const link = document.createElement("a");
    link.href = image.preview;
    const baseName = image.original.name.replace(/\.[^.]+$/, "");
    link.download = `${baseName}.${image.format}`;
    link.click();
  };

  const downloadAll = async () => {
    // 1枚の場合は直接ダウンロード
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
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-xl font-semibold mb-2">フォーマット変換</h2>
      <p className="text-sm text-neutral-400 mb-4">
        画像を JPEG / PNG / WebP に変換
      </p>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Settings */}
      <div className="flex flex-wrap gap-4 mb-4">
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

      {isProcessing && (
        <div className="mt-4 text-center text-blue-400">
          <div className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          変換中...
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
                すべてダウンロード (ZIP)
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
  );
}
