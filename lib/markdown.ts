import remarkBreaks from "remark-breaks";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import type { PluggableList } from "unified";

type MdastNode = {
  type: string;
  value?: string;
  url?: string;
  children?: MdastNode[];
};

const RELATIVE_LINK_PATTERN = /(^|[\s([{<])((\/(?!\/)[^\s)\]}>,]+))/g;
const TRAILING_PUNCTUATION = /[),.;:\]!}]+$/;

const linkifyRelativeUrls = () => (tree: MdastNode) => {
  const appendText = (nodes: MdastNode[], value: string) => {
    if (!value) return;
    const last = nodes[nodes.length - 1];
    if (last?.type === "text") {
      last.value = `${last.value ?? ""}${value}`;
      return;
    }
    nodes.push({ type: "text", value });
  };

  const linkifyText = (value: string): MdastNode[] | null => {
    if (!value.includes("/")) return null;
    const regex = new RegExp(RELATIVE_LINK_PATTERN);
    let match: RegExpExecArray | null = null;
    let lastIndex = 0;
    const nodes: MdastNode[] = [];

    while ((match = regex.exec(value))) {
      const matchStart = match.index;
      if (matchStart > lastIndex) {
        appendText(nodes, value.slice(lastIndex, matchStart));
      }

      const leading = match[1] ?? "";
      const rawUrl = match[2] ?? "";
      if (leading) {
        appendText(nodes, leading);
      }

      let url = rawUrl;
      let trailing = "";
      while (url && TRAILING_PUNCTUATION.test(url)) {
        trailing = url.slice(-1) + trailing;
        url = url.slice(0, -1);
      }

      if (url) {
        nodes.push({
          type: "link",
          url,
          children: [{ type: "text", value: url }],
        });
      } else {
        appendText(nodes, rawUrl);
      }

      if (trailing) {
        appendText(nodes, trailing);
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
      appendText(nodes, value.slice(lastIndex));
    }

    return nodes.length ? nodes : null;
  };

  const visit = (node: MdastNode) => {
    if (!node?.children?.length) return;
    if (
      node.type === "link" ||
      node.type === "linkReference" ||
      node.type === "code" ||
      node.type === "inlineCode" ||
      node.type === "html"
    ) {
      return;
    }

    const nextChildren: MdastNode[] = [];
    node.children.forEach((child) => {
      if (child.type === "text" && typeof child.value === "string") {
        const linked = linkifyText(child.value);
        if (linked) {
          nextChildren.push(...linked);
        } else {
          nextChildren.push(child);
        }
        return;
      }
      visit(child);
      nextChildren.push(child);
    });
    node.children = nextChildren;
  };

  visit(tree);
};

export const remarkPlugins: PluggableList = [
  remarkGfm,
  linkifyRelativeUrls,
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
