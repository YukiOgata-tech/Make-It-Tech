import type { Metadata } from "next";
import { getPublicToolHref, getToolsMetaImage, tools, toolsBaseUrl, toolsMetaImageUrl, type ToolItem } from "./tools";

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
  const metaImage = getToolsMetaImage(tool.category);

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
      images: [
        {
          url: metaImage.url,
          width: metaImage.width,
          height: metaImage.height,
          alt: metaImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [metaImage.url],
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
  const metaImage = getToolsMetaImage(tool.category);
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
    image: metaImage.url,
    provider: {
      "@type": "Organization",
      name: "Make It Tech",
      url: "https://make-it-tech.com",
      logo: toolsMetaImageUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
