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

  const updatedAt = items[0]?.publishedAt ?? items[0]?.updatedAt ?? new Date();
  const feedUpdated = updatedAt.toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${site.url}/blog</id>
  <title>${escapeXml(site.name)} Blog</title>
  <link href="${site.url}/blog" />
  <link href="${site.url}/atom.xml" rel="self" />
  <updated>${feedUpdated}</updated>
  <author>
    <name>${escapeXml(site.name)}</name>
  </author>
  ${items
    .map((post) => {
      const published = post.publishedAt ?? post.updatedAt ?? post.createdAt ?? new Date();
      const url = `${site.url}/blog/${post.slug}`;
      return `
  <entry>
    <id>${url}</id>
    <title>${escapeXml(post.title)}</title>
    <link href="${url}" />
    <updated>${published.toISOString()}</updated>
    <published>${published.toISOString()}</published>
    <summary>${escapeXml(post.summary ?? "")}</summary>
  </entry>`;
    })
    .join("")}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
