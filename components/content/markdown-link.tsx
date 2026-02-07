import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

type MarkdownLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

const siteUrl = site.url.replace(/\/+$/, "");
const siteHost = (() => {
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return "";
  }
})();

function isExternalHref(rawHref?: string) {
  if (!rawHref) return false;
  const href = rawHref.trim();
  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("/")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;

  if (href.startsWith("//")) {
    try {
      const url = new URL(`https:${href}`);
      return siteHost ? url.hostname !== siteHost : true;
    } catch {
      return true;
    }
  }

  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      return siteHost ? url.hostname !== siteHost : true;
    } catch {
      return true;
    }
  }

  return false;
}

export function MarkdownLink({ href = "", className, ...props }: MarkdownLinkProps) {
  const isExternal = isExternalHref(href);
  return (
    <a
      href={href}
      className={cn(
        "article-link",
        isExternal ? "article-link--external" : "article-link--internal",
        className
      )}
      {...props}
    />
  );
}
