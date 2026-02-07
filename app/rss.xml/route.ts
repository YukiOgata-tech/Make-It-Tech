import { fetchBlogList } from "@/lib/blog-data";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const FEED_LIMIT = 50;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: Date) {
  return date.toUTCString();
}

export async function GET() {
  const posts = await fetchBlogList().catch(() => []);
  const items = posts
    .filter((post) => post.slug && post.title)
    .sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? b.updatedAt?.getTime() ?? 0) -
        (a.publishedAt?.getTime() ?? a.updatedAt?.getTime() ?? 0)
    )
    .slice(0, FEED_LIMIT);

  const buildDate = new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)} Blog</title>
    <link>${site.url}/blog</link>
    <description>${escapeXml(site.description)}</description>
    <language>ja</language>
    <lastBuildDate>${toRfc822(buildDate)}</lastBuildDate>
    ${items
      .map((post) => {
        const published = post.publishedAt ?? post.updatedAt ?? post.createdAt ?? buildDate;
        const url = `${site.url}/blog/${post.slug}`;
        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(published)}</pubDate>
      <description>${escapeXml(post.summary ?? "")}</description>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
