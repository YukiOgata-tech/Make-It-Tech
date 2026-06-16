import type { Metadata } from "next";
import { getPublicToolHref, tools, toolsBaseUrl, type ToolItem } from "./tools";

type ToolSeoInput = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
};

export function getToolPath(id: string) {
  return getPublicToolHref(id);
}

export function getToolUrl(id: string) {
  return `${toolsBaseUrl}${getToolPath(id)}`;
}

export function findTool(id: string): ToolItem {
  const tool = tools.find((item) => item.id === id);
  if (!tool) {
    throw new Error(`Unknown tool id: ${id}`);
  }
  return tool;
}

export function createToolMetadata({
  id,
  title,
  description,
  keywords,
}: ToolSeoInput): Metadata {
  const url = getToolUrl(id);
  const tool = findTool(id);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "DevTools by Make It Tech",
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    applicationName: "DevTools by Make It Tech",
    category:
      tool.category === "pdf"
        ? "PDF tool"
        : tool.category === "image"
          ? "Image tool"
          : tool.category === "animation"
            ? "Animation tool"
            : "Developer tool",
  };
}

export function ToolStructuredData({ id }: { id: string }) {
  const tool = findTool(id);
  const url = getToolUrl(id);
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${tool.name} | DevTools by Make It Tech`,
    url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web browser",
    browserRequirements: "Requires JavaScript and a modern web browser.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    description: tool.seoDescription,
    provider: {
      "@type": "Organization",
      name: "Make It Tech",
      url: "https://make-it-tech.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
