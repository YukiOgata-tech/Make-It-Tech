"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

const SPLASH_STORAGE_KEY = "make-it-tech-home-splash-seen";
const SPLASH_REPLAY_EVENT = "make-it-tech-home-splash-replay";
const SHOW_MS = 2800;
const EXIT_MS = 500;

type SplashPhase = "checking" | "show" | "hide" | "done";

export function HomeSplash() {
  const [phase, setPhase] = useState<SplashPhase>("checking");

  useEffect(() => {
    const alreadySeen = window.sessionStorage.getItem(SPLASH_STORAGE_KEY);
    if (alreadySeen) {
      setPhase("done");
      return;
    }

    window.sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
    setPhase("show");

    const hideTimer = window.setTimeout(() => setPhase("hide"), SHOW_MS);
    const doneTimer = window.setTimeout(
      () => setPhase("done"),
      SHOW_MS + EXIT_MS
    );

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    const replay = () => {
      setPhase("show");
      const hideTimer = window.setTimeout(() => setPhase("hide"), SHOW_MS);
      const doneTimer = window.setTimeout(
        () => setPhase("done"),
        SHOW_MS + EXIT_MS
      );

      return () => {
        window.clearTimeout(hideTimer);
        window.clearTimeout(doneTimer);
      };
    };

    let cleanupTimers: (() => void) | null = null;
    const handleReplay = () => {
      cleanupTimers?.();
      cleanupTimers = replay();
    };

    window.addEventListener(SPLASH_REPLAY_EVENT, handleReplay);

    return () => {
      cleanupTimers?.();
      window.removeEventListener(SPLASH_REPLAY_EVENT, handleReplay);
    };
  }, []);

  useEffect(() => {
    if (phase !== "show") {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [phase]);

  if (phase === "checking" || phase === "done") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-9999 grid place-items-center overflow-hidden bg-transparent transition-opacity duration-700 ${
        phase === "hide" ? "opacity-0" : "opacity-100"
      }`}
    >
      <style>
        {`
          @keyframes mit-splash-grid {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-44px, -44px, 0); }
          }
          @keyframes mit-splash-band {
            0% { transform: translate3d(-18%, 18%, 0) rotate(-12deg); opacity: 0.18; }
            50% { transform: translate3d(12%, -8%, 0) rotate(-12deg); opacity: 0.34; }
            100% { transform: translate3d(36%, -28%, 0) rotate(-12deg); opacity: 0.12; }
          }
          @keyframes mit-splash-pulse {
            0%, 100% { transform: scale(0.96); opacity: 0.48; }
            50% { transform: scale(1.08); opacity: 0.82; }
          }
          @media (prefers-reduced-motion: reduce) {
            .mit-splash-grid,
            .mit-splash-band,
            .mit-splash-pulse {
              animation: none !important;
            }
          }
        `}
      </style>

      <div className="absolute inset-0 bg-[#f7f3ea]/72 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,98,58,0.2),transparent_27%),radial-gradient(circle_at_82%_20%,rgba(83,214,200,0.22),transparent_30%),radial-gradient(circle_at_52%_86%,rgba(245,190,93,0.18),transparent_34%)]" />
      <div className="mit-splash-grid absolute -inset-12 bg-[linear-gradient(rgba(28,42,48,0.16)_2px,transparent_2px),linear-gradient(90deg,rgba(28,42,48,0.16)_2px,transparent_2px)] bg-[size:38px_38px] [animation:mit-splash-grid_9s_linear_infinite]" />
      <div className="mit-splash-band absolute left-1/2 top-1/2 h-[38vh] w-[125vw] -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-transparent via-white/70 to-transparent blur-sm [animation:mit-splash-band_3.6s_ease-in-out_infinite]" />
      <div className="mit-splash-pulse absolute h-[min(58vw,420px)] w-[min(58vw,420px)] rounded-full bg-white/68 blur-3xl animate-[mit-splash-pulse_2.4s_ease-in-out_infinite]" />

      <div className="relative grid h-[min(58vw,360px)] w-[min(58vw,360px)] place-items-center sm:h-[min(40vw,460px)] sm:w-[min(40vw,460px)]">
        <DotLottieReact
          src="/lottie/MIT_ld01_transparent.lottie"
          autoplay
          loop
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

export function HomeSplashDevTrigger() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9000]">
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(SPLASH_REPLAY_EVENT))}
        className="rounded-full border border-primary/35 bg-background/90 px-3 py-1.5 text-[11px] font-semibold text-primary shadow-lg backdrop-blur transition hover:bg-primary/10"
      >
        Splash確認
      </button>
    </div>
  );
}
