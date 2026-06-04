import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { serviceAreas } from "@/content/pages/services";

const toneClasses = {
  sky: {
    card: "border-sky-200/80 bg-sky-50/70 hover:border-sky-400/70 dark:border-sky-500/20 dark:bg-sky-500/10",
    icon: "border-sky-300/70 bg-sky-100 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/15 dark:text-sky-300",
    arrow: "text-sky-700 dark:text-sky-300",
  },
  violet: {
    card: "border-violet-200/80 bg-violet-50/70 hover:border-violet-400/70 dark:border-violet-500/20 dark:bg-violet-500/10",
    icon: "border-violet-300/70 bg-violet-100 text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/15 dark:text-violet-300",
    arrow: "text-violet-700 dark:text-violet-300",
  },
  emerald: {
    card: "border-emerald-200/80 bg-emerald-50/70 hover:border-emerald-400/70 dark:border-emerald-500/20 dark:bg-emerald-500/10",
    icon: "border-emerald-300/70 bg-emerald-100 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-300",
    arrow: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    card: "border-amber-200/80 bg-amber-50/70 hover:border-amber-400/70 dark:border-amber-500/20 dark:bg-amber-500/10",
    icon: "border-amber-300/70 bg-amber-100 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-300",
    arrow: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    card: "border-rose-200/80 bg-rose-50/70 hover:border-rose-400/70 dark:border-rose-500/20 dark:bg-rose-500/10",
    icon: "border-rose-300/70 bg-rose-100 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/15 dark:text-rose-300",
    arrow: "text-rose-700 dark:text-rose-300",
  },
  lime: {
    card: "border-lime-200/80 bg-lime-50/70 hover:border-lime-400/70 dark:border-lime-500/20 dark:bg-lime-500/10",
    icon: "border-lime-300/70 bg-lime-100 text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/15 dark:text-lime-300",
    arrow: "text-lime-700 dark:text-lime-300",
  },
  indigo: {
    card: "border-indigo-200/80 bg-indigo-50/70 hover:border-indigo-400/70 dark:border-indigo-500/20 dark:bg-indigo-500/10",
    icon: "border-indigo-300/70 bg-indigo-100 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-400/15 dark:text-indigo-300",
    arrow: "text-indigo-700 dark:text-indigo-300",
  },
} as const;

export function ServiceAreaSwap({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3", className)}>
      {serviceAreas.map((area) => {
        const Icon = area.icon;
        const tone = toneClasses[area.tone];

        return (
          <Link
            key={area.title}
            href={area.href}
            className={cn(
              "group relative flex items-start gap-3 overflow-hidden border p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-4",
              tone.card
            )}
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70 dark:bg-white/15" />
            <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border sm:h-11 sm:w-11", tone.icon)}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold tracking-tight sm:text-base">
                {area.title}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                {area.desc}
              </span>
            </span>
            <ArrowRight className={cn("mt-1 h-4 w-4 shrink-0 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100", tone.arrow)} />
          </Link>
        );
      })}
    </div>
  );
}
