export type LinkLabel = {
  url: string;
  label: string;
};

export function normalizeLinkLabelUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function normalizeLinkLabelItems(items?: LinkLabel[]) {
  const map = new Map<string, LinkLabel>();
  (items ?? []).forEach((item) => {
    const url = normalizeLinkLabelUrl(String(item.url ?? ""));
    const label = String(item.label ?? "").trim();
    if (!url || !label) return;
    if (!map.has(url)) {
      map.set(url, { url: String(item.url ?? "").trim(), label });
    }
  });
  return Array.from(map.values());
}

export function buildLinkLabelMap(items?: LinkLabel[]) {
  const map = new Map<string, string>();
  normalizeLinkLabelItems(items).forEach((item) => {
    const key = normalizeLinkLabelUrl(item.url);
    if (key && item.label) {
      map.set(key, item.label);
    }
  });
  return map;
}
