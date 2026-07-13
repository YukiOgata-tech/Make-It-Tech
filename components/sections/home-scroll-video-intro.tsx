"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type PinState = "before" | "active" | "after";

// PC版は一時停止中。
// const desktopVideo = {
//   src: "/videos/home-scroll/mit-desktop.mp4",
//   duration: 10,
// };

const portraitVideo = {
  src: "/videos/home-scroll/mit-portrait.mp4",
  duration: 8.633333,
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function seekVideo(
  video: HTMLVideoElement | null,
  duration: number,
  progress: number
) {
  if (!video || video.readyState < 1) return;

  const targetTime = progress * Math.max(duration - 0.04, 0);
  if (Math.abs(video.currentTime - targetTime) <= 0.025) return;

  try {
    video.currentTime = targetTime;
  } catch {
    // Seeking can fail briefly while the browser is still preparing metadata.
  }
}

export function HomeScrollVideoIntro() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const portraitRef = React.useRef<HTMLVideoElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = React.useState(0);
  const [pinState, setPinState] = React.useState<PinState>("before");

  React.useEffect(() => {
    const video = portraitRef.current;
    if (!video) return;

    video.load();
    const init = () => {
      try {
        video.currentTime = 0.001;
      } catch {
        // The next scroll update will seek again after metadata is available.
      }
    };

    video.addEventListener("loadedmetadata", init);
    if (video.readyState >= 1) init();

    return () => video.removeEventListener("loadedmetadata", init);
  }, []);

  React.useEffect(() => {
    if (reducedMotion) {
      setProgress(0);
      setPinState("before");
      return;
    }

    const update = () => {
      rafRef.current = null;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const rootStyles = getComputedStyle(document.documentElement);
      const bodyStyles = getComputedStyle(document.body);
      const headerOffset =
        Number.parseFloat(bodyStyles.getPropertyValue("--header-offset")) ||
        Number.parseFloat(rootStyles.getPropertyValue("--header-offset")) ||
        64;
      const stageTop = headerOffset;
      const stageHeight = Math.max(window.innerHeight - stageTop, 320);
      const scrollRange = Math.max(rect.height - stageHeight, 1);
      const nextProgress = clamp((stageTop - rect.top) / scrollRange);
      const nextPinState =
        rect.top > stageTop
          ? "before"
          : rect.bottom <= stageTop + stageHeight
            ? "after"
            : "active";

      setProgress(nextProgress);
      setPinState((current) =>
        current === nextPinState ? current : nextPinState
      );
      seekVideo(portraitRef.current, portraitVideo.duration, nextProgress);
    };

    const requestUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [reducedMotion]);

  const stagePosition =
    pinState === "active"
      ? "fixed inset-x-0 z-20"
      : pinState === "after"
        ? "absolute inset-x-0 bottom-0"
        : "absolute inset-x-0 top-0";
  const progressPercent = Math.round(progress * 100);
  const captionOpacity = clamp(1 - progress * 1.8);
  const continueOpacity = clamp((progress - 0.72) / 0.2);

  return (
    <section
      ref={sectionRef}
      className="relative isolate bg-[#071214] text-white md:hidden"
      style={{
        minHeight: reducedMotion
          ? "calc(100svh - var(--header-offset))"
          : "330svh",
      }}
    >
      <div
        className={cn(
          stagePosition,
          "h-[calc(100svh-var(--header-offset))] overflow-hidden bg-[#071214]"
        )}
        style={
          pinState === "active"
            ? { top: "var(--header-offset)" }
            : undefined
        }
      >
        {/*
        PC版は一時停止中。
        <video
          ref={desktopRef}
          className="hidden h-full w-full object-cover md:block"
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          aria-label="Make It Tech の横長イントロ動画"
        >
          <source src={desktopVideo.src} type="video/mp4" />
        </video>
        */}
        <video
          ref={portraitRef}
          className="h-full w-full object-cover md:hidden"
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          aria-label="Make It Tech の縦長イントロ動画"
        >
          <source src={portraitVideo.src} type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_28%,rgba(7,18,20,0.32)_72%),linear-gradient(180deg,rgba(7,18,20,0.46),transparent_22%,transparent_64%,rgba(7,18,20,0.72))]" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left bg-[#e2673d]"
          style={{ transform: `scaleX(${progress})` }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8"
          style={{ opacity: captionOpacity }}
        >
          <div className="mx-auto flex max-w-6xl items-end justify-between gap-6">
            <div>
              <p className="brand-mark text-sm font-semibold text-white sm:text-lg">
                Make It Tech
              </p>
              <p className="mt-2 max-w-lg text-xl font-semibold leading-tight tracking-normal text-white sm:text-4xl">
                Web制作からDXまで、現場で動く形へ。
              </p>
            </div>
            <div className="hidden items-center gap-3 rounded-full border border-white/16 bg-black/25 px-4 py-2 text-xs text-white/78 backdrop-blur md:flex">
              <span className="font-mono">{progressPercent}%</span>
              <span className="h-px w-12 bg-white/35" />
              <span>Scroll</span>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
          style={{ opacity: continueOpacity }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-black/35 px-4 py-2 text-xs font-semibold text-white/84 backdrop-blur">
            <span>そのまま進む</span>
            <ArrowDown className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </section>
  );
}
