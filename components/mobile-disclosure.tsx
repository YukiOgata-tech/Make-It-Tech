"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileDisclosure({
  id,
  summary,
  children,
  className,
  openOnHash = false,
}: {
  id?: string;
  summary: string;
  children: React.ReactNode;
  className?: string;
  openOnHash?: boolean;
}) {
  const detailsRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    if (!openOnHash || !id) return;
    const openIfMatch = () => {
      if (window.location.hash === `#${id}`) {
        const node = detailsRef.current;
        if (node && !node.open) {
          node.open = true;
        }
      }
    };
    openIfMatch();
    window.addEventListener("hashchange", openIfMatch);
    return () => window.removeEventListener("hashchange", openIfMatch);
  }, [id, openOnHash]);

  return (
    <details
      id={id}
      ref={detailsRef}
      className={cn("group rounded-2xl border border-border/70 bg-background/70", className)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-1.5 sm:gap-3 px-4 py-2 text-sm font-medium">
        <span>{summary}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/70 px-4 py-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  );
}
