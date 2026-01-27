"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ExperienceTheme = {
  surface: string;
  accent: string;
  badge: string;
  halo: string;
};

type Experience = {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
  mark: string;
  theme: ExperienceTheme;
};

const experiences: Experience[] = [
  {
    id: "welfare",
    title: "福祉系企業の業務支援",
    category: "福祉",
    summary: "社内ツール開発と運用改善で、現場の負担を削減。",
    details: [
      "社内システム・業務ツールの開発支援",
      "既存システムの改修・保守",
      "業務効率化を目的としたIT活用支援",
      "運用改善提案",
    ],
    mark: "CARE",
    theme: {
      surface:
        "bg-gradient-to-br from-[#FBE6A6] via-[#F6D27F] to-[#F3B874] dark:from-[#2C3E44] dark:via-[#23343A] dark:to-[#1B262B]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
  {
    id: "education",
    title: "教育系事業所のDX支援",
    category: "教育",
    summary: "運営と利用者の両方が使いやすい設計を重視。",
    details: [
      "座席状況の可視化システム構築",
      "運営・利用者双方のUI設計",
      "公式サイトの企画・設計・開発",
      "公開後の運用設計",
    ],
    mark: "EDU",
    theme: {
      surface:
        "bg-gradient-to-br from-[#BFEADB] via-[#A5E0D0] to-[#7ED1C2] dark:from-[#2A3E3C] dark:via-[#213433] dark:to-[#1A2625]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
  {
    id: "restaurant",
    title: "飲食店のWeb活用",
    category: "飲食",
    summary: "小規模でも続けやすいWeb施策を設計。",
    details: [
      "ホームページの企画・提案",
      "フルスタックでのWebサイト開発",
      "店舗の強みが伝わる構成設計",
      "保守・軽微修正の継続対応",
    ],
    mark: "WEB",
    theme: {
      surface:
        "bg-gradient-to-br from-[#F6B9B0] via-[#F1A6A7] to-[#E7898E] dark:from-[#3D2C2D] dark:via-[#312425] dark:to-[#241A1B]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
  {
    id: "line",
    title: "公式LINEの構築・運用補助",
    category: "LINE",
    summary: "問い合わせ導線を整え、運用負荷を軽減。",
    details: [
      "公式LINEアカウントの設計・初期設定",
      "自動応答メッセージの設計",
      "問い合わせ導線の整備",
      "運用補助",
    ],
    mark: "LINE",
    theme: {
      surface:
        "bg-gradient-to-br from-[#BFD7FF] via-[#A6C4FF] to-[#96B0F0] dark:from-[#2A3443] dark:via-[#212A37] dark:to-[#191F2A]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
  {
    id: "common",
    title: "共通して対応している周辺業務",
    category: "共通",
    summary: "事業全体を見据えた支援のため、以下にも対応。",
    details: [
      "標準的なSEOを意識した構成・実装",
      "検索エンジンを考慮したページ設計",
      "運用を前提とした情報設計",
      "目的に応じた改善提案",
    ],
    mark: "OPS",
    theme: {
      surface:
        "bg-gradient-to-br from-[#E0D3FF] via-[#CEBFFF] to-[#B7A7FF] dark:from-[#302B3E] dark:via-[#262032] dark:to-[#1D1828]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
];

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

  const cardWidth = isCompact ? 210 : 300;
  const cardHeight = isCompact ? 320 : 420;
  const spacing = isCompact ? 135 : 250;
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

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") {
      return;
    }
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 6, y: x * 8 });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
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
      <div className="relative pt-4 pb-12 sm:pt-6 sm:pb-14">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#FFE3C8] via-[#F6E9DA] to-[#CFEAE6] dark:from-[#0E1A1F] dark:via-[#142429] dark:to-[#0F1D21]">
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
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/70 dark:border-white/10 dark:bg-white/10 dark:text-white/70">
                <Sparkles className="h-4 w-4" />
                Featured
              </span>
              <span className="text-xs text-foreground/70">
                正面カードをクリックで詳細表示
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs text-foreground/60">
                <div className="h-1 w-24 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-1 rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="min-w-[56px] text-right">
                  {activeIndex + 1} / {total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-black/10 bg-white/70 text-black/70 shadow-[0_12px_30px_rgba(12,18,24,0.15)] transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white/70"
                  aria-label="前の実績"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-black/10 bg-white/70 text-black/70 shadow-[0_12px_30px_rgba(12,18,24,0.15)] transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white/70"
                  aria-label="次の実績"
                >
                  <ArrowRight className="h-4 w-4" />
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
            className="relative mt-6 overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            style={{ height: stageHeight, perspective: "1600px", contain: "layout paint size" }}
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
                      <div className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-40 -translate-x-1/2 rounded-full bg-black/20 blur-2xl dark:bg-black/50" />
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
                          className="absolute inset-0 rounded-[2.2rem] p-6"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <div
                            className={cn(
                              "absolute inset-0 rounded-[2.2rem] bg-gradient-to-br",
                              exp.theme.halo
                            )}
                          />
                          <div className="relative flex h-full flex-col justify-between">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em]">
                              <span
                                className={cn(
                                  "rounded-full px-3 py-1 font-semibold",
                                  exp.theme.badge
                                )}
                              >
                                {exp.category}
                              </span>
                              <span className="text-[11px] text-foreground/60">
                                Case {String(index + 1).padStart(2, "0")}
                              </span>
                            </div>

                            <div
                              className={cn(
                                "mt-6 flex h-32 items-center justify-center rounded-[1.6rem] border px-4 text-3xl font-semibold tracking-[0.2em]",
                                exp.theme.accent
                              )}
                            >
                              {exp.mark}
                            </div>

                            <div className="mt-6">
                              <h3 className="text-lg font-semibold">
                                {exp.title}
                              </h3>
                              <p className="mt-2 text-sm text-foreground/70">
                                {exp.summary}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-foreground/60">
                              <span>クリックで詳細を見る</span>
                              <span className="font-semibold">
                                {exp.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className="absolute inset-0 rounded-[2.2rem] bg-white/90 p-6 text-slate-900 dark:bg-[#121E22] dark:text-slate-100"
                          style={{
                            transform: "rotateY(180deg)",
                            backfaceVisibility: "hidden",
                          }}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
                            Details
                          </p>
                          <h3 className="mt-4 text-lg font-semibold">
                            {exp.title}
                          </h3>
                          <ul className="mt-4 grid gap-3 text-sm text-foreground/70">
                            {exp.details.map((detail) => (
                              <li key={detail} className="flex items-start gap-3">
                                <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-6 text-[11px] text-foreground/60">
                            もう一度クリックすると戻ります
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
