"use client";

import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import { AlertCircle, FileJson, Pause, Play, RotateCcw, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LottieMode = "forward" | "reverse" | "bounce" | "reverse-bounce";

type LottieStats = {
  version?: string;
  width?: number;
  height?: number;
  frames?: number;
  frameRate?: number;
  duration?: number;
  layers?: number;
};

type PreviewFile = {
  id: string;
  name: string;
  size: number;
  kind: "json" | "lottie";
  data: string | ArrayBuffer;
  stats?: LottieStats;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function extractStats(animation: unknown): LottieStats {
  if (!isRecord(animation)) {
    return {};
  }

  const frameRate = readNumber(animation.fr);
  const inPoint = readNumber(animation.ip);
  const outPoint = readNumber(animation.op);
  const frames = typeof inPoint === "number" && typeof outPoint === "number" ? outPoint - inPoint : undefined;

  return {
    version: typeof animation.v === "string" ? animation.v : undefined,
    width: readNumber(animation.w),
    height: readNumber(animation.h),
    frames,
    frameRate,
    duration: typeof frames === "number" && frameRate ? frames / frameRate : undefined,
    layers: Array.isArray(animation.layers) ? animation.layers.length : undefined,
  };
}

function validateLottieJson(animation: unknown) {
  if (!isRecord(animation)) {
    return "JSONのルートがオブジェクトではありません。";
  }

  const requiredKeys = ["v", "fr", "ip", "op", "layers"];
  const missingKeys = requiredKeys.filter((key) => !(key in animation));
  if (missingKeys.length) {
    return `Lottie JSONに必要なキーが不足しています: ${missingKeys.join(", ")}`;
  }

  if (!Array.isArray(animation.layers)) {
    return "layersが配列ではありません。Lottie JSONとして再生できない可能性があります。";
  }

  return null;
}

function readAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました。"));
    reader.readAsText(file);
  });
}

function readAsArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("ファイルの読み込みに失敗しました。"));
      }
    };
    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました。"));
    reader.readAsArrayBuffer(file);
  });
}

function isSupportedFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith(".json") || lowerName.endsWith(".lottie") || file.type === "application/json";
}

