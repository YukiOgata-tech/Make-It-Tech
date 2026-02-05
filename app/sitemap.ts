import { type MetadataRoute } from "next";
import { site } from "@/lib/site";

const routes = [
  "",
  "/services",
  "/pricing",
  "/about",
  "/contact",
  "/survey",
  "/privacy",
  "/terms",
  "/security-policy",
  "/glossary",
  "/niigata",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
