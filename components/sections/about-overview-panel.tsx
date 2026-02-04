"use client";

import { cn } from "@/lib/utils";
import {
  aboutDetailSections,
  aboutOverviewItems,
  type AboutDetailLine,
  type RichTextChunk,
} from "@/content/pages/about";

const accentText =
  "font-semibold text-emerald-700 underline decoration-emerald-400/70 underline-offset-4 hover:text-emerald-600 dark:text-emerald-300 dark:decoration-emerald-300/70 dark:hover:text-emerald-200";

const renderChunks = (chunks: RichTextChunk[]) => (
  <span className="text-muted-foreground">
    {chunks.map((chunk, index) => {
      const className = cn(
        chunk.emphasis && "font-semibold",
        chunk.tone === "accent" && accentText,
        chunk.tone === "muted" && "text-muted-foreground"
      );

      if (chunk.href) {
        return (
          <a
            key={`${chunk.text}-${index}`}
            href={chunk.href}
            target="_blank"
            rel="noreferrer"
            className={className}
          >
            {chunk.text}
          </a>
        );
      }

      return (
        <span key={`${chunk.text}-${index}`} className={className}>
          {chunk.text}
        </span>
      );
    })}
  </span>
);

const renderDetailLine = (line: AboutDetailLine, index: number) => {
  if (typeof line === "string") {
    return <p key={`${line}-${index}`}>{line}</p>;
  }
  return <p key={`rich-${index}`}>{renderChunks(line)}</p>;
};

export function AboutOverviewPanel({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 sm:gap-8", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-5 sm:rounded-3xl sm:p-6 lg:p-8">
        {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_60%)] opacity-40 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)]" /> */}
        <div className="pointer-events-none absolute inset-0 hidden bg-cover bg-center opacity-30 dark:block"
             style={{ backgroundImage: "url(/images/bg-dark.png)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 dark:hidden"
             style={{ backgroundImage: "url(/images/bg-light.png)" }}
        />
        <div className="relative max-w-2xl">
          <p className="text-base font-semibold leading-snug sm:text-lg">--基本情報--</p>
          <dl className="mt-2 sm:mt-4 grid gap-1.5 text-sm leading-snug sm:gap-4 sm:text-base">
            {aboutOverviewItems.map((item) => (
              <div
                key={item.label}
                className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-2"
              >
                <dt className="text-muted-foreground">{item.label}:</dt>
                <dd className="font-medium text-foreground mx-auto">{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-snug text-muted-foreground">
            ※ 所在地/連絡先は案件に応じてご案内します。
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-8">
        {aboutDetailSections.map((section) => (
          <div key={section.title} className="grid gap-3">
            <p className="text-base font-semibold text-foreground sm:text-lg">
              - {section.title}
            </p>
            <div className="max-w-3xl grid gap-3 text-xs leading-relaxed text-muted-foreground sm:text-base">
              {section.body?.map((line, index) =>
                renderDetailLine(line, index)
              )}
              {section.bullets?.length ? (
                <ul className="grid gap-2 pl-5">
                  {section.bullets.map((item) => (
                    <li key={item} className="list-disc marker:text-primary">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.bodyAfter?.map((line, index) =>
                renderDetailLine(line, index + 100)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
