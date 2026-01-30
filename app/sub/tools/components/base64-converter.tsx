"use client";

import { useState } from "react";

export function Base64Converter() {
  const [mode, setMode] = useState<"toBase64" | "fromBase64">("toBase64");
  const [base64Output, setBase64Output] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const convertToBase64 = (file: File) => {
    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64Output(result);
      setImagePreview(result);
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files[0]) {
      convertToBase64(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      convertToBase64(file);
    }
    e.target.value = "";
  };

  const handleBase64Input = (value: string) => {
    setBase64Output(value);
    setError("");

    if (!value.trim()) {
      setImagePreview("");
      return;
    }

    // Add data URL prefix if missing
    let dataUrl = value.trim();
    if (!dataUrl.startsWith("data:")) {
      // Try to detect format and add prefix
      if (dataUrl.startsWith("/9j/")) {
        dataUrl = `data:image/jpeg;base64,${dataUrl}`;
      } else if (dataUrl.startsWith("iVBOR")) {
        dataUrl = `data:image/png;base64,${dataUrl}`;
      } else if (dataUrl.startsWith("UklGR")) {
        dataUrl = `data:image/webp;base64,${dataUrl}`;
      } else if (dataUrl.startsWith("R0lGOD")) {
        dataUrl = `data:image/gif;base64,${dataUrl}`;
      } else {
        dataUrl = `data:image/png;base64,${dataUrl}`;
      }
    }

    // Validate base64
    try {
      const img = new Image();
      img.onload = () => setImagePreview(dataUrl);
      img.onerror = () => {
        setError("無効なBase64画像データです");
        setImagePreview("");
      };
      img.src = dataUrl;
    } catch {
      setError("Base64のデコードに失敗しました");
      setImagePreview("");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(base64Output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("クリップボードへのコピーに失敗しました");
    }
  };

  const downloadImage = () => {
    if (!imagePreview) return;

    const link = document.createElement("a");
    link.href = imagePreview;

    // Extract extension from data URL
    const match = imagePreview.match(/data:image\/(\w+);/);
    const ext = match?.[1] || "png";
    link.download = `image.${ext}`;
    link.click();
  };

  const clear = () => {
    setBase64Output("");
    setImagePreview("");
    setFileName("");
    setError("");
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-xl font-semibold mb-2">Base64 変換</h2>
      <p className="text-sm text-neutral-400 mb-4">
        画像 ↔ Base64文字列の相互変換
      </p>

      {/* Mode Toggle */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => {
            setMode("toBase64");
            clear();
          }}
          className={`px-4 py-2 rounded-l-lg text-sm transition-colors ${
            mode === "toBase64"
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          }`}
        >
          画像 → Base64
        </button>
        <button
          onClick={() => {
            setMode("fromBase64");
            clear();
          }}
          className={`px-4 py-2 rounded-r-lg text-sm transition-colors ${
            mode === "fromBase64"
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          }`}
        >
          Base64 → 画像
        </button>
      </div>

      {mode === "toBase64" ? (
        <>
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById("base64-input")?.click()}
          >
            <input
              id="base64-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-neutral-400">
              <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p>ドラッグ＆ドロップ または クリックして選択</p>
            </div>
          </div>

          {/* Result */}
          {base64Output && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-4">
                {imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt=""
                    className="w-16 h-16 object-cover rounded border border-neutral-700"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm">{fileName}</p>
                  <p className="text-xs text-neutral-400">
                    {(base64Output.length / 1024).toFixed(1)} KB (Base64)
                  </p>
                </div>
              </div>
              <textarea
                readOnly
                value={base64Output}
                className="w-full h-32 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-xs font-mono resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  {copied ? "コピーしました!" : "クリップボードにコピー"}
                </button>
                <button
                  onClick={clear}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
                >
                  クリア
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Base64 Input */}
          <textarea
            value={base64Output}
            onChange={(e) => handleBase64Input(e.target.value)}
            placeholder="Base64文字列を貼り付け（data:image/... または 純粋なBase64文字列）"
            className="w-full h-32 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-xs font-mono resize-none placeholder:text-neutral-500"
          />

          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}

          {/* Preview */}
          {imagePreview && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt=""
                  className="max-w-full max-h-64 rounded border border-neutral-700"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={downloadImage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  画像をダウンロード
                </button>
                <button
                  onClick={clear}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
                >
                  クリア
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
