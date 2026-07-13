"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type PinState = "before" | "active" | "after";

const SEEK_INTERVAL_MS = 48;
const LOW_POWER_SEEK_INTERVAL_MS = 80;
const SEEK_PROGRESS_STEP = 0.018;
const LOW_POWER_SEEK_PROGRESS_STEP = 0.026;
const SEEK_TIME_EPSILON = 0.08;
const LOW_POWER_SEEK_TIME_EPSILON = 0.11;

// PC版は一時停止中。再開する場合は desktopVideo と desktopRef、
// JSX の desktop <video>、getActiveVideo の分岐を戻す。
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

function useDesktopViewport() {
  const [desktopViewport, setDesktopViewport] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktopViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return desktopViewport;
}

function seekVideo(
  video: HTMLVideoElement | null,
  duration: number,
  progress: number,
  timeEpsilon: number
) {
  if (!video || video.readyState < 1) return;

  const targetTime = progress * Math.max(duration - 0.04, 0);
  if (Math.abs(video.currentTime - targetTime) <= timeEpsilon) return;

  try {
    video.currentTime = targetTime;
  } catch {
    // Seeking can fail briefly while the browser is still preparing metadata.
  }
}

export function HomeScrollVideoIntro() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const portraitRef = React.useRef<HTMLVideoElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const captionRef = React.useRef<HTMLDivElement>(null);
  const continueRef = React.useRef<HTMLDivElement>(null);
  const progressTextRef = React.useRef<HTMLSpanElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const progressRef = React.useRef(0);
  const headerOffsetRef = React.useRef(64);
  const lastSeekAtRef = React.useRef(0);
  const lastSeekProgressRef = React.useRef(-1);
  const forceSeekRef = React.useRef(true);
  const pinStateRef = React.useRef<PinState>("before");
  const reducedMotion = useReducedMotion();
  const desktopViewport = useDesktopViewport();
  const [pinState, setPinState] = React.useState<PinState>("before");

  const applyVisualProgress = React.useCallback((nextProgress: number) => {
    const captionOpacity = clamp(1 - nextProgress * 1.8);
    const continueOpacity = clamp((nextProgress - 0.72) / 0.2);

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${nextProgress})`;
    }
    if (captionRef.current) {
      captionRef.current.style.opacity = String(captionOpacity);
    }
    if (continueRef.current) {
      continueRef.current.style.opacity = String(continueOpacity);
    }
    if (progressTextRef.current) {
      progressTextRef.current.textContent = `${Math.round(nextProgress * 100)}%`;
    }
  }, []);

  React.useEffect(() => {
    if (
      desktopViewport ||
      window.matchMedia("(min-width: 768px)").matches
    ) {
      return;
    }

    const videos = [portraitRef.current];
    const handlers: Array<[HTMLVideoElement, () => void]> = [];

    videos.forEach((video) => {
      if (!video) return;
      const init = () => {
        try {
          video.currentTime = 0.001;
        } catch {
          // The next scroll update will seek again after metadata is available.
        }
      };
      video.addEventListener("loadedmetadata", init);
      handlers.push([video, init]);
      if (video.readyState >= 1) init();
    });

    const warmActiveVideo = () => {
      if (window.matchMedia("(min-width: 768px)").matches) return;

      if (portraitRef.current) {
        portraitRef.current.preload = "auto";
        portraitRef.current.load();
      }
    };

    warmActiveVideo();
    window.addEventListener("resize", warmActiveVideo);

    return () => {
      window.removeEventListener("resize", warmActiveVideo);
      handlers.forEach(([video, init]) =>
        video.removeEventListener("loadedmetadata", init)
      );
    };
  }, [desktopViewport]);

  React.useEffect(() => {
    const isDesktopViewport =
      desktopViewport || window.matchMedia("(min-width: 768px)").matches;

    if (isDesktopViewport || reducedMotion) {
      progressRef.current = 0;
      pinStateRef.current = "before";
      applyVisualProgress(0);
      setPinState("before");
      return;
    }

    const navigatorWithMemory = navigator as Navigator & {
      deviceMemory?: number;
    };
    const lowPowerDevice =
      (navigator.hardwareConcurrency > 0 &&
        navigator.hardwareConcurrency <= 4) ||
      (typeof navigatorWithMemory.deviceMemory === "number" &&
        navigatorWithMemory.deviceMemory <= 4);
    const seekInterval = lowPowerDevice
      ? LOW_POWER_SEEK_INTERVAL_MS
      : SEEK_INTERVAL_MS;
    const seekProgressStep = lowPowerDevice
      ? LOW_POWER_SEEK_PROGRESS_STEP
      : SEEK_PROGRESS_STEP;
    const seekTimeEpsilon = lowPowerDevice
      ? LOW_POWER_SEEK_TIME_EPSILON
      : SEEK_TIME_EPSILON;

    const readHeaderOffset = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const bodyStyles = getComputedStyle(document.body);
      return (
        Number.parseFloat(bodyStyles.getPropertyValue("--header-offset")) ||
        Number.parseFloat(rootStyles.getPropertyValue("--header-offset")) ||
        64
      );
    };

    const getActiveVideo = () => {
      return {
        element: portraitRef.current,
        duration: portraitVideo.duration,
      };
    };

    const update = () => {
      rafRef.current = null;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const headerOffset = headerOffsetRef.current;
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

      if (Math.abs(progressRef.current - nextProgress) > 0.001) {
        progressRef.current = nextProgress;
        applyVisualProgress(nextProgress);
      }

      if (pinStateRef.current !== nextPinState) {
        pinStateRef.current = nextPinState;
        setPinState(nextPinState);
      }

      const now = performance.now();
      const reachedNewEndpoint =
        (nextProgress === 0 || nextProgress === 1) &&
        lastSeekProgressRef.current !== nextProgress;
      const shouldSeek =
        forceSeekRef.current ||
        now - lastSeekAtRef.current >= seekInterval ||
        Math.abs(nextProgress - lastSeekProgressRef.current) >=
          seekProgressStep ||
        reachedNewEndpoint;

      if (shouldSeek) {
        const activeVideo = getActiveVideo();
        seekVideo(
          activeVideo.element,
          activeVideo.duration,
          nextProgress,
          forceSeekRef.current ? 0.01 : seekTimeEpsilon
        );
        lastSeekAtRef.current = now;
        lastSeekProgressRef.current = nextProgress;
        forceSeekRef.current = false;
      }
    };

    const requestUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(update);
    };

    const handleResize = () => {
      headerOffsetRef.current = readHeaderOffset();
      forceSeekRef.current = true;
      requestUpdate();
    };

    headerOffsetRef.current = readHeaderOffset();
    forceSeekRef.current = true;
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [applyVisualProgress, desktopViewport, reducedMotion]);

  const stagePosition =
    pinState === "active"
      ? "fixed inset-x-0 z-20"
      : pinState === "after"
        ? "absolute inset-x-0 bottom-0"
        : "absolute inset-x-0 top-0";

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
          preload="metadata"
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
          preload="metadata"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          aria-label="Make It Tech の縦長イントロ動画"
        >
          <source src={portraitVideo.src} type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_28%,rgba(7,18,20,0.32)_72%),linear-gradient(180deg,rgba(7,18,20,0.46),transparent_22%,transparent_64%,rgba(7,18,20,0.72))]" />
        <div
          ref={progressBarRef}
          className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left bg-[#e2673d]"
          style={{ transform: "scaleX(0)" }}
        />

        <div
          ref={captionRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8"
          style={{ opacity: 1 }}
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
              <span ref={progressTextRef} className="font-mono">
                0%
              </span>
              <span className="h-px w-12 bg-white/35" />
              <span>Scroll</span>
            </div>
          </div>
        </div>

        <div
          ref={continueRef}
          className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
          style={{ opacity: 0 }}
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
