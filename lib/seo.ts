import { site } from "@/lib/site";

const DEFAULT_MIN_DESCRIPTION_LENGTH = 80;
const DEFAULT_MAX_DESCRIPTION_LENGTH = 160;

export function buildMetaDescription(
  summary: string | null | undefined,
  fallback: string,
) {
  const normalizedSummary = summary?.replace(/\s+/g, " ").trim() ?? "";
  const normalizedFallback = fallback.replace(/\s+/g, " ").trim();
  const description =
    normalizedSummary.length >= DEFAULT_MIN_DESCRIPTION_LENGTH
      ? normalizedSummary
      : [normalizedSummary, normalizedFallback].filter(Boolean).join(" ");

  if (description.length <= DEFAULT_MAX_DESCRIPTION_LENGTH) {
    return description;
  }

  return `${description
    .slice(0, DEFAULT_MAX_DESCRIPTION_LENGTH - 1)
    .replace(/[、。,\s]+$/u, "")}…`;
}

/**
 * カバー画像から OGP / 構造化データ用の画像URLを作る。
 *
 * SVG は X・Facebook・LINE などのOGP画像として描画されず、Google の構造化データでも
 * サポート対象外なので、カバーがSVGのときは既定のOG画像に差し替える。
 * ページ本文のカバー表示にはSVGをそのまま使うため、差し替えは共有時の見た目にだけ効く。
 */
export function resolveOgImage(coverUrl?: string) {
  const absolute = coverUrl
    ? coverUrl.startsWith("http")
      ? coverUrl
      : `${site.url}${coverUrl.startsWith("/") ? "" : "/"}${coverUrl}`
    : "";
  const usable = Boolean(absolute) && !/\.svg(?:[?#]|$)/i.test(absolute);
  return {
    url: usable ? absolute : `${site.url}${site.ogImage}`,
    isFallback: !usable,
  };
}
