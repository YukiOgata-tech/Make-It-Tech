import { site } from "@/lib/site";

const INTERNAL_TITLES: Record<string, string> = {
  "/": "トップページ",
  "/about": "事業所概要",
  "/apps": "アプリ一覧",
  "/blog": "ブログ一覧",
  "/contact": "お問い合わせ",
  "/news": "お知らせ",
  "/niigata": "新潟のDX支援",
  "/privacy": "プライバシーポリシー",
  "/security-policy": "セキュリティポリシー",
  "/services": "サービス",
  "/survey": "LINEで相談",
  "/terms": "利用規約",
  "/web-production": "ホームページ制作・Web運用",
};

const siteHost = (() => {
  try {
    return new URL(site.url).hostname;
  } catch {
    return "";
  }
})();

export function normalizeInternalHref(rawHref?: string) {
  if (!rawHref) return "";
  if (rawHref.startsWith("#")) return "";
  if (rawHref.startsWith("/")) {
    const path = rawHref.split(/[?#]/)[0] || "/";
    return path !== "/" ? path.replace(/\/+$/, "") : "/";
  }
  if (rawHref.startsWith("//")) {
    try {
      const url = new URL(`https:${rawHref}`);
      if (!siteHost || url.hostname !== siteHost) return "";
      const path = url.pathname || "/";
      return path !== "/" ? path.replace(/\/+$/, "") : "/";
    } catch {
      return "";
    }
  }
  if (rawHref.startsWith("http://") || rawHref.startsWith("https://")) {
    try {
      const url = new URL(rawHref);
      if (!siteHost || url.hostname !== siteHost) return "";
      const path = url.pathname || "/";
      return path !== "/" ? path.replace(/\/+$/, "") : "/";
    } catch {
      return "";
    }
  }
  return "";
}

/**
 * 内部リンクのURLを、そのページの名前に置き換えるために引く。
 *
 * extraTitles は記事のように増えていくページ用。呼び出し側が
 * `/blog/<slug>` → 記事タイトルのマップを渡す。静的な INTERNAL_TITLES より優先する
 * （記事タイトルの方が具体的で、リンク先を言い当てているため）。
 * 管理画面のプレビューのように一覧を持てない場所は、渡さなければ従来どおり動く。
 */
export function resolveInternalLinkTitle(
  rawHref?: string,
  extraTitles?: ReadonlyMap<string, string>
) {
  const normalized = normalizeInternalHref(rawHref);
  if (!normalized) return null;
  return extraTitles?.get(normalized) ?? INTERNAL_TITLES[normalized] ?? null;
}
