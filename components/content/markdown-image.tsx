import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  getImagePresetKey,
  getImagePresetMeta,
} from "@/lib/markdown-image";

type MarkdownImageProps = ImgHTMLAttributes<HTMLImageElement>;

export function MarkdownImage({ src, alt = "", title }: MarkdownImageProps) {
  if (!src) return null;
  const presetKey = getImagePresetKey(title);
  const preset = getImagePresetMeta(presetKey);
  const sizeClass = `article-image--${preset.size}`;
  const alignClass = `article-image--${preset.align}`;

  return (
    <figure className={cn("article-image", sizeClass, alignClass)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="article-image__img"
      />
    </figure>
  );
}
