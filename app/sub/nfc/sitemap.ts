import { type MetadataRoute } from "next";
import { nfcRoutes, nfcPublicUrl } from "@/content/nfc/site";

/**
 * nfc.make-it-tech.com のサイトマップ。
 * ページを追加したら content/nfc/site.ts の nfcRoutes に追記する。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return nfcRoutes.map((route) => ({
    url: nfcPublicUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
