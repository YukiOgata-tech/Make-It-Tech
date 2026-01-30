"use client";

import { useState, useCallback, useRef } from "react";

interface FaviconSize {
  size: number;
  label: string;
  filename: string;
  selected: boolean;
}

interface GeneratedFavicon {
  size: number;
  blob: Blob;
  preview: string;
  filename: string;
}

const DEFAULT_SIZES: FaviconSize[] = [
  { size: 16, label: "16×16", filename: "favicon-16x16.png", selected: true },
  { size: 32, label: "32×32", filename: "favicon-32x32.png", selected: true },
  { size: 48, label: "48×48", filename: "favicon-48x48.png", selected: true },
  { size: 64, label: "64×64", filename: "favicon-64x64.png", selected: false },
  { size: 128, label: "128×128", filename: "favicon-128x128.png", selected: false },
  { size: 180, label: "180×180 (Apple Touch)", filename: "apple-touch-icon.png", selected: true },
  { size: 192, label: "192×192 (Android)", filename: "android-chrome-192x192.png", selected: true },
  { size: 512, label: "512×512 (Android)", filename: "android-chrome-512x512.png", selected: true },
];

export function FaviconGenerator() {
  const [sourceImage, setSourceImage] = useState<string>("");
  const [sourceFileName, setSourceFileName] = useState("");
  const [sizes, setSizes] = useState<FaviconSize[]>(DEFAULT_SIZES);
  const [favicons, setFavicons] = useState<GeneratedFavicon[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files[0]) {
      loadSourceImage(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        loadSourceImage(file);
      }
      e.target.value = "";
    },
    []
  );

  const loadSourceImage = (file: File) => {
    setSourceFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
      setFavicons([]);
    };
    reader.readAsDataURL(file);
  };

  const toggleSize = (index: number) => {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
    );
  };

  const selectAll = () => {
    setSizes((prev) => prev.map((s) => ({ ...s, selected: true })));
  };

  const deselectAll = () => {
    setSizes((prev) => prev.map((s) => ({ ...s, selected: false })));
  };

  const generateFavicons = async () => {
    if (!sourceImage) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = await loadImage(sourceImage);
    const results: GeneratedFavicon[] = [];

    for (const sizeConfig of sizes.filter((s) => s.selected)) {
      canvas.width = sizeConfig.size;
      canvas.height = sizeConfig.size;
      ctx.clearRect(0, 0, sizeConfig.size, sizeConfig.size);

      // Draw image with high quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, sizeConfig.size, sizeConfig.size);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Generation failed"));
          },
          "image/png",
          1
        );
      });

      results.push({
        size: sizeConfig.size,
        blob,
        preview: URL.createObjectURL(blob),
        filename: sizeConfig.filename,
      });
    }

    setFavicons(results);
    setIsProcessing(false);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const downloadFavicon = (favicon: GeneratedFavicon) => {
    const link = document.createElement("a");
    link.href = favicon.preview;
    link.download = favicon.filename;
    link.click();
  };

  const downloadAll = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    favicons.forEach((favicon) => {
      zip.file(favicon.filename, favicon.blob);
    });

    // Add webmanifest file
    const manifest = {
      name: "App",
      short_name: "App",
      icons: favicons
        .filter((f) => f.filename.includes("android"))
        .map((f) => ({
          src: `/${f.filename}`,
          sizes: `${f.size}x${f.size}`,
          type: "image/png",
        })),
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
    };
    zip.file("site.webmanifest", JSON.stringify(manifest, null, 2));

    // Add HTML snippet
    const htmlSnippet = `<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
`;
    zip.file("favicon-html-snippet.txt", htmlSnippet);

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "favicons.zip";
    link.click();
  };

  const clear = () => {
    favicons.forEach((f) => URL.revokeObjectURL(f.preview));
    setSourceImage("");
    setSourceFileName("");
    setFavicons([]);
    setSizes(DEFAULT_SIZES);
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-xl font-semibold mb-2">Favicon 生成</h2>
      <p className="text-sm text-neutral-400 mb-4">
        画像から各種サイズのfaviconを一括生成
      </p>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {!sourceImage ? (
        /* Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => document.getElementById("favicon-input")?.click()}
        >
          <input
            id="favicon-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-neutral-400">
            <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <p>ドラッグ＆ドロップ または クリックして選択</p>
            <p className="text-xs mt-1">正方形の画像を推奨（512×512以上）</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Source Preview */}
          <div className="flex items-center gap-4 bg-neutral-800 rounded-lg p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sourceImage}
              alt=""
              className="w-16 h-16 object-cover rounded border border-neutral-700"
            />
            <div className="flex-1">
              <p className="text-sm">{sourceFileName}</p>
              <p className="text-xs text-neutral-400">元画像</p>
            </div>
            <button
              onClick={clear}
              className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
            >
              変更
            </button>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-neutral-400">生成サイズ:</label>
              <div className="flex gap-2 text-xs">
                <button onClick={selectAll} className="text-blue-400 hover:text-blue-300">
                  すべて選択
                </button>
                <span className="text-neutral-600">|</span>
                <button onClick={deselectAll} className="text-blue-400 hover:text-blue-300">
                  選択解除
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size, index) => (
                <button
                  key={size.size}
                  onClick={() => toggleSize(index)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    size.selected
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateFavicons}
            disabled={isProcessing || !sizes.some((s) => s.selected)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:text-neutral-400 rounded-lg text-sm font-medium transition-colors"
          >
            {isProcessing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                生成中...
              </>
            ) : (
              "Faviconを生成"
            )}
          </button>

          {/* Results */}
          {favicons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">生成結果 ({favicons.length}件)</h3>
                <button
                  onClick={downloadAll}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  すべてダウンロード (ZIP)
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {favicons.map((favicon) => (
                  <div
                    key={favicon.size}
                    className="bg-neutral-800 rounded-lg p-3 text-center"
                  >
                    <div className="flex items-center justify-center h-16 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={favicon.preview}
                        alt=""
                        style={{
                          width: Math.min(favicon.size, 64),
                          height: Math.min(favicon.size, 64),
                        }}
                        className="rounded"
                      />
                    </div>
                    <p className="text-xs text-neutral-400 truncate">
                      {favicon.filename}
                    </p>
                    <button
                      onClick={() => downloadFavicon(favicon)}
                      className="mt-2 px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-xs transition-colors"
                    >
                      保存
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-neutral-800 rounded-lg p-3">
                <p className="text-xs text-neutral-400 mb-2">HTMLスニペット:</p>
                <pre className="text-xs bg-neutral-900 p-2 rounded overflow-x-auto">
{`<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
