/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkItem } from "@/content/works";

const toneClasses: Record<WorkItem["previewTone"], string> = {
  coral: "from-[#f7d6c9] via-[#fff8f2] to-[#dcefed]",
  teal: "from-[#cce9e4] via-[#f8fbf9] to-[#f5e3c0]",
  sun: "from-[#f5dfac] via-[#fffaf0] to-[#d8ece8]",
  ink: "from-[#d5dde0] via-[#f8faf9] to-[#ead7c9]",
};

function WorkPreview({ work }: { work: WorkItem }) {
  const isLivePreview = work.previewType === "live" && work.previewUrl;

  return (
    <div className="mx-auto w-full">
      <div className="sm:hidden">
        <div className="mx-auto w-[210px] max-w-full rounded-[1.6rem] border border-border/70 bg-foreground/10 p-1.5 shadow-sm">
          <div
            className={cn(
              "relative aspect-[390/844] overflow-hidden rounded-[1.25rem] bg-gradient-to-br",
              toneClasses[work.previewTone]
            )}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-5 items-center justify-center bg-black/80">
              <span className="h-1.5 w-12 rounded-full bg-white/20" />
            </div>
            {isLivePreview ? (
              <>
                <iframe
                  title={`${work.companyName} mobile preview`}
                  src={work.previewUrl}
                  loading="lazy"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 h-[186%] w-[186%] origin-top-left scale-[0.538] border-0 bg-white"
                  sandbox="allow-same-origin allow-scripts"
                />
                <div className="absolute inset-0 z-30 cursor-default bg-transparent" aria-hidden="true" />
              </>
            ) : (
              <MockPreview />
            )}
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="rounded-2xl border border-border/70 bg-foreground/5 p-2 shadow-sm">
          <div
            className={cn(
              "relative aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br",
              toneClasses[work.previewTone]
            )}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-7 items-center gap-1 border-b border-black/10 bg-white/85 px-2">
              <span className="h-2 w-2 rounded-full bg-red-300" />
              <span className="h-2 w-2 rounded-full bg-yellow-300" />
              <span className="h-2 w-2 rounded-full bg-green-300" />
              <span className="ml-2 h-3 flex-1 rounded-full bg-muted" />
            </div>
            {isLivePreview ? (
              <>
                <iframe
                  title={`${work.companyName} desktop preview`}
                  src={work.previewUrl}
                  loading="lazy"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-7 h-[370%] w-[370%] origin-top-left scale-[0.27] border-0 bg-white"
                  sandbox="allow-same-origin allow-scripts"
                />
                <div className="absolute inset-0 z-30 cursor-default bg-transparent" aria-hidden="true" />
              </>
            ) : (
              <MockPreview desktop />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockPreview({ desktop = false }: { desktop?: boolean }) {
  return (
    <div className={cn("absolute grid gap-1.5", desktop ? "inset-x-5 top-11 gap-3" : "inset-x-3 top-9")}>
      <div className={cn("rounded-full bg-foreground/20", desktop ? "h-4 w-32" : "h-3 w-20")} />
      <div className={cn("rounded-xl bg-white/75 p-2", desktop ? "h-16" : "h-12")}>
        <div className={cn("w-2/3 rounded-full bg-foreground/25", desktop ? "h-3" : "h-2")} />
        <div className={cn("w-1/2 rounded-full bg-foreground/15", desktop ? "mt-2 h-3" : "mt-1.5 h-2")} />
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        <div className={cn("rounded-xl bg-white/65", desktop ? "h-20" : "h-12")} />
        <div className={cn("rounded-xl bg-white/55", desktop ? "h-20" : "h-12")} />
      </div>
    </div>
  );
}

export function WorkCard({ work, compact = false }: { work: WorkItem; compact?: boolean }) {
  return (
    <article className="group rounded-2xl border border-border/60 bg-background/75 p-2 shadow-sm transition hover:border-primary/35 sm:rounded-3xl sm:p-4">
      <div className="grid gap-2 sm:gap-3">
        <WorkPreview work={work} />

        <div className="grid gap-1 sm:gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold text-secondary-foreground sm:text-xs">
              {work.category}
            </span>
            {!work.isPublic ? (
              <span className="rounded-full border border-border/70 px-2 py-0.5 text-[9px] text-muted-foreground sm:text-xs">
                匿名掲載
              </span>
            ) : null}
          </div>
          <div className="flex min-h-8 items-center gap-2 sm:gap-3">
            {work.logoUrl ? (
              <img
                src={work.logoUrl}
                alt={`${work.companyName} ロゴ`}
                className="h-7 w-auto max-w-[96px] object-contain sm:h-9 sm:max-w-[130px]"
                loading="lazy"
              />
            ) : null}
            <h3 className="text-sm font-semibold leading-snug sm:text-lg">{work.companyName}</h3>
          </div>
          <p className="text-xs font-medium leading-snug sm:text-base">{work.title}</p>
          <p className={cn("text-[10px] leading-4 text-muted-foreground sm:text-sm sm:leading-6", compact && "sm:line-clamp-2")}>
            {work.summary}
          </p>
        </div>

        <div className="grid gap-1">
          <p className="text-[9px] font-semibold text-muted-foreground sm:text-xs">実施内容</p>
          <div className="flex flex-wrap gap-1">
            {work.scope.slice(0, compact ? 3 : 4).map((item) => (
              <span key={item} className="rounded-lg border border-border/60 px-1.5 py-0.5 text-[9px] text-muted-foreground sm:text-xs">
                {item}
              </span>
            ))}
          </div>
        </div>

        {!compact ? (
          <ul className="grid gap-1 text-[10px] leading-4 text-muted-foreground sm:text-sm sm:leading-6">
            {work.results.map((result) => (
              <li key={result} className="flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/70" />
                <span>{result}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          href={work.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center justify-center rounded-xl border border-border/70 px-2 text-[10px] font-semibold transition hover:bg-muted sm:h-10 sm:px-3 sm:text-sm"
        >
          サイトを見る <ArrowUpRight className="ml-1 size-3.5 sm:size-4" />
        </Link>
      </div>
    </article>
  );
}






