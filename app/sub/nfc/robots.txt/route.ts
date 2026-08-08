import { nfcSite } from "@/content/nfc/site";

/**
 * nfc.make-it-tech.com の robots.txt。
 * proxy.ts が このホストの /robots.txt をここへリライトする。
 */
export function GET() {
  const lines = nfcSite.indexable
    ? ["User-agent: *", "Allow: /", `Sitemap: ${nfcSite.url}/sitemap.xml`, ""]
    : ["User-agent: *", "Disallow: /", ""];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
