"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LOTTIE_SEGMENT: [number, number] = [0, 60];

export function AnnouncementCardLottie() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-18 right-3 z-10 h-20 w-34 sm:-top-24 sm:left-30 sm:h-26 sm:w-42"
    >
      <DotLottieReact
        src="/lottie/yuki_walking_transparent_256_12fps_1p5x_64c.lottie"
        autoplay
        loop
        speed={1.3}
        segment={LOTTIE_SEGMENT}
        className="h-full w-full"
      />
    </div>
  );
}
