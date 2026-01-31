"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { useTextHistory } from "../hooks/use-text-history";
import { useConsent } from "./cookie-consent";

export function QRGenerator() {
  const [text, setText] = useState("https://make-it-tech.com");
  const [size, setSize] = useState(256);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { allowsFunctional } = useConsent();
  const history = useTextHistory("qr", allowsFunctional);

  const generateQR = async () => {
    if (!text.trim()) {
      setError("テキストを入力してください");
      setQrDataUrl("");
      return;
    }

    setError("");

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });

      const dataUrl = canvas.toDataURL("image/png");
      setQrDataUrl(dataUrl);
    } catch (err) {
      setError("QRコードの生成に失敗しました");
      setQrDataUrl("");
    }
  };

  useEffect(() => {
    generateQR();
  }, [text, size, bgColor, fgColor, errorLevel]);

  const downloadPNG = () => {
    if (!qrDataUrl) return;

    // Add to history when downloading
    if (allowsFunctional) {
      history.addItem(text, { type: "QR", size });
    }

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qrcode.png";
    link.click();
  };

  const downloadSVG = async () => {
    if (!text.trim()) return;

    // Add to history when downloading
    if (allowsFunctional) {
      history.addItem(text, { type: "QR", size });
    }

    try {
      const svgString = await QRCode.toString(text, {
        type: "svg",
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "qrcode.svg";
      link.click();
    } catch {
      setError("SVGの生成に失敗しました");
    }
  };

  const copyToClipboard = async () => {
    if (!qrDataUrl) return;

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        }
      });
    } catch {
      setError("クリップボードへのコピーに失敗しました");
    }
  };

  const applyHistoryItem = (content: string) => {
    setText(content);
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
        <h2 className="text-xl font-semibold mb-2">QRコード生成</h2>
        <p className="text-sm text-neutral-400 mb-4">
          URLやテキストからQRコードを生成
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Settings */}
          <div className="space-y-4">
            {/* Text Input */}
            <div>
              <label className="text-sm text-neutral-400 block mb-1">テキスト / URL</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="URLまたはテキストを入力..."
                className="w-full h-24 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Size */}
            <div>
              <label className="text-sm text-neutral-400 block mb-1">サイズ: {size}px</label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-400 block mb-1">前景色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-400 block mb-1">背景色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Error Correction Level */}
            <div>
              <label className="text-sm text-neutral-400 block mb-1">エラー訂正レベル</label>
              <div className="flex gap-1">
                {(["L", "M", "Q", "H"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setErrorLevel(level)}
                    className={`flex-1 py-1.5 rounded text-sm transition-colors ${
                      errorLevel === level
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    {level}
                    <span className="text-xs text-neutral-400 ml-1">
                      ({level === "L" ? "7%" : level === "M" ? "15%" : level === "Q" ? "25%" : "30%"})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <canvas ref={canvasRef} className="block" />
            </div>

            {error && (
              <p className="text-sm text-red-400 mb-4">{error}</p>
            )}

            {qrDataUrl && (
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={downloadPNG}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  PNG
                </button>
                <button
                  onClick={downloadSVG}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                >
                  SVG
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
                >
                  コピー
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 text-xs text-neutral-500">
          <p>※ エラー訂正レベルが高いほど、QRコードが汚れても読み取りやすくなりますが、サイズが大きくなります。</p>
        </div>
      </div>

      {/* History */}
      {allowsFunctional && history.isLoaded && history.items.length > 0 && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium">生成履歴</h3>
                <p className="text-xs text-neutral-500">{history.items.length}件 • 24時間後に自動削除</p>
              </div>
            </div>
            <button
              onClick={history.clearHistory}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
            >
              履歴をクリア
            </button>
          </div>
          <div className="p-4 space-y-2">
            {history.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg group"
              >
                <div className="w-8 h-8 bg-neutral-700 rounded flex items-center justify-center text-lg">
                  📱
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.preview}</p>
                  <p className="text-[10px] text-neutral-500">{history.formatTimestamp(item.timestamp)}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => applyHistoryItem(item.content)}
                    className="px-2 py-1 text-xs bg-blue-600/80 hover:bg-blue-600 rounded transition-colors"
                  >
                    使用
                  </button>
                  <button
                    onClick={() => history.removeItem(item.id)}
                    className="px-2 py-1 text-xs bg-neutral-700 hover:bg-red-600/80 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-neutral-600 text-center pt-2">
              履歴はブラウザ内のみに保存されます
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
