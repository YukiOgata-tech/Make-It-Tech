"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { MakeItTechLoader } from "./make-it-tech-loader";
import { saveImageFile, saveImageFiles } from "./save-image-file";
import { trackToolEvent } from "../_lib/analytics";

type Mode = "imagesToPdf" | "pdfToImages";
type ImageItem = {
  id: string;
  file: File;
  preview: string;
};
type RenderedPage = {
  page: number;
  blob: Blob;
  url: string;
  name: string;
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

const loadImageElement = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

const imageFileToJpegBytes = async (file: File) => {
  const img = await loadImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("画像の変換に失敗しました。");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("画像の変換に失敗しました。"));
    }, "image/jpeg", 0.92);
  });

  return {
    bytes: await blob.arrayBuffer(),
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
};

export function PdfImageConverter() {
  const [mode, setMode] = useState<Mode>("imagesToPdf");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfOutputUrl, setPdfOutputUrl] = useState("");
  const [pdfOutputSize, setPdfOutputSize] = useState(0);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);

  const clearOutputs = () => {
    if (pdfOutputUrl) URL.revokeObjectURL(pdfOutputUrl);
    renderedPages.forEach((page) => URL.revokeObjectURL(page.url));
    setPdfOutputUrl("");
    setPdfOutputSize(0);
    setRenderedPages([]);
  };

  const addFiles = (inputFiles: File[]) => {
    setMessage("");
    clearOutputs();
    const pdfs = inputFiles.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    const imageFiles = inputFiles.filter((file) => file.type.startsWith("image/"));

    if (pdfs[0]) {
      setMode("pdfToImages");
      setPdfFile(pdfs[0]);
      setImages((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.preview));
        return [];
      });
      return;
    }

    if (imageFiles.length) {
      setMode("imagesToPdf");
      setPdfFile(null);
      setImages((prev) => [
        ...prev,
        ...imageFiles.map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          preview: URL.createObjectURL(file),
        })),
      ]);
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, item);
      return updated;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  const convertImagesToPdf = async () => {
    if (!images.length) {
      setMessage("画像を選択してください。");
      return;
    }
    const inputBytes = images.reduce((sum, image) => sum + image.file.size, 0);
    trackToolEvent("tool_run", {
      toolId: "pdf-image",
      toolName: "画像PDF",
      action: "images_to_pdf",
      fileCount: images.length,
      inputBytes,
    });
    setIsProcessing(true);
    setMessage("");
    clearOutputs();

    try {
      const doc = await PDFDocument.create();
      for (const item of images) {
        const image = await imageFileToJpegBytes(item.file);
        const embedded = await doc.embedJpg(image.bytes);
        const page = doc.addPage([image.width, image.height]);
        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      doc.setProducer("Make It Tech DevTools");
      doc.setCreator("Make It Tech DevTools");
      const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([toArrayBuffer(bytes)], { type: "application/pdf" });
      setPdfOutputUrl(URL.createObjectURL(blob));
      setPdfOutputSize(blob.size);
      trackToolEvent("tool_success", {
        toolId: "pdf-image",
        toolName: "画像PDF",
        action: "images_to_pdf",
        fileCount: images.length,
        inputBytes,
        outputBytes: blob.size,
        outputType: "pdf",
      });
    } catch (error) {
      trackToolEvent("tool_error", {
        toolId: "pdf-image",
        toolName: "画像PDF",
        action: "images_to_pdf",
        fileCount: images.length,
      });
      setMessage(error instanceof Error ? error.message : "PDFへの変換に失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const convertPdfToImages = async () => {
    if (!pdfFile) {
      setMessage("PDFを選択してください。");
      return;
    }
    trackToolEvent("tool_run", {
      toolId: "pdf-image",
      toolName: "画像PDF",
      action: "pdf_to_images",
      fileCount: 1,
      inputBytes: pdfFile.size,
      outputType: "png",
    });
    setIsProcessing(true);
    setMessage("");
    clearOutputs();

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
      ).toString();
      const data = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const pages: RenderedPage[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("PDFページの描画に失敗しました。");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((nextBlob) => {
            if (nextBlob) resolve(nextBlob);
            else reject(new Error("画像の生成に失敗しました。"));
          }, "image/png");
        });
        pages.push({
          page: pageNumber,
          blob,
          url: URL.createObjectURL(blob),
          name: `${pdfFile.name.replace(/\.pdf$/i, "")}_page_${String(pageNumber).padStart(3, "0")}.png`,
        });
      }
      setRenderedPages(pages);
      trackToolEvent("tool_success", {
        toolId: "pdf-image",
        toolName: "画像PDF",
        action: "pdf_to_images",
        fileCount: pages.length,
        inputBytes: pdfFile.size,
        outputBytes: pages.reduce((sum, page) => sum + page.blob.size, 0),
        outputType: "png",
      });
    } catch (error) {
      trackToolEvent("tool_error", {
        toolId: "pdf-image",
        toolName: "画像PDF",
        action: "pdf_to_images",
        fileCount: 1,
      });
      setMessage(error instanceof Error ? error.message : "PDFから画像への変換に失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfOutputUrl) return;
    const link = document.createElement("a");
    link.href = pdfOutputUrl;
    link.download = "images.pdf";
    link.click();
    trackToolEvent("tool_download", {
      toolId: "pdf-image",
      toolName: "画像PDF",
      action: "download_pdf",
      fileCount: 1,
      outputBytes: pdfOutputSize,
      outputType: "pdf",
    });
  };

  const downloadImage = async (page: RenderedPage) => {
    await saveImageFile({
      blob: page.blob,
      fileName: page.name,
      title: "PDFページ画像",
    });
    trackToolEvent("tool_download", {
      toolId: "pdf-image",
      toolName: "画像PDF",
      action: "download_image",
      fileCount: 1,
      outputBytes: page.blob.size,
      outputType: "png",
    });
  };

  const downloadAllImages = async () => {
    await saveImageFiles(
      renderedPages.map((page) => ({
        blob: page.blob,
        fileName: page.name,
        title: "PDFページ画像",
      })),
      async () => {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        renderedPages.forEach((page) => zip.file(page.name, page.blob));
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "pdf_images.zip";
        link.click();
      }
    );
    trackToolEvent("tool_download", {
      toolId: "pdf-image",
      toolName: "画像PDF",
      action: renderedPages.length === 1 ? "download_image" : "download_all_images",
      fileCount: renderedPages.length,
      outputBytes: renderedPages.reduce((sum, page) => sum + page.blob.size, 0),
      outputType: "png",
    });
  };

  return (
    <div className="tools-panel">
      <h2 className="mb-2 text-xl font-semibold sm:text-xl">画像 ↔ PDF変換</h2>
      <p className="mb-4 text-sm text-neutral-400">
        画像をPDFにまとめる、またはPDFの各ページをPNG画像として書き出します。
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("imagesToPdf")}
          className={`rounded-lg px-3 py-2 text-sm transition-colors ${mode === "imagesToPdf" ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
        >
          画像 → PDF
        </button>
        <button
          type="button"
          onClick={() => setMode("pdfToImages")}
          className={`rounded-lg px-3 py-2 text-sm transition-colors ${mode === "pdfToImages" ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
        >
          PDF → 画像
        </button>
      </div>

      <div
        onDrop={(event) => {
          event.preventDefault();
          addFiles(Array.from(event.dataTransfer.files));
        }}
        onDragOver={(event) => event.preventDefault()}
        className="tools-dropzone"
        onClick={() => document.getElementById("pdf-image-input")?.click()}
      >
        <input
          id="pdf-image-input"
          type="file"
          accept="image/*,application/pdf,.pdf"
          multiple
          onChange={(event) => {
            addFiles(Array.from(event.target.files || []));
            event.target.value = "";
          }}
          className="hidden"
        />
        <div className="text-neutral-400">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 text-lg">
            ↔
          </div>
          <p>ファイルを選択すると種類に応じて自動判定します</p>
          <p className="mt-1 text-xs">画像は複数選択、PDFは1ファイルを処理</p>
        </div>
      </div>

      {mode === "imagesToPdf" && images.length > 0 ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">PDFにする画像 ({images.length}件)</h3>
            <button
              className="text-xs text-neutral-400 hover:text-white"
              onClick={() => {
                images.forEach((item) => URL.revokeObjectURL(item.preview));
                setImages([]);
              }}
            >
              すべて削除
            </button>
          </div>
          <div className="space-y-2">
            {images.map((item, index) => (
              <div key={item.id} className="rounded-lg bg-neutral-800 p-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="h-12 w-12 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.file.name}</p>
                    <p className="text-xs text-neutral-500">{formatSize(item.file.size)}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:flex">
                  <button className="tools-secondary-button" onClick={() => moveImage(index, -1)} disabled={index === 0}>
                    上へ
                  </button>
                  <button className="tools-secondary-button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1}>
                    下へ
                  </button>
                  <button className="tools-secondary-button" onClick={() => removeImage(item.id)}>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="tools-primary-button" onClick={convertImagesToPdf} disabled={isProcessing}>
            {isProcessing ? <MakeItTechLoader label="PDF作成中..." compact /> : "PDFを作成"}
          </button>
        </div>
      ) : null}

      {mode === "pdfToImages" && pdfFile ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-lg bg-neutral-800 p-3">
            <p className="truncate text-sm">{pdfFile.name}</p>
            <p className="text-xs text-neutral-500">{formatSize(pdfFile.size)}</p>
          </div>
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <label className="mb-2 block text-sm text-neutral-400">出力解像度: {scale}x</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.5"
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <button className="tools-primary-button" onClick={convertPdfToImages} disabled={isProcessing}>
            {isProcessing ? <MakeItTechLoader label="画像生成中..." compact /> : "PDFを画像に変換"}
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}

      {pdfOutputUrl ? (
        <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-green-200">PDFを作成しました</h3>
              <p className="mt-1 text-xs text-green-100/70">{formatSize(pdfOutputSize)}</p>
            </div>
            <button onClick={downloadPdf} className="tools-secondary-button bg-blue-600 hover:bg-blue-700">
              ダウンロード
            </button>
          </div>
        </div>
      ) : null}

      {renderedPages.length > 0 ? (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">変換結果 ({renderedPages.length}ページ)</h3>
            <button onClick={() => void downloadAllImages()} className="tools-secondary-button bg-blue-600 hover:bg-blue-700">
              {renderedPages.length === 1 ? "ダウンロード" : "まとめてダウンロード"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {renderedPages.map((page) => (
              <div key={page.page} className="rounded-lg bg-neutral-800 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.url} alt="" className="aspect-[3/4] w-full rounded bg-white object-contain" />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-neutral-400">Page {page.page}</span>
                  <button onClick={() => void downloadImage(page)} className="tools-secondary-button">
                    保存
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
