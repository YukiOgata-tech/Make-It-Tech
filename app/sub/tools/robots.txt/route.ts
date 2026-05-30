import { toolsBaseUrl } from "../_data/tools";

export function GET() {
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      `Sitemap: ${toolsBaseUrl}/sitemap.xml`,
      "",
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  );
}
