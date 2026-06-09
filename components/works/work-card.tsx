/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
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
  const isSeatMapPreview = work.previewType === "seat-map";
  const isChatbotImagePreview = work.previewType === "chatbot-images";

  return (
    <div className="mx-auto w-full">
      <div className="sm:hidden">
        <div className="mx-auto w-52.5 max-w-full rounded-[1.6rem] border border-border/70 bg-foreground/10 p-1.5 shadow-sm">
          <div
            className={cn(
              "relative aspect-390/844 overflow-hidden rounded-2xl bg-linear-to-br",
              toneClasses[work.previewTone]
            )}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-5 items-center justify-center bg-black/80">
              <span className="h-1.5 w-12 rounded-full bg-white/20" />
            </div>
            {isChatbotImagePreview ? (
              <ImageSlotPreview
                src={work.previewMobileImageUrl}
                alt={work.previewImageAlt ?? `${work.companyName} mobile preview`}
                label="スマホ画面"
              />
            ) : isSeatMapPreview ? (
              <StudyRoomPreview />
            ) : isLivePreview ? (
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
              "relative aspect-16/10 overflow-hidden rounded-xl bg-linear-to-br",
              toneClasses[work.previewTone]
            )}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex h-7 items-center gap-1 border-b border-black/10 bg-white/85 px-2">
              <span className="h-2 w-2 rounded-full bg-red-300" />
              <span className="h-2 w-2 rounded-full bg-yellow-300" />
              <span className="h-2 w-2 rounded-full bg-green-300" />
              <span className="ml-2 h-3 flex-1 rounded-full bg-muted" />
            </div>
            {isChatbotImagePreview ? (
              <ImageSlotPreview
                src={work.previewDesktopImageUrl}
                alt={work.previewImageAlt ?? `${work.companyName} desktop preview`}
                label="PC画面"
                desktop
              />
            ) : isSeatMapPreview ? (
              <StudyRoomPreview desktop />
            ) : isLivePreview ? (
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

function ImageSlotPreview({
  src,
  alt,
  label,
  desktop = false,
}: {
  src?: string;
  alt: string;
  label: string;
  desktop?: boolean;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          desktop ? "pt-7" : "pt-5"
        )}
        loading="lazy"
      />
    );
  }

  return (
    <div className={cn("absolute inset-0 grid place-items-center", desktop ? "pt-7" : "pt-5")}>
      {!desktop ? (
        <div className="relative grid h-full w-full place-items-center overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-white/45 via-white/20 to-primary/20" />
          <div className="relative mx-auto grid w-[82%] gap-2 rounded-2xl border border-white/70 bg-white/80 p-3 text-center shadow-sm backdrop-blur">
            <p className="text-[11px] font-semibold leading-snug text-foreground">
              右下のチャットボタンを見てください
            </p>
            <p className="text-[8px] leading-snug text-muted-foreground">
              このサイトでも同様のAIチャットを運用中
            </p>
          </div>
          <div className="absolute bottom-3 right-2 flex items-center gap-1 rounded-full bg-[#111827] px-2 py-1 text-[8px] font-semibold text-white shadow-lg">
            <span className="grid size-5 place-items-center rounded-full bg-white text-[10px]">AI</span>
            チャット
          </div>
        </div>
      ) : (
        <div className="grid w-[72%] gap-2 rounded-2xl border border-white/70 bg-white/70 p-3 text-center shadow-sm backdrop-blur">
          <p className="text-[10px] font-semibold text-foreground sm:text-xs">{label}</p>
          <p className="text-[8px] leading-snug text-muted-foreground sm:text-[10px]">
            画像追加予定
          </p>
        </div>
      )}
    </div>
  );
}

const studyRoomSeats = [
  { id: "A1", x: 18, y: 24, status: "available" },
  { id: "A2", x: 36, y: 24, status: "used" },
  { id: "A3", x: 54, y: 24, status: "available" },
  { id: "A4", x: 72, y: 24, status: "used" },
  { id: "B1", x: 18, y: 45, status: "used" },
  { id: "B2", x: 36, y: 45, status: "available" },
  { id: "B3", x: 54, y: 45, status: "leaving" },
  { id: "B4", x: 72, y: 45, status: "available" },
  { id: "C1", x: 24, y: 68, status: "available" },
  { id: "C2", x: 45, y: 68, status: "used" },
  { id: "C3", x: 66, y: 68, status: "available" },
] as const;

