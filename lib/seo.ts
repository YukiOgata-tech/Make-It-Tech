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
