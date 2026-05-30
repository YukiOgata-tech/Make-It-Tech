import { type MetadataRoute } from "next";
import { getToolHref, tools, toolsBaseUrl } from "./_data/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${toolsBaseUrl}${getToolHref(tool.id).replace("/sub/tools", "")}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: tool.category === "pdf" ? 0.9 : 0.8,
  }));

  return [
    {
      url: toolsBaseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolRoutes,
  ];
}
