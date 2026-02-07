import { type MetadataRoute } from "next";
import { site } from "@/lib/site";
import { fetchBlogList } from "@/lib/blog-data";

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
  const blogPosts = await fetchBlogList().catch(() => []);
  const blogRoutes = blogPosts
    .filter((post) => post.slug)
    .map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? post.createdAt ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
