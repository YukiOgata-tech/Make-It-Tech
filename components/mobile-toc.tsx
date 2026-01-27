"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  title: string;
};

export function MobileTocList({
  items,
  className,
}: {
  items: TocItem[];
  className?: string;
}) {
  const handleClick = React.useCallback((id: string) => {
    if (typeof window === "undefined") return;
    const node = document.getElementById(id) as HTMLDetailsElement | null;
    if (node && node.tagName === "DETAILS") {
      node.open = true;
    }
    window.history.replaceState(null, "", `#${id}`);
    requestAnimationFrame(() => {
      node?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <ul className={cn("grid gap-2 text-sm text-muted-foreground", className)}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => handleClick(item.id)}
            className="w-full text-left hover:text-foreground hover:underline"
          >
            {item.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
