import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const schema = z.object({
  url: z.string().url(),
});

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMeta(html: string, attr: string, key: string) {
  const pattern1 = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  const pattern2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*${attr}=["']${key}["']`,
    "i"
  );
  const match = html.match(pattern1) || html.match(pattern2);
  return match ? decodeHtml(match[1]) : "";
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? decodeHtml(match[1]) : "";
}

function resolveUrl(base: string, value: string) {
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

export async function POST(request: Request) {
  await requireAdmin();

  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return Response.json(
      { error: "Invalid payload.", details: error instanceof Error ? error.message : undefined },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(payload.url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; MakeItTechBot/1.0; +https://make-it-tech.com)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return Response.json({ error: "URLの取得に失敗しました。" }, { status: 400 });
    }

    const html = await response.text();
    const ogTitle = extractMeta(html, "property", "og:title");
    const ogDescription = extractMeta(html, "property", "og:description");
    const ogImage = extractMeta(html, "property", "og:image");
    const ogSite = extractMeta(html, "property", "og:site_name");
    const metaDescription = extractMeta(html, "name", "description");
    const title = ogTitle || extractTitle(html);
    const description = ogDescription || metaDescription;
    const image = ogImage ? resolveUrl(payload.url, ogImage) : "";

    return Response.json({
      ok: true,
      title: title || ogSite || payload.url,
      description: description || "",
      image,
      url: payload.url,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return Response.json({ error: "取得がタイムアウトしました。" }, { status: 408 });
    }
    return Response.json({ error: "URLの取得に失敗しました。" }, { status: 400 });
  }
}
