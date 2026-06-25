import { type MetadataRoute } from "next";
import { site } from "@/lib/site";
import { fetchBlogList } from "@/lib/blog-data";
import { fetchAnnouncementList } from "@/lib/announcements-data";

export const dynamic = "force-static";
export const revalidate = false;

const routes = [
  "",
  "/services",
  "/pricing",
  "/about",
  "/contact",
  "/works",
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
  const [blogPosts, announcements] = await Promise.all([
    fetchBlogList().catch(() => []),
    fetchAnnouncementList().catch(() => []),
  ]);
  const blogRoutes = blogPosts
    .filter((post) => post.slug)
    .map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? post.createdAt ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  const announcementRoutes = announcements
    .filter((announcement) => announcement.slug)
    .map((announcement) => ({
      url: `${site.url}/news/${announcement.slug}`,
      lastModified:
        announcement.updatedAt ??
        announcement.publishedAt ??
        announcement.createdAt ??
        undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  return [...staticRoutes, ...blogRoutes, ...announcementRoutes];
}
