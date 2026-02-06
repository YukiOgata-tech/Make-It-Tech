import { type MetadataRoute } from "next";
import { site } from "@/lib/site";
import { fetchBlogSlugs } from "@/lib/blog-data";

const routes = [
  "",
  "/services",
  "/pricing",
  "/about",
  "/contact",
  "/survey",
  "/news",
  "/blog",
  "/privacy",
  "/terms",
  "/security-policy",
  "/glossary",
  "/niigata",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogSlugs = await fetchBlogSlugs().catch(() => []);
  const blogRoutes = blogSlugs.map((slug) => `/blog/${slug}`);
  const combinedRoutes = [...routes, ...blogRoutes];
  return combinedRoutes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
