export const imagePresetOptions = [
  { value: "full-center", label: "全幅・中央" },
  { value: "lg-center", label: "大・中央" },
  { value: "md-center", label: "中・中央" },
  { value: "md-left", label: "中・左寄せ" },
  { value: "md-right", label: "中・右寄せ" },
  { value: "sm-center", label: "小・中央" },
  { value: "sm-left", label: "小・左寄せ" },
  { value: "sm-right", label: "小・右寄せ" },
] as const;

export type ImagePresetKey = (typeof imagePresetOptions)[number]["value"];

const presetMeta: Record<ImagePresetKey, { size: "sm" | "md" | "lg" | "full"; align: "left" | "center" | "right" }> = {
  "full-center": { size: "full", align: "center" },
  "lg-center": { size: "lg", align: "center" },
  "md-center": { size: "md", align: "center" },
  "md-left": { size: "md", align: "left" },
  "md-right": { size: "md", align: "right" },
  "sm-center": { size: "sm", align: "center" },
  "sm-left": { size: "sm", align: "left" },
  "sm-right": { size: "sm", align: "right" },
};

const presetPattern = /(preset:)?(sm|md|lg|full|small|medium|large)-(left|center|right)/i;

export function getImagePresetKey(title?: string | null): ImagePresetKey {
  if (!title) return "full-center";
  const match = title.match(presetPattern);
  if (!match) return "full-center";
  const rawSize = match[2]?.toLowerCase() ?? "full";
  const align = (match[3]?.toLowerCase() ?? "center") as "left" | "center" | "right";
  const size =
    rawSize === "small"
      ? "sm"
      : rawSize === "medium"
        ? "md"
        : rawSize === "large"
          ? "lg"
          : (rawSize as "sm" | "md" | "lg" | "full");
  const key = `${size}-${align}` as ImagePresetKey;
  return presetMeta[key] ? key : "full-center";
}

export function getImagePresetMeta(key: ImagePresetKey) {
  return presetMeta[key] ?? presetMeta["full-center"];
}

export function buildImagePresetTitle(key: ImagePresetKey) {
  return `preset:${key}`;
}
