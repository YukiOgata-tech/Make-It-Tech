"use client";

import * as React from "react";
import { List } from "lucide-react";
import type { HeadingItem } from "@/lib/markdown-toc";
import { cn } from "@/lib/utils";

const FALLBACK_SCROLL_OFFSET = 120;

/**
 * 記事の目次。PC ではサイドバーに sticky で固定し、スクロール位置に応じて
 * 現在読んでいる見出しをハイライトする。
 *
 * ハイライトの判定位置は先頭見出しの scroll-margin-top から読む
 * （globals.css で固定ヘッダー分を確保している値）。アンカーで飛んだときに
 * 見出しが止まる位置と判定位置をずらさないため。
 */
export function ArticleToc({
  items,
  className,
}: {
  items: HeadingItem[];
  className?: string;
}) {
  const [activeId, setActiveId] = React.useState(items[0]?.id ?? "");

  React.useEffect(() => {
    if (items.length === 0) return;

    let frame = 0;

    const readScrollOffset = () => {
      const first = document.getElementById(items[0].id);
      if (!first) return FALLBACK_SCROLL_OFFSET;
      const value = Number.parseFloat(getComputedStyle(first).scrollMarginTop);
      return Number.isFinite(value) && value > 0 ? value : FALLBACK_SCROLL_OFFSET;
    };

    const update = () => {
      frame = 0;
      const threshold = readScrollOffset() + 4;
      let current = items[0].id;
      for (const item of items) {
        const node = document.getElementById(item.id);
        if (!node) continue;
        if (node.getBoundingClientRect().top > threshold) break;
        current = item.id;
      }

      // 最下部まで来たら最後の見出しを選ぶ。末尾の章が短いと判定位置まで
      // 上がりきらず、手前の見出しが選ばれたままになるため。
      const reachedBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (reachedBottom) current = items[items.length - 1].id;

      setActiveId((prev) => (prev === current ? prev : current));
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [items]);

  return (
    <nav
      aria-label="目次"
      className={cn(
        "rounded-2xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <p className="flex items-center gap-2 border-b border-border/70 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground">
        <List className="h-3.5 w-3.5" aria-hidden />
        目次
      </p>
      <div className="max-h-[calc(100dvh-var(--header-offset)-9rem)] overflow-y-auto overscroll-contain px-4 py-3">
        <ul className="border-l border-border/70">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "-ml-px block border-l-2 py-1.5 pl-3 text-xs leading-snug transition-colors",
                    item.level === 3 && "pl-6 text-[11px]",
                    isActive
                      ? "border-primary font-semibold text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
