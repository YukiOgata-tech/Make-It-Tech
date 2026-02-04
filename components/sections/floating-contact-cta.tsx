"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Easing } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const easeInOut: Easing = [0.45, 0, 0.55, 1];

export function FloatingContactCta({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "pointer-events-none fixed left-0 right-0 top-[calc(var(--header-offset)+20px)] z-40",
        className
      )}
      initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.6, ease: easeInOut }}
    >
      <div className="mx-auto flex max-w-6xl justify-end px-4 sm:px-6 lg:px-8">
        <motion.div
          className="pointer-events-auto"
          whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 5.5, repeat: Infinity, ease: easeInOut }
          }
        >
          <Link
            href="/niigata"
            aria-label="新潟県内企業の方はこちら（ご案内ページ）"
            className={cn(
              "group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(214,214,214,0.85),rgba(255,255,255,0.9))] px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg backdrop-blur",
              "transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(180,180,180,0.12),rgba(255,255,255,0.2))] dark:text-white"
            )}
          >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.85),transparent_55%)] opacity-40 transition-opacity duration-300 group-hover:opacity-90" />
            <span className="pointer-events-none absolute -inset-y-2 -left-1/3 w-1/2 translate-x-[-20%] rotate-6 bg-white/60 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-80" />
            <span className="relative inline-flex items-center gap-2">
              <motion.span
                className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,200,120,0.8)]"
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 1.6, repeat: Infinity, ease: easeInOut }
                }
              />
              <span>新潟県内企業の方はこちら</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
