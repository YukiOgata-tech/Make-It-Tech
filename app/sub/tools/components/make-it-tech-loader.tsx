"use client";

import Image from "next/image";

type MakeItTechLoaderProps = {
  label?: string;
  compact?: boolean;
};

export function MakeItTechLoader({
  label = "処理中...",
  compact = false,
}: MakeItTechLoaderProps) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full border border-blue-400/40 bg-neutral-950/80 ${
          compact ? "h-6 w-6" : "h-8 w-8"
        }`}
      >
        <span className="absolute inset-0 rounded-full border-2 border-blue-400/70 border-t-transparent animate-spin" />
        <Image
          src="/images/logo-02_MIT.png"
          alt=""
          width={compact ? 16 : 20}
          height={compact ? 16 : 20}
          className="relative rounded-full object-contain"
        />
      </span>
      <span>{label}</span>
    </span>
  );
}
