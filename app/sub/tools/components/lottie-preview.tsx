"use client";

import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import { AlertCircle, FileJson, Pause, Play, RotateCcw, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { trackToolEvent } from "../_lib/analytics";

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

type PlaybackSettings = {
  isPlaying: boolean;
  loop: boolean;
  speed: number;
  mode: LottieMode;
};

const DEFAULT_PLAYBACK_SETTINGS: PlaybackSettings = {
  isPlaying: true,
  loop: true,
  speed: 1,
  mode: "forward",
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
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [commonSettings, setCommonSettings] = useState<PlaybackSettings>(DEFAULT_PLAYBACK_SETTINGS);
  const [fileSettings, setFileSettings] = useState<Record<string, PlaybackSettings>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const playerRefs = useRef<Record<string, DotLottie | null>>({});

  const applySettingsToPlayer = (fileId: string, settings: PlaybackSettings) => {
    const player = playerRefs.current[fileId];
    if (!player) {
      return;
    }

    player.setLoop(settings.loop);
    player.setSpeed(settings.speed);
    player.setMode(settings.mode);
    if (settings.isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  };

  const parseFile = useCallback(async (file: File): Promise<PreviewFile> => {
    if (!isSupportedFile(file)) {
      throw new Error(`${file.name}: Lottie JSON（.json / lottie.json）またはdotLottie（.lottie）ではありません。`);
    }

    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith(".lottie")) {
      const data = await readAsArrayBuffer(file);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        kind: "lottie",
        data,
      };
    }

    try {
      const text = await readAsText(file);
      const parsed = JSON.parse(text) as unknown;
      const validationError = validateLottieJson(parsed);
      if (validationError) {
        throw new Error(`${file.name}: ${validationError}`);
      }

      return {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        kind: "json",
        data: text,
        stats: extractStats(parsed),
      };
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(`${file.name}: JSONの構文が正しくありません。`);
      }
      throw err;
    }
  }, []);

  const loadFiles = useCallback(async (files: File[]) => {
    setError(null);

    if (!files.length) {
      return;
    }

    trackToolEvent("tool_run", {
      toolId: "lottie",
      toolName: "Lottieプレビュー",
      action: "preview",
      fileCount: files.length,
      inputBytes: files.reduce((sum, file) => sum + file.size, 0),
    });
    const settled = await Promise.allSettled(files.map((file) => parseFile(file)));
    const loaded = settled
      .filter((result): result is PromiseFulfilledResult<PreviewFile> => result.status === "fulfilled")
      .map((result) => result.value);
    const failed = settled
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => (result.reason instanceof Error ? result.reason.message : "Lottieファイルを読み込めませんでした。"));

    playerRefs.current = {};
    setPreviewFiles(loaded);
    setFileSettings(
      Object.fromEntries(
        loaded.map((file) => [
          file.id,
          {
            ...commonSettings,
            isPlaying: true,
          },
        ])
      )
    );
    setCommonSettings((current) => ({ ...current, isPlaying: true }));

    if (loaded.length) {
      trackToolEvent("tool_success", {
        toolId: "lottie",
        toolName: "Lottieプレビュー",
        action: "preview",
        fileCount: loaded.length,
        inputBytes: loaded.reduce((sum, file) => sum + file.size, 0),
      });
    }
    if (failed.length) {
      trackToolEvent("tool_error", {
        toolId: "lottie",
        toolName: "Lottieプレビュー",
        action: "preview",
        fileCount: failed.length,
      });
    }

    if (failed.length) {
      setError(failed.join("\n"));
    }
  }, [commonSettings, parseFile]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length) {
      void loadFiles(files);
    }
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length) {
      void loadFiles(files);
    }
  };

  const reset = () => {
    playerRefs.current = {};
    setPreviewFiles([]);
    setFileSettings({});
    setError(null);
    setCommonSettings(DEFAULT_PLAYBACK_SETTINGS);
  };

  const applyCommonSettings = (nextSettings: PlaybackSettings) => {
    setCommonSettings(nextSettings);
    setFileSettings((current) => {
      const next = Object.fromEntries(
        previewFiles.map((file) => [file.id, nextSettings])
      );
      Object.entries(next).forEach(([fileId, settings]) => applySettingsToPlayer(fileId, settings));
      return previewFiles.length ? next : current;
    });
  };

  const updateCommonSettings = (patch: Partial<PlaybackSettings>) => {
    applyCommonSettings({
      ...commonSettings,
      ...patch,
    });
  };

  const updateFileSettings = (fileId: string, patch: Partial<PlaybackSettings>) => {
    setFileSettings((current) => {
      const nextSettings = {
        ...(current[fileId] ?? commonSettings),
        ...patch,
      };
      applySettingsToPlayer(fileId, nextSettings);
      return {
        ...current,
        [fileId]: nextSettings,
      };
    });
  };

  const getStatsItems = (file: PreviewFile) => {
    const stats = file.stats;
    return [
      ["形式", file.kind === "json" ? "Lottie JSON" : "dotLottie"],
      ["サイズ", formatBytes(file.size)],
      stats?.width && stats.height ? ["キャンバス", `${stats.width} x ${stats.height}`] : null,
      stats?.frameRate ? ["FPS", `${stats.frameRate}`] : null,
      stats?.frames ? ["フレーム", `${Math.round(stats.frames)}`] : null,
      stats?.duration ? ["長さ", `${stats.duration.toFixed(2)}秒`] : null,
      typeof stats?.layers === "number" ? ["レイヤー", `${stats.layers}`] : null,
      stats?.version ? ["Lottie", stats.version] : null,
    ].filter(Boolean) as [string, string][];
  };

  const syncPlayer = (fileId: string, player: DotLottie | null) => {
    playerRefs.current[fileId] = player;
    if (!player) {
      return;
    }

    applySettingsToPlayer(fileId, fileSettings[fileId] ?? commonSettings);
  };

  return (
    <div className="tools-panel w-full max-w-full overflow-hidden">
      <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold">Lottieプレビュー</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Lottie JSON（.json / lottie.json）とdotLottie（.lottie）をブラウザ上で再生確認できます。
          </p>
        </div>
        {previewFiles.length ? (
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
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-neutral-800 text-blue-300">
          <Upload className="h-6 w-6" />
        </span>
        <span className="block text-sm font-semibold text-neutral-100">Lottieファイルを複数選択またはドロップ</span>
        <span className="mt-1 block text-xs text-neutral-500">.json / lottie.json / .lottie に対応。選択した数だけ並べて比較できます。</span>
      </label>

      {error ? (
        <div className="mt-4 flex items-start gap-2 whitespace-pre-line rounded-lg border border-red-900/70 bg-red-950/50 p-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {previewFiles.length ? (
        <div className="mt-5 min-w-0 max-w-full space-y-4">
          <section className="min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">共通設定</h3>
                <p className="mt-0.5 text-xs text-neutral-500">{previewFiles.length}件へ一括で適用します。</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(120px,160px)_minmax(110px,1fr)_minmax(120px,1fr)_minmax(140px,1fr)]">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => updateCommonSettings({ isPlaying: !commonSettings.isPlaying })}
                  className="inline-flex h-10 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium transition-colors hover:bg-blue-700"
                >
                  {commonSettings.isPlaying ? <Pause className="h-4 w-4 shrink-0" /> : <Play className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{commonSettings.isPlaying ? "一時停止" : "再生"}</span>
                </button>
              </div>

              <label className="flex h-10 min-w-0 items-center justify-between gap-3 rounded-lg bg-neutral-900 px-3 text-xs text-neutral-200">
                <span className="truncate">ループ</span>
                <input
                  type="checkbox"
                  checked={commonSettings.loop}
                  onChange={(event) => updateCommonSettings({ loop: event.target.checked })}
                  className="h-4 w-4 shrink-0 accent-blue-600"
                />
              </label>

              <label className="block min-w-0 text-xs text-neutral-300">
                <span className="mb-1 block text-xs text-neutral-500">速度</span>
                <select
                  value={commonSettings.speed}
                  onChange={(event) => updateCommonSettings({ speed: Number(event.target.value) })}
                  className="h-10 w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </label>

              <label className="block min-w-0 text-xs text-neutral-300">
                <span className="mb-1 block text-xs text-neutral-500">再生方向</span>
                <select
                  value={commonSettings.mode}
                  onChange={(event) => updateCommonSettings({ mode: event.target.value as LottieMode })}
                  className="h-10 w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="forward">通常</option>
                  <option value="reverse">逆再生</option>
                  <option value="bounce">往復</option>
                  <option value="reverse-bounce">逆方向から往復</option>
                </select>
              </label>
            </div>
          </section>

          <div className={`grid min-w-0 max-w-full gap-4 ${previewFiles.length === 1 ? "grid-cols-1" : "sm:grid-cols-2"}`}>
            {previewFiles.map((previewFile) => (
              <section key={previewFile.id} className="min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                {(() => {
                  const settings = fileSettings[previewFile.id] ?? commonSettings;
                  return (
                    <>
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
                  className="grid min-h-[260px] min-w-0 max-w-full place-items-center overflow-hidden rounded-lg border border-neutral-800 p-2 sm:min-h-[320px] sm:p-3"
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
                      autoplay={settings.isPlaying}
                      loop={settings.loop}
                      speed={settings.speed}
                      mode={settings.mode}
                      dotLottieRefCallback={(player) => syncPlayer(previewFile.id, player)}
                      className="block h-full max-h-[300px] w-full min-w-0 max-w-full"
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-2">
                  <div className="mb-2 text-xs font-semibold text-neutral-300">個別設定</div>
                  <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => updateFileSettings(previewFile.id, { isPlaying: !settings.isPlaying })}
                      className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-neutral-800 px-2 text-xs font-medium text-neutral-100 transition-colors hover:bg-neutral-700"
                    >
                      {settings.isPlaying ? <Pause className="h-3.5 w-3.5 shrink-0" /> : <Play className="h-3.5 w-3.5 shrink-0" />}
                      <span className="truncate">{settings.isPlaying ? "一時停止" : "再生"}</span>
                    </button>

                    <label className="flex h-9 min-w-0 items-center justify-between gap-2 rounded-lg bg-neutral-800 px-2 text-xs text-neutral-200">
                      <span className="truncate">ループ</span>
                      <input
                        type="checkbox"
                        checked={settings.loop}
                        onChange={(event) => updateFileSettings(previewFile.id, { loop: event.target.checked })}
                        className="h-4 w-4 shrink-0 accent-blue-600"
                      />
                    </label>

                    <label className="block min-w-0 text-xs text-neutral-400">
                      <span className="mb-1 block">速度</span>
                      <select
                        value={settings.speed}
                        onChange={(event) => updateFileSettings(previewFile.id, { speed: Number(event.target.value) })}
                        className="h-9 w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 text-xs text-neutral-100 focus:border-blue-500 focus:outline-none"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </label>

                    <label className="block min-w-0 text-xs text-neutral-400">
                      <span className="mb-1 block">方向</span>
                      <select
                        value={settings.mode}
                        onChange={(event) => updateFileSettings(previewFile.id, { mode: event.target.value as LottieMode })}
                        className="h-9 w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 text-xs text-neutral-100 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="forward">通常</option>
                        <option value="reverse">逆再生</option>
                        <option value="bounce">往復</option>
                        <option value="reverse-bounce">逆方向から往復</option>
                      </select>
                    </label>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                  {getStatsItems(previewFile).map(([label, value]) => (
                    <div key={label} className="min-w-0 text-xs">
                      <dt className="text-neutral-500">{label}</dt>
                      <dd className="truncate font-medium text-neutral-200">{value}</dd>
                    </div>
                  ))}
                </dl>
                    </>
                  );
                })()}
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
