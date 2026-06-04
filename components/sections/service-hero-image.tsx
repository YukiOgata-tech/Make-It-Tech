"use client";

import * as React from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const serviceImage = "/images/service/MIT_service-image-01.png";

export function ServiceHeroImage({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          "group relative overflow-hidden border border-border/70 bg-background/80 shadow-sm transition hover:border-primary/40 hover:shadow-md",
          "rounded-2xl",
          className
        )}
        onClick={() => setIsOpen(true)}
        aria-label="サービスイメージを拡大表示"
      >
        <Image
          src={serviceImage}
          alt="Make It Techのサービスイメージ"
          fill
          sizes="(max-width: 767px) 112px, 360px"
          className="object-contain"
          priority
        />
        <span className="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-background/85 text-foreground shadow-sm backdrop-blur">
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="拡大表示を閉じる"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-background shadow-2xl">
            <div className="relative aspect-[3/2] w-full bg-muted">
              <Image
                src={serviceImage}
                alt="Make It Techのサービスイメージ拡大表示"
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <button
              type="button"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur"
              onClick={() => setIsOpen(false)}
              aria-label="閉じる"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
