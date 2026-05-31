"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdsenseAdSlotProps = {
  className?: string;
  minHeight?: number;
};

const adsenseClient = "ca-pub-3927353202195333";
const toolsDisplaySlot = "2411727299";

export function AdsenseAdSlot({
  className = "",
  minHeight = 96,
}: AdsenseAdSlotProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // AdSense can throw when blocked by an extension or loaded twice during navigation.
    }
  }, []);

  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <aside
      className={`my-4 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60 p-2 sm:my-6 ${className}`}
      aria-label="広告"
    >
      <div className="mb-1 text-center text-[10px] text-neutral-600">広告</div>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight }}
        data-ad-client={adsenseClient}
        data-ad-slot={toolsDisplaySlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
