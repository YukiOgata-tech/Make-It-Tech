import { type MetadataRoute } from "next";
import { toolsBaseUrl } from "./sub/tools/_data/tools";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/sub/admin-console",
        "/sub/admin-console/login",
        "/this-is-my-life",
      ],
    },
    sitemap: [`${site.url}/sitemap.xml`, `${toolsBaseUrl}/sitemap.xml`],
  };
}