export function LottiePreview() {
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loop, setLoop] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState<LottieMode>("forward");
  const inputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<DotLottie | null>(null);

  const loadFile = useCallback(async (file: File) => {
    setError(null);

    if (!isSupportedFile(file)) {
      setError("Lottie JSON（.json / lottie.json）またはdotLottie（.lottie）ファイルを選択してください。");
      return;
    }

    try {
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith(".lottie")) {
        const data = await readAsArrayBuffer(file);
        setPreviewFile({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          name: file.name,
          size: file.size,
          kind: "lottie",
          data,
        });
        setIsPlaying(true);
        return;
      }

      const text = await readAsText(file);
      const parsed = JSON.parse(text) as unknown;
      const validationError = validateLottieJson(parsed);
      if (validationError) {
        setError(validationError);
        return;
      }

      setPreviewFile({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        kind: "json",
        data: text,
        stats: extractStats(parsed),
      });
      setIsPlaying(true);
    } catch (err) {
      setError(err instanceof SyntaxError ? "JSONの構文が正しくありません。" : "Lottieファイルを読み込めませんでした。");
    }
  }, []);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void loadFile(file);
    }
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      void loadFile(file);
    }
  };

  const reset = () => {
    playerRef.current = null;
    setPreviewFile(null);
    setError(null);
    setIsPlaying(true);
    setLoop(true);
    setSpeed(1);
    setMode("forward");
  };

  useEffect(() => {
    playerRef.current?.setLoop(loop);
  }, [loop]);

  useEffect(() => {
    playerRef.current?.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    playerRef.current?.setMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }

    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  const statsItems = useMemo(() => {
    if (!previewFile) {
      return [];
    }

    const stats = previewFile.stats;
    return [
      ["形式", previewFile.kind === "json" ? "Lottie JSON" : "dotLottie"],
      ["サイズ", formatBytes(previewFile.size)],
      stats?.width && stats.height ? ["キャンバス", `${stats.width} x ${stats.height}`] : null,
      stats?.frameRate ? ["FPS", `${stats.frameRate}`] : null,
      stats?.frames ? ["フレーム", `${Math.round(stats.frames)}`] : null,
      stats?.duration ? ["長さ", `${stats.duration.toFixed(2)}秒`] : null,
      typeof stats?.layers === "number" ? ["レイヤー", `${stats.layers}`] : null,
      stats?.version ? ["Lottie", stats.version] : null,
    ].filter(Boolean) as [string, string][];
  }, [previewFile]);

  return (
    <div className="tools-panel w-full max-w-full overflow-hidden">
      <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold">Lottieプレビュー</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Lottie JSON（.json / lottie.json）とdotLottie（.lottie）をブラウザ上で再生確認できます。
          </p>
        </div>
        {previewFile ? (
          <button type="button" onClick={reset} className="tools-secondary-button inline-flex items-center gap-1.5 self-start">
            <RotateCcw className="h-3.5 w-3.5" />
            クリア
          </button>
        ) : null}
      </div>

      <label
        className="tools-dropzone block w-full max-w-full"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,.lottie,application/json"
          onChange={handleFileInput}
          className="hidden"
        />
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-neutral-800 text-blue-300">
          <Upload className="h-6 w-6" />
        </span>
        <span className="block text-sm font-semibold text-neutral-100">Lottieファイルを選択またはドロップ</span>
        <span className="mt-1 block text-xs text-neutral-500">.json / lottie.json / .lottie に対応</span>
      </label>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-900/70 bg-red-950/50 p-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {previewFile ? (
        <div className="mt-5 grid min-w-0 max-w-full gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-800 text-blue-300">
                  <FileJson className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="block max-w-full truncate text-sm font-semibold text-neutral-100">{previewFile.name}</h3>
                  <p className="text-xs text-neutral-500">{formatBytes(previewFile.size)}</p>
                </div>
              </div>
            </div>

            <div
              className="grid min-h-[320px] min-w-0 max-w-full place-items-center overflow-hidden rounded-lg border border-neutral-800 p-2 sm:min-h-[420px] sm:p-3"
              style={{
                backgroundColor: "#f8fafc",
                backgroundImage:
                  "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                backgroundSize: "16px 16px",
              }}
            >
              <div className="grid h-full w-full min-w-0 max-w-full place-items-center overflow-hidden">
                <DotLottieReact
                  key={previewFile.id}
                  data={previewFile.data}
                  autoplay={isPlaying}
                  loop={loop}
                  speed={speed}
                  mode={mode}
                  dotLottieRefCallback={(player) => {
                    playerRef.current = player;
                  }}
                  className="block h-full max-h-[380px] w-full min-w-0 max-w-full"
                />
              </div>
            </div>
          </section>

          <aside className="min-w-0 max-w-full space-y-3">
            <section className="min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <h3 className="mb-3 text-sm font-semibold text-neutral-100">再生設定</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying((current) => !current)}
                  className="tools-primary-button min-w-0"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? "一時停止" : "再生"}
                </button>

                <label className="flex items-center justify-between gap-3 rounded-lg bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
                  <span>ループ</span>
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(event) => setLoop(event.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                </label>

                <label className="block text-sm text-neutral-300">
                  <span className="mb-1 block text-xs text-neutral-500">速度</span>
                  <select
                    value={speed}
                    onChange={(event) => setSpeed(Number(event.target.value))}
                    className="w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </label>

                <label className="block text-sm text-neutral-300">
                  <span className="mb-1 block text-xs text-neutral-500">再生方向</span>
                  <select
                    value={mode}
                    onChange={(event) => setMode(event.target.value as LottieMode)}
                    className="w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="forward">通常</option>
                    <option value="reverse">逆再生</option>
                    <option value="bounce">往復</option>
                    <option value="reverse-bounce">逆方向から往復</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <h3 className="mb-3 text-sm font-semibold text-neutral-100">ファイル情報</h3>
              <dl className="space-y-2">
                {statsItems.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 text-xs">
                    <dt className="text-neutral-500">{label}</dt>
                    <dd className="text-right font-medium text-neutral-200">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
