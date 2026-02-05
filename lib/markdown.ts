import remarkBreaks from "remark-breaks";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import type { PluggableList } from "unified";

export const remarkPlugins: PluggableList = [
  remarkGfm,
  remarkBreaks,
  remarkEmoji,
  remarkSmartypants,
];

export const rehypePlugins: PluggableList = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "wrap",
      properties: {
        className: ["anchor-link"],
      },
    },
  ],
  [
    rehypeExternalLinks,
    {
      rel: ["noreferrer", "noopener"],
      target: "_blank",
    },
  ],
  [rehypeHighlight, { ignoreMissing: true }],
];