const statusStyles = {
  available: "border-emerald-600 bg-emerald-100 text-emerald-800",
  used: "border-rose-600 bg-rose-100 text-rose-800",
  leaving: "border-amber-600 bg-amber-100 text-amber-800",
};

const statusLabels = {
  available: "空",
  used: "満",
  leaving: "退",
};

function StudyRoomPreview({ desktop = false }: { desktop?: boolean }) {
  const [selectedSeatId, setSelectedSeatId] = useState("B3");
  const selectedSeat = useMemo(
    () => studyRoomSeats.find((seat) => seat.id === selectedSeatId) ?? studyRoomSeats[0],
    [selectedSeatId]
  );
  const counts = useMemo(
    () => ({
      available: studyRoomSeats.filter((seat) => seat.status === "available").length,
      used: studyRoomSeats.filter((seat) => seat.status === "used").length,
      leaving: studyRoomSeats.filter((seat) => seat.status === "leaving").length,
    }),
    []
  );

  if (desktop) {
    return (
      <div className="absolute inset-0 bg-[#eef4f1] pt-7">
        <div className="relative h-full">
          <div className="absolute left-3 right-3 top-2 z-20 flex h-6 items-center justify-between rounded-md border border-[#d4e0dc] bg-white/90 px-2 shadow-sm backdrop-blur">
            <div>
              <p className="text-[7px] font-semibold leading-none text-[#1d3238]">Study Room Live Board</p>
              <p className="mt-0.5 text-[4px] font-medium text-muted-foreground">18:42 auto sync</p>
            </div>
            <div className="flex gap-0.5 text-[4px] font-semibold">
              <StatusPill label="空" value={counts.available} className="bg-emerald-50 text-emerald-800" />
              <StatusPill label="満" value={counts.used} className="bg-rose-50 text-rose-800" />
              <StatusPill label="退" value={counts.leaving} className="bg-amber-50 text-amber-800" />
            </div>
          </div>

          <div className="relative h-full overflow-hidden bg-[#fbfdfb]">
            <div className="absolute left-[4%] top-[10%] h-[72%] w-[6%] rounded bg-[#e4eee8]" />
            <div className="absolute left-[15%] top-[12%] h-[13%] w-[63%] rounded-md bg-[#edf5f1]" />
            <div className="absolute bottom-[10%] left-[14%] h-[6%] w-[64%] rounded-md bg-[#e4eee8]" />
            <div className="absolute right-[5%] top-[12%] h-[16%] w-[9%] rounded-md border border-[#cad9d4] bg-[#f2f7f4]" />
            <div className="absolute right-[5%] top-[36%] h-[31%] w-[9%] rounded-md border border-[#cad9d4] bg-[#f2f7f4]" />
            <div className="absolute bottom-[6%] right-[7%] rounded bg-[#1d3238] px-1 py-0.5 text-[4px] font-semibold text-white">
              ENTRANCE
            </div>
            <div className="absolute left-[18%] top-[32%] h-[29%] w-[52%] rounded-lg border border-dashed border-[#c6d8d2] bg-[#f7faf8]" />

            {studyRoomSeats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                onClick={() => setSelectedSeatId(seat.id)}
                className={cn(
                  "absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded border text-[4px] font-bold shadow-sm transition",
                  "h-4 w-6",
                  statusStyles[seat.status],
                  selectedSeatId === seat.id && "ring-2 ring-[#1d3238] ring-offset-1"
                )}
                style={{ left: `${seat.x}%`, top: `${seat.y + 1}%` }}
                aria-label={`${seat.id} ${statusLabels[seat.status]}`}
              >
                <span>{seat.id}</span>
              </button>
            ))}

            <div className="absolute bottom-2 left-3 z-20 w-[22%] rounded-md border border-[#d4e0dc] bg-white/90 p-1 shadow-sm backdrop-blur">
              <p className="text-[4px] font-semibold text-muted-foreground">selected</p>
              <div className="mt-0.5 flex items-end justify-between gap-1">
                <p className="text-[9px] font-semibold leading-none text-[#1d3238]">{selectedSeat.id}</p>
                <p className="text-[4px] font-semibold text-muted-foreground">
                  {selectedSeat.status === "available" ? "利用可" : selectedSeat.status === "used" ? "利用中" : "退室待ち"}
                </p>
              </div>
            </div>

            <div className="absolute bottom-2 right-3 z-20 grid w-[20%] gap-0.5 rounded-md border border-[#d4e0dc] bg-white/90 p-1 text-[4px] shadow-sm backdrop-blur">
              <LogRow time="18:40" text="B3 退室QR" />
              <LogRow time="18:12" text="A4 入室" />
              <LogRow time="17:58" text="C2 延長" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#f6faf7] pt-5">
      <div className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-1 p-1.5">
        <div className="flex h-7 items-center justify-between rounded-md border border-[#d7e4df] bg-white px-1.5 shadow-sm">
          <div>
            <p className="text-[6px] font-bold leading-none text-[#1f3439]">自習室</p>
            <p className="mt-0.5 text-[4px] font-medium text-muted-foreground">live occupancy</p>
          </div>
          <div className="grid size-5 place-items-center rounded bg-[#1f3439] text-[4px] font-bold leading-tight text-white">
            QR
          </div>
        </div>

        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <p className="text-[5px] font-bold text-[#1f3439]">seat map</p>
            <p className="text-[4px] font-medium text-muted-foreground">18:42</p>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[4px]">
            <StatusPill label="空席" value={counts.available} className="bg-emerald-50 text-emerald-800" />
            <StatusPill label="利用中" value={counts.used} className="bg-rose-50 text-rose-800" />
            <StatusPill label="退室待ち" value={counts.leaving} className="bg-amber-50 text-amber-800" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white shadow-inner">
          <div className="absolute left-[6%] top-[8%] h-[82%] w-[6%] rounded bg-[#e7eee8]" />
          <div className="absolute right-[7%] top-[10%] h-[18%] w-[9%] rounded border border-[#cddbd6] bg-[#eef5f1]" />
          <div className="absolute bottom-[6%] left-[7%] h-[6%] w-[74%] rounded bg-[#e7eee8]" />
          <div className="absolute left-[22%] top-[13%] h-[48%] w-[42%] rounded-lg border border-dashed border-[#cddbd6]" />
          <div className="absolute right-[12%] bottom-[14%] rounded-full bg-[#eef5f1] px-1 py-0.5 text-[4px] font-semibold text-[#3d4950]">
            入口
          </div>
          {studyRoomSeats.map((seat) => (
            <button
              key={seat.id}
              type="button"
              onClick={() => setSelectedSeatId(seat.id)}
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-bold shadow-sm transition",
                "size-4 text-[4px]",
                statusStyles[seat.status],
                selectedSeatId === seat.id && "ring-2 ring-[#1f3439] ring-offset-1"
              )}
              style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
              aria-label={`${seat.id} ${statusLabels[seat.status]}`}
            >
              {statusLabels[seat.status]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-1 rounded-md border border-[#d5e4df] bg-white p-1 shadow-sm">
          <div>
            <p className="text-[5px] font-semibold text-[#1f3439]">{selectedSeat.id}席</p>
            <p className="text-[4px] font-medium text-muted-foreground">
              {selectedSeat.status === "available" ? "利用できます" : selectedSeat.status === "used" ? "利用中です" : "退室処理待ちです"}
            </p>
          </div>
          <div className="rounded bg-secondary px-1 py-0.5 text-[4px] font-semibold text-secondary-foreground">
            管理画面
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={cn("rounded px-1 py-0.5 font-semibold leading-none", className)}>
      <span>{label}</span>
      <span className="ml-1">{value}</span>
    </div>
  );
}

function LogRow({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex items-center justify-between rounded bg-[#f6faf7] px-1 py-0.5">
      <span className="font-semibold text-[#1d3238]">{time}</span>
      <span className="text-muted-foreground">{text}</span>
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

        {work.url ? (
          <Link
            href={work.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-xl border border-border/70 px-2 text-[10px] font-semibold transition hover:bg-muted sm:h-10 sm:px-3 sm:text-sm"
          >
            {work.linkLabel ?? "サイトを見る"} <ArrowUpRight className="ml-1 size-3.5 sm:size-4" />
          </Link>
        ) : (
          <div className="inline-flex h-8 items-center justify-center rounded-xl border border-border/70 bg-muted/50 px-2 text-[10px] font-semibold text-muted-foreground sm:h-10 sm:px-3 sm:text-sm">
            非公開システム
          </div>
        )}
      </div>
    </article>
  );
}



