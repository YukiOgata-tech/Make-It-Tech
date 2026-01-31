"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { experiences } from "@/content/sections/experience-deck";

function getOffset(index: number, activeIndex: number, total: number) {
  const raw = index - activeIndex;
  const half = Math.floor(total / 2);
  return ((raw + total + half) % total) - half;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, [query]);

  return matches;
}

export function ExperienceDeck({ className }: { className?: string }) {
  const total = experiences.length;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const isCompact = useMediaQuery("(max-width: 640px)");
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const wheelLockRef = React.useRef(0);
  const wheelDeltaRef = React.useRef(0);
  const touchRef = React.useRef({
    id: -1,
    startX: 0,
    startY: 0,
    tracking: false,
    lockedAxis: "" as "x" | "y" | "",
  });

  const cardWidth = isCompact ? 230 : 300;
  const cardHeight = Math.round(cardWidth * 1.4);
  const spacing = isCompact ? 145 : 250;
  const stageHeight = isCompact ? 440 : 560;
  const baseY = isCompact ? -8 : -20;
  const anchorY = isCompact ? 48 : 45;

  const progress = ((activeIndex + 1) / total) * 100;

  const handleCardClick = (index: number) => {
    if (index === activeIndex) {
      setFlipped((prev) => !prev);
      return;
    }
    setActiveIndex(index);
    setFlipped(false);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
    setFlipped(false);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
    setFlipped(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrev();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    }
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") {
      return;
    }
    touchRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      tracking: true,
      lockedAxis: "",
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      if (reduceMotion) {
        return;
      }
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: -y * 6, y: x * 8 });
      return;
    }

    if (event.pointerType !== "touch") {
      return;
    }
    if (touchRef.current.id !== event.pointerId || !touchRef.current.tracking) {
      return;
    }

    const dx = event.clientX - touchRef.current.startX;
    const dy = event.clientY - touchRef.current.startY;

    if (!touchRef.current.lockedAxis) {
      if (Math.abs(dx) > Math.abs(dy) + 6) {
        touchRef.current.lockedAxis = "x";
      } else if (Math.abs(dy) > Math.abs(dx) + 6) {
        touchRef.current.lockedAxis = "y";
      }
    }

    if (touchRef.current.lockedAxis) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") {
      return;
    }
    if (touchRef.current.id !== event.pointerId) {
      return;
    }

    const dx = event.clientX - touchRef.current.startX;
    const dy = event.clientY - touchRef.current.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const touchThreshold = isCompact ? 70 : 60;

    if (touchRef.current.lockedAxis === "x" && absX > touchThreshold) {
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    if (touchRef.current.lockedAxis === "y" && absY > touchThreshold) {
      if (dy < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchRef.current = {
      id: -1,
      startX: 0,
      startY: 0,
      tracking: false,
      lockedAxis: "",
    };
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (isCompact) {
      return;
    }
    const absX = Math.abs(event.deltaX);
    const absY = Math.abs(event.deltaY);
    if (absX > absY) {
      event.preventDefault();
      event.stopPropagation();
    }
    const now = performance.now();
    const cooldown = 700;
    const delta = absX > absY
      ? event.deltaX
      : event.deltaY;

    wheelDeltaRef.current += delta;

    if (Math.abs(wheelDeltaRef.current) < 110) {
      return;
    }

    if (now - wheelLockRef.current < cooldown) {
      return;
    }

    if (wheelDeltaRef.current > 0) {
      handleNext();
    } else {
      handlePrev();
    }

    wheelDeltaRef.current = 0;
    wheelLockRef.current = now;
    event.preventDefault();
  };

  React.useEffect(() => {
    setFlipped(false);
  }, [activeIndex]);

  return (
    <div
      className={cn(
        "relative w-full overflow-x-hidden sm:left-1/2 sm:right-1/2 sm:-mx-[50vw] sm:w-screen",
        className
      )}
    >
      <div className="relative pt-2 pb-2 sm:pt-6 sm:pb-14">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-lg overflow-hidden bg-gradient-to-br from-[#FFE3C8] via-[#F6E9DA] to-[#CFEAE6] dark:from-[#0E1A1F] dark:via-[#142429] dark:to-[#0F1D21]">
          <div className="absolute inset-0 bg-grid opacity-40 dark:opacity-15" />
          <motion.div
            className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#FFB47C]/50 blur-[110px] dark:bg-[#37515A]/70"
            animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-20 bottom-4 h-72 w-72 rounded-full bg-[#7BD3C2]/50 blur-[130px] dark:bg-[#2C4A52]/70"
            animate={reduceMotion ? undefined : { y: [0, 14, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-[#FF8A9C]/30 blur-[120px] dark:bg-[#352026]/60"
            animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-0.5 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/70 dark:border-white/10 dark:bg-white/10 dark:text-white/70">
                <Sparkles className="h-4 w-4" />
                Featured
              </span>
              <span className="text-xs text-foreground/80">
                正面カードをクリックで詳細表示
              </span>
            </div>
            <div className="flex items-center gap-7">
              <div className="flex items-center gap-3 text-xs text-foreground/60">
                <div className="h-1 w-24 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-1 rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="min-w-14 text-right">
                  {activeIndex + 1} / {total}
                </span>
              </div>
              <div className="flex items-center gap-3 ">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-black/10 bg-white/70 text-black/70 shadow-[0_12px_30px_rgba(12,18,24,0.15)] transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white/70"
                  aria-label="前の実績"
                >
                  <ArrowLeft className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-black/10 bg-white/70 text-black/70 shadow-[0_12px_30px_rgba(12,18,24,0.15)] transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white/70"
                  aria-label="次の実績"
                >
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={stageRef}
            role="region"
            aria-label="対応実績のカード"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            className="relative mt-2 sm:mt-6 overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            style={{
              height: stageHeight,
              perspective: "1600px",
              contain: "layout paint size",
              overscrollBehaviorX: "contain",
              touchAction: isCompact ? "none" : "pan-y",
            }}
          >
            {experiences.map((exp, index) => {
              const offset = getOffset(index, activeIndex, total);
              const abs = Math.abs(offset);
              const isActive = index === activeIndex;
              const visible = abs <= 2;
              const x = offset * spacing;
              const y = baseY + abs * (isCompact ? 18 : 24);
              const scale = isActive ? 1 : 0.92 - abs * 0.05;
              const rotateY = offset * -18 + (isActive ? tilt.y : 0);
              const rotateX = isActive ? tilt.x : 0;
              const rotateZ = offset * -2;
              const opacity = visible ? 1 - abs * 0.25 : 0;
              const zIndex = 30 - abs;

              return (
                <motion.div
                  key={exp.id}
                  className="absolute left-1/2"
                  animate={{
                    x,
                    y,
                    scale,
                    rotateY,
                    rotateX,
                    rotateZ,
                    opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 22,
                    duration: reduceMotion ? 0 : 0.5,
                  }}
                  style={{
                    top: `${anchorY}%`,
                    zIndex,
                    transformStyle: "preserve-3d",
                    pointerEvents: visible ? "auto" : "none",
                  }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="relative"
                      style={{ width: cardWidth, height: cardHeight }}
                    >
                      <div className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-40 -translate-x-1/2 rounded-full bg-black/20 blur-xl dark:bg-black/50" />
                      <button
                        type="button"
                        onClick={() => handleCardClick(index)}
                        aria-hidden={!visible}
                        tabIndex={visible ? 0 : -1}
                        aria-label={
                          isActive
                            ? `${exp.title}の詳細を${flipped ? "閉じる" : "見る"}`
                            : `${exp.title}を表示`
                        }
                        className={cn(
                          "relative h-full w-full cursor-pointer select-none rounded-[2.2rem] border-2 border-black/15 text-left text-slate-900 shadow-[0_30px_70px_rgba(12,18,24,0.25)] transition-transform duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 dark:border-white/10 dark:text-slate-100 dark:shadow-[0_30px_70px_rgba(0,0,0,0.45)]",
                          exp.theme.surface
                        )}
                        style={{
                          transformStyle: "preserve-3d",
                          transform:
                            isActive && flipped
                              ? "rotateY(180deg)"
                              : "rotateY(0deg)",
                          transition: reduceMotion
                            ? "none"
                            : "transform 0.65s ease",
                        }}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 rounded-[2.2rem] p-6",
                            isCompact && "p-4"
                          )}
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <div
                            className={cn(
                              "absolute inset-0 rounded-[2.2rem] bg-gradient-to-br",
                              exp.theme.halo
                            )}
                          />
                          <div className="relative flex h-full flex-col justify-between">
                            <div
                              className={cn(
                                "flex items-center justify-between uppercase tracking-[0.25em]",
                                isCompact ? "text-[10px]" : "text-[11px]"
                              )}
                            >
                              <span
                                className={cn(
                                  "rounded-full px-3 py-1 font-semibold",
                                  isCompact && "px-2 py-0.5",
                                  exp.theme.badge
                                )}
                              >
                                {exp.category}
                              </span>
                              <span
                                className={cn(
                                  "text-foreground/80",
                                  isCompact ? "text-[10px]" : "text-[11px]"
                                )}
                              >
                                Case {String(index + 1).padStart(2, "0")}
                              </span>
                            </div>

                            <div
                              className={cn(
                                "mt-6 flex h-32 items-center justify-center rounded-[1.6rem] border px-4 text-3xl font-semibold tracking-[0.2em]",
                                isCompact && "mt-4 h-24 text-2xl tracking-[0.12em]",
                                exp.theme.accent
                              )}
                            >
                              {exp.mark}
                            </div>

                            <div className={cn("mt-6", isCompact && "mt-4")}>
                              <h3
                                className={cn(
                                  "text-lg font-semibold",
                                  isCompact && "text-base"
                                )}
                              >
                                {exp.title}
                              </h3>
                              <p
                                className={cn(
                                  "mt-2 text-sm text-foreground font-semibold",
                                  isCompact && "mt-1 text-xs"
                                )}
                              >
                                {exp.summary}
                              </p>
                            </div>

                            <div
                              className={cn(
                                "flex items-center justify-between text-foreground/80",
                                isCompact ? "text-[10px]" : "text-[11px]"
                              )}
                            >
                              <span>クリックで詳細を見る</span>
                              <span className="font-semibold">
                                {exp.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className="absolute inset-0 rounded-[2.2rem] overflow-hidden bg-white/80 text-black dark:bg-[#121E22]/80 dark:text-white"
                          style={{
                            transform: "rotateY(180deg)",
                            backfaceVisibility: "hidden",
                          }}
                        >
                          {/* カード裏面表示時の背景画像部分 */}
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-60"
                            style={{
                              backgroundImage:
                                "url('/images/logo-with-bg.png')",
                            }}
                          />
                          <div className="absolute inset-0 bg-white/30 dark:bg-black/45" />
                          <div
                            className={cn(
                              "relative z-10 flex h-full flex-col p-6",
                              isCompact && "overflow-y-auto p-5"
                            )}
                            style={{ WebkitOverflowScrolling: "touch" }}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-black/90 dark:text-white/70">
                              Details
                            </p>
                            <h3 className="mt-2 sm:mt-4 text-lg font-semibold">
                              {exp.title}
                            </h3>
                            <ul className="mt-1 sm:mt-4 grid gap-1 sm:gap-3 text-sm text-black/90 dark:text-white/90">
                              {exp.details.map((detail) => (
                                <li key={detail} className="flex items-start gap-3">
                                  <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-6 text-[11px] text-black/80 dark:text-white/80">
                              もう一度クリックすると戻ります
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
