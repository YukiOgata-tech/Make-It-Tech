"use client";

import { useState, useRef } from "react";

interface ResizedImage {
  original: File;
  resized: Blob;
  preview: string;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
}

const PRESET_SIZES = [
  { label: "カスタム", width: 0, height: 0 },
  { label: "HD (1280×720)", width: 1280, height: 720 },
  { label: "Full HD (1920×1080)", width: 1920, height: 1080 },
  { label: "2K (2560×1440)", width: 2560, height: 1440 },
  { label: "4K (3840×2160)", width: 3840, height: 2160 },
  { label: "Instagram正方形 (1080×1080)", width: 1080, height: 1080 },
  { label: "OGP画像 (1200×630)", width: 1200, height: 630 },
  { label: "Twitter Header (1500×500)", width: 1500, height: 500 },
];

export function ImageResizer() {
  const [images, setImages] = useState<ResizedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [fitMode, setFitMode] = useState<"contain" | "cover" | "stretch">("contain");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalAspect, setOriginalAspect] = useState(16 / 9);

  const handlePresetChange = (preset: typeof PRESET_SIZES[0]) => {
    if (preset.width > 0) {
      setWidth(preset.width);
      setHeight(preset.height);
    }
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspect) {
      setHeight(Math.round(newWidth / originalAspect));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspect) {
      setWidth(Math.round(newHeight * originalAspect));
    }
  };

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

    const results: ResizedImage[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (const file of files) {
      try {
        const img = await loadImage(file);

        // Update aspect ratio from first image
        if (results.length === 0) {
          setOriginalAspect(img.width / img.height);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);

        // Fill with transparent or white based on format
        if (file.type === "image/png") {
          ctx.clearRect(0, 0, width, height);
        } else {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }

        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (fitMode === "contain") {
          const scale = Math.min(width / img.width, height / img.height);
          drawWidth = img.width * scale;
          drawHeight = img.height * scale;
          offsetX = (width - drawWidth) / 2;
          offsetY = (height - drawHeight) / 2;
        } else if (fitMode === "cover") {
          const scale = Math.max(width / img.width, height / img.height);
          drawWidth = img.width * scale;
          drawHeight = img.height * scale;
          offsetX = (width - drawWidth) / 2;
          offsetY = (height - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Resize failed"));
            },
            mimeType,
            0.92
          );
        });

        const preview = URL.createObjectURL(blob);

        results.push({
          original: file,
          resized: blob,
          preview,
          originalWidth: img.width,
          originalHeight: img.height,
          newWidth: width,
          newHeight: height,
        });
      } catch (error) {
        console.error("Resize failed:", error);
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

  const downloadImage = (image: ResizedImage) => {
    const link = document.createElement("a");
    link.href = image.preview;
    const ext = image.original.type === "image/png" ? "png" : "jpg";
    const baseName = image.original.name.replace(/\.[^.]+$/, "");
    link.download = `${baseName}_${image.newWidth}x${image.newHeight}.${ext}`;
    link.click();
  };

  const downloadAll = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    images.forEach((image, index) => {
      const ext = image.original.type === "image/png" ? "png" : "jpg";
      const baseName = image.original.name.replace(/\.[^.]+$/, "");
      const name = `${index + 1}_${baseName}_${image.newWidth}x${image.newHeight}.${ext}`;
      zip.file(name, image.resized);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resized_images.zip";
    link.click();
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-xl font-semibold mb-2">リサイズ</h2>
      <p className="text-sm text-neutral-400 mb-4">
        画像を指定サイズにリサイズ
      </p>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Settings */}
      <div className="space-y-4 mb-4">
        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESET_SIZES.slice(1).map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetChange(preset)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                width === preset.width && height === preset.height
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Size */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-400">幅:</label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              className="w-20 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm"
            />
            <span className="text-sm text-neutral-500">px</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-400">高さ:</label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
              className="w-20 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm"
            />
            <span className="text-sm text-neutral-500">px</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
              className="accent-blue-500"
            />
            縦横比を維持
          </label>
        </div>

        {/* Fit Mode */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-400">フィット:</label>
          <div className="flex gap-1">
            {[
              { value: "contain", label: "収める" },
              { value: "cover", label: "覆う" },
              { value: "stretch", label: "引き伸ばす" },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setFitMode(mode.value as typeof fitMode)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  fitMode === mode.value
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById("resize-input")?.click()}
      >
        <input
          id="resize-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-neutral-400">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <p>ドラッグ＆ドロップ または クリックして選択</p>
          <p className="text-xs mt-1">複数ファイル対応</p>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-4 text-center text-blue-400">
          <div className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          リサイズ中...
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
                    {image.originalWidth}×{image.originalHeight} → {image.newWidth}×{image.newHeight}
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
