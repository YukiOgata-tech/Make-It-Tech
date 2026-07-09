"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { useImageHistory } from "../hooks/use-image-history";
import { useConsent } from "./cookie-consent";
import { ImageHistory } from "./image-history";
import { MakeItTechLoader } from "./make-it-tech-loader";
import { saveImageFile, saveImageFiles } from "./save-image-file";
import { trackToolEvent } from "../_lib/analytics";

interface PendingFile {
  file: File;
  preview: string;
}

interface CompressedImage {
  original: File;
  compressed: Blob;
  originalSize: number;
  compressedSize: number;
  preview: string;
  outputName: string;
}

type CompressionCandidate = {
  blob: Blob;
  psnr: number;
};

const LOSSY_IMAGE_PROFILES = [
  { maxSize: 1920, quality: 0.82 },
  { maxSize: 1600, quality: 0.76 },
  { maxSize: 1440, quality: 0.7 },
  { maxSize: 1280, quality: 0.66 },
  { maxSize: 1080, quality: 0.62 },
];

const LOSSLESS_IMAGE_PROFILES = [
  { maxSize: 1920 },
  { maxSize: 1600 },
  { maxSize: 1440 },
  { maxSize: 1280 },
  { maxSize: 1080 },
];

export function ImageCompressor() {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const { allowsFunctional } = useConsent();
  const history = useImageHistory("compress", allowsFunctional);

  const addFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const newPending = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
    setMessage("");
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

  const processFiles = async () => {
    if (pendingFiles.length === 0) return;
    const inputBytes = pendingFiles.reduce((sum, pending) => sum + pending.file.size, 0);
    trackToolEvent("tool_run", {
      toolId: "compress",
      toolName: "画像圧縮",
      action: "compress",
      fileCount: pendingFiles.length,
      inputBytes,
    });
    setIsProcessing(true);
    setMessage("");

    const results: CompressedImage[] = [];
    const failedNames: string[] = [];

    for (const pending of pendingFiles) {
      try {
        const compressed = await compressImageAggressively(pending.file);
        const preview = URL.createObjectURL(compressed);
        const outputName = getOutputName(pending.file);

        results.push({
          original: pending.file,
          compressed,
          originalSize: pending.file.size,
          compressedSize: compressed.size,
          preview,
          outputName,
        });

        // Add to history
        if (allowsFunctional) {
          const reduction = Math.round((1 - compressed.size / pending.file.size) * 100);
          await history.addItem(pending.file, compressed, {
            quality: "auto",
            reduction: `${reduction}%`,
          });
        }
      } catch (error) {
        console.error("Compression failed:", error);
        failedNames.push(pending.file.name);
      }
    }

    // Clear pending files
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
    setPendingFiles([]);

    setImages((prev) => [...prev, ...results]);
    if (results.length > 0) {
      const outputBytes = results.reduce((sum, result) => sum + result.compressedSize, 0);
      trackToolEvent("tool_success", {
        toolId: "compress",
        toolName: "画像圧縮",
        action: "compress",
        fileCount: results.length,
        inputBytes,
        outputBytes,
        reductionPercent: inputBytes > 0 ? (1 - outputBytes / inputBytes) * 100 : undefined,
      });
    }
    if (failedNames.length > 0) {
      trackToolEvent("tool_error", {
        toolId: "compress",
        toolName: "画像圧縮",
        action: "compress",
        fileCount: failedNames.length,
      });
    }
    if (failedNames.length > 0) {
      setMessage(`${failedNames.join(", ")} の圧縮に失敗しました。`);
    }
    setIsProcessing(false);
  };

  const compressImageAggressively = async (file: File) => {
    const candidates: Blob[] = [file];
    const outputType = getSupportedOutputType(file);

    try {
      const fallback = await imageCompression(file, {
        maxSizeMB: getTargetSizeMB(file),
        maxWidthOrHeight: getTargetMaxDimension(file),
        useWebWorker: true,
        initialQuality: 0.72,
        alwaysKeepResolution: false,
      });
      if (isSameImageType(file.type, fallback.type)) {
        candidates.push(fallback);
      }
    } catch {
      // Canvas conversion below is the primary path for aggressive compression.
    }

    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      const smallestFallback = candidates.reduce((best, next) =>
        next.size < best.size ? next : best
      );
      if (smallestFallback.size <= file.size) {
        return smallestFallback;
      }
      throw new Error("画像の読み込みに失敗しました。");
    }

    try {
      const profiles = outputType === "image/png" ? LOSSLESS_IMAGE_PROFILES : LOSSY_IMAGE_PROFILES;
      for (const profile of profiles) {
        const scale = Math.min(1, profile.maxSize / Math.max(bitmap.width, bitmap.height));
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          continue;
        }

        canvas.width = width;
        canvas.height = height;
        if (outputType === "image/jpeg") {
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(bitmap, 0, 0, width, height);

        const quality = "quality" in profile && typeof profile.quality === "number"
          ? profile.quality
          : undefined;
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, outputType, quality);
        });

        if (blob && isSameImageType(file.type, blob.type)) {
          candidates.push(blob);
        }

        canvas.width = 1;
        canvas.height = 1;
      }

      const scoredCandidates = await scoreCompressionCandidates(bitmap, candidates, outputType);
      const selected = selectCompressionCandidate(file, scoredCandidates, bitmap);
      if (selected) {
        return selected;
      }
    } finally {
      bitmap.close();
    }

    const smallest = candidates.reduce<Blob | null>((best, next) => {
      if (!best) return next;
      return next.size < best.size ? next : best;
    }, null);

    if (!smallest) {
      throw new Error("画像の圧縮に失敗しました。");
    }

    return smallest;
  };

  const getTargetSizeMB = (file: File) => {
    if (file.size > 8 * 1024 * 1024) return 0.8;
    if (file.size > 3 * 1024 * 1024) return 0.65;
    return 0.5;
  };

  const getTargetMaxDimension = (file: File) => {
    if (file.size > 8 * 1024 * 1024) return 1600;
    if (file.size > 3 * 1024 * 1024) return 1440;
    return 1280;
  };

  const scoreCompressionCandidates = async (
    originalBitmap: ImageBitmap,
    candidates: Blob[],
    outputType: string
  ): Promise<CompressionCandidate[]> => {
    const scored: CompressionCandidate[] = [];

    for (const blob of candidates) {
      if (blob === candidates[0]) {
        scored.push({ blob, psnr: Number.POSITIVE_INFINITY });
        continue;
      }

      const psnr = await calculatePsnr(originalBitmap, blob, outputType).catch(() => 0);
      scored.push({ blob, psnr });
    }

    return scored;
  };

  const selectCompressionCandidate = (
    file: File,
    candidates: CompressionCandidate[],
    bitmap: ImageBitmap
  ) => {
    const maxDimension = Math.max(bitmap.width, bitmap.height);
    const minPsnr = file.size > 8 * 1024 * 1024 || maxDimension > 3000 ? 31.5 : 33;
    const acceptable = candidates
      .filter((candidate) => candidate.blob.size < file.size && candidate.psnr >= minPsnr)
      .sort((a, b) => a.blob.size - b.blob.size);

    if (acceptable.length) {
      return acceptable[0].blob;
    }

    const fallback = candidates
      .filter((candidate) => {
        const reduction = 1 - candidate.blob.size / file.size;
        return reduction >= 0.15 && candidate.psnr >= 30;
      })
      .sort((a, b) => a.blob.size - b.blob.size);

    return fallback[0]?.blob ?? file;
  };

  const calculatePsnr = async (originalBitmap: ImageBitmap, candidate: Blob, outputType: string) => {
    const candidateBitmap = await createImageBitmap(candidate);
    const sampleSize = 192;
    const originalCanvas = document.createElement("canvas");
    const candidateCanvas = document.createElement("canvas");
    originalCanvas.width = sampleSize;
    originalCanvas.height = sampleSize;
    candidateCanvas.width = sampleSize;
    candidateCanvas.height = sampleSize;

    const originalCtx = originalCanvas.getContext("2d");
    const candidateCtx = candidateCanvas.getContext("2d");
    if (!originalCtx || !candidateCtx) {
      candidateBitmap.close();
      return 0;
    }

    try {
      if (outputType === "image/jpeg") {
        originalCtx.fillStyle = "#fff";
        originalCtx.fillRect(0, 0, sampleSize, sampleSize);
        candidateCtx.fillStyle = "#fff";
        candidateCtx.fillRect(0, 0, sampleSize, sampleSize);
      }

      originalCtx.imageSmoothingEnabled = true;
      originalCtx.imageSmoothingQuality = "high";
      candidateCtx.imageSmoothingEnabled = true;
      candidateCtx.imageSmoothingQuality = "high";
      originalCtx.drawImage(originalBitmap, 0, 0, sampleSize, sampleSize);
      candidateCtx.drawImage(candidateBitmap, 0, 0, sampleSize, sampleSize);

      const originalData = originalCtx.getImageData(0, 0, sampleSize, sampleSize).data;
      const candidateData = candidateCtx.getImageData(0, 0, sampleSize, sampleSize).data;
      let mse = 0;
      for (let index = 0; index < originalData.length; index += 4) {
        const red = originalData[index] - candidateData[index];
        const green = originalData[index + 1] - candidateData[index + 1];
        const blue = originalData[index + 2] - candidateData[index + 2];
        const alpha = originalData[index + 3] - candidateData[index + 3];
        mse += red * red + green * green + blue * blue + alpha * alpha;
      }

      mse /= sampleSize * sampleSize * 4;
      if (mse <= 0) {
        return Number.POSITIVE_INFINITY;
      }

      return 10 * Math.log10((255 * 255) / mse);
    } finally {
      candidateBitmap.close();
      originalCanvas.width = 1;
      originalCanvas.height = 1;
      candidateCanvas.width = 1;
      candidateCanvas.height = 1;
    }
  };

  const getSupportedOutputType = (file: File) => {
    const normalizedType = file.type.toLowerCase();
    if (normalizedType === "image/png" || normalizedType === "image/webp") {
      return normalizedType;
    }
    if (normalizedType === "image/jpeg" || normalizedType === "image/jpg") {
      return "image/jpeg";
    }
    return normalizedType;
  };

  const isSameImageType = (originalType: string, outputType: string) => {
    const normalizedOriginal = originalType.toLowerCase();
    const normalizedOutput = outputType.toLowerCase();
    const isJpegOriginal = normalizedOriginal === "image/jpeg" || normalizedOriginal === "image/jpg";
    const isJpegOutput = normalizedOutput === "image/jpeg" || normalizedOutput === "image/jpg";
    if (isJpegOriginal && isJpegOutput) {
      return true;
    }
    return normalizedOriginal === normalizedOutput;
  };

  const getOutputName = (file: File) => {
    const extension = file.name.includes(".")
      ? file.name.split(".").pop()
      : file.type.split("/").pop();
    const baseName = file.name.replace(/\.[^.]+$/, "");

    return extension ? `${baseName}.${extension}` : baseName;
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

  const downloadImage = async (image: CompressedImage) => {
    await saveImageFile({
      blob: image.compressed,
      fileName: `compressed_${image.outputName}`,
      title: "圧縮画像",
    });
    trackToolEvent("tool_download", {
      toolId: "compress",
      toolName: "画像圧縮",
      action: "download_single",
      fileCount: 1,
      outputBytes: image.compressedSize,
    });
  };

  const downloadAll = async () => {
    await saveImageFiles(
      images.map((image, index) => ({
        blob: image.compressed,
        fileName: `compressed_${index + 1}_${image.outputName}`,
        title: "圧縮画像",
      })),
      async () => {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        images.forEach((image, index) => {
          const name = `compressed_${index + 1}_${image.outputName}`;
          zip.file(name, image.compressed);
        });

        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "compressed_images.zip";
        link.click();
      }
    );
    trackToolEvent("tool_download", {
      toolId: "compress",
      toolName: "画像圧縮",
      action: images.length === 1 ? "download_single" : "download_all",
      fileCount: images.length,
      outputBytes: images.reduce((sum, image) => sum + image.compressedSize, 0),
    });
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
                    {formatSize(pending.file.size)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-100">自動圧縮モード</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-100/70">
                元のファイル形式を保ったまま複数候補を作成し、見た目の劣化が大きい候補を避けながらファイルサイズを削減します。
              </p>
            </div>

            {/* Start Button */}
            <button
              onClick={processFiles}
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <MakeItTechLoader label="圧縮中..." compact />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  圧縮を開始
                </>
              )}
            </button>
          </div>
        )}

        {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}

        {/* Results */}
        {images.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">結果 ({images.length}件)</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => void downloadAll()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  {images.length === 1 ? "ダウンロード" : "まとめてダウンロード"}
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
                      onClick={() => void downloadImage(image)}
                      className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
                    >
                      ダウンロード
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
