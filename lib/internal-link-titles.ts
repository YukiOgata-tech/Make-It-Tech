import { site } from "@/lib/site";

const INTERNAL_TITLES: Record<string, string> = {
  "/": "トップページ",
  "/about": "事業所概要",
  "/apps": "アプリ一覧",
  "/blog": "ブログ一覧",
  "/contact": "お問い合わせ",
  "/glossary": "用語集",
  "/news": "お知らせ",
  "/niigata": "新潟のDX支援",
  "/pricing": "料金",
  "/privacy": "プライバシーポリシー",
  "/security-policy": "セキュリティポリシー",
  "/services": "サービス",
  "/survey": "LINEで相談",
  "/terms": "利用規約",
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

export function resolveInternalLinkTitle(rawHref?: string) {
  const normalized = normalizeInternalHref(rawHref);
  if (!normalized) return null;
  return INTERNAL_TITLES[normalized] ?? null;
}
