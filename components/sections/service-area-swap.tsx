"use client";

import * as React from "react";
import { LayoutGroup, motion, useReducedMotion, type Easing } from "framer-motion";
import { cn } from "@/lib/utils";
import { serviceAreas } from "@/content/pages/services";

const easeOut: Easing = [0.22, 1, 0.36, 1];

const slots = [
  "md:col-span-2 lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-6",
  "lg:col-span-6",
];

export function ServiceAreaSwap({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [featuredTitle, setFeaturedTitle] = React.useState<string>(serviceAreas[0]?.title ?? "");

  const orderedAreas = React.useMemo(() => {
    if (!featuredTitle) return serviceAreas;
    const featured = serviceAreas.find((area) => area.title === featuredTitle) ?? serviceAreas[0];
    const rest = serviceAreas.filter((area) => area.title !== featured.title);
    return [featured, ...rest];
  }, [featuredTitle]);

  return (
    <LayoutGroup>
      <div className={cn("hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-12 lg:grid-flow-row-dense", className)}>
        {orderedAreas.map((area, index) => {
          const Icon = area.icon;
          const isFeatured = area.title === featuredTitle;
          const slotClass = slots[index] ?? "lg:col-span-6";

          return (
            <motion.button
              key={area.title}
              type="button"
              layout
              layoutId={`service-area-${area.title}`}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: easeOut }}
              onClick={() => {
                if (area.title !== featuredTitle) {
                  setFeaturedTitle(area.title);
                }
              }}
              aria-pressed={isFeatured}
              className={cn(
                "group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/80 text-left shadow-sm backdrop-blur",
                "transition-shadow duration-300 hover:shadow-lg",
                isFeatured ? "p-6 sm:p-8" : "p-5 sm:p-6",
                slotClass
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-cover bg-bottom transition-opacity duration-300 dark:hidden",
                  isFeatured ? "opacity-35" : "opacity-20"
                )}
                style={{ backgroundImage: "url(/images/bg-3-light.png)" }}
              />
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 hidden bg-cover bg-bottom transition-opacity duration-300 dark:block",
                  isFeatured ? "opacity-35" : "opacity-20"
                )}
                style={{ backgroundImage: "url(/images/bg-3-dark.png)" }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_60%)] opacity-35 transition-opacity duration-300 group-hover:opacity-60 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)]" />
              <div className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary/70 via-transparent to-primary/20" />

              <div className={cn("relative flex items-start gap-4", isFeatured && "gap-5")}>  
                <div
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary",
                    isFeatured ? "h-12 w-12" : "h-10 w-10"
                  )}
                >
                  <Icon className={cn(isFeatured ? "h-6 w-6" : "h-5 w-5")} />
                </div>
                <div className="grid gap-2">
                  <p
                    className={cn(
                      "font-semibold tracking-tight",
                      isFeatured ? "text-xl sm:text-2xl" : "text-base"
                    )}
                  >
                    {area.title}
                  </p>
                  <p className={cn("text-muted-foreground", isFeatured ? "text-base" : "text-sm")}>
                    {area.desc}
                  </p>
                </div>
              </div>

              <div className={cn("relative mt-5", isFeatured && "mt-6")}>  
                <ul className={cn("grid gap-2", isFeatured && "gap-3")}>  
                  {(isFeatured ? area.items : area.items.slice(0, 3)).map((item) => (
                    <li key={item} className={cn("flex items-start gap-2", isFeatured && "text-base")}>  
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                      <span className={cn(!isFeatured && "text-sm text-muted-foreground")}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                {!isFeatured && area.items.length > 3 ? (
                  <p className="mt-2 text-xs text-muted-foreground">…他 {area.items.length - 3} 件</p>
                ) : null}
              </div>

              {isFeatured && (
                <div className="relative mt-auto pt-6 text-xs text-muted-foreground">
                  クリックで他の領域も確認できます。
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
