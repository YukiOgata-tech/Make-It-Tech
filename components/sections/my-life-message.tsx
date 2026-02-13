"use client";

import { useEffect, useMemo, useState } from "react";

type MyLifeMessageProps = {
  text: string;
  speedMs?: number;
};

export function MyLifeMessage({ text, speedMs = 32 }: MyLifeMessageProps) {
  const normalizedText = useMemo(() => text.trim(), [text]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
  }, [normalizedText]);

  useEffect(() => {
    if (!normalizedText) return;
    if (count >= normalizedText.length) return;

    const timer = window.setTimeout(() => {
      setCount((prev) => prev + 1);
    }, speedMs);

    return () => window.clearTimeout(timer);
  }, [count, normalizedText, speedMs]);

  if (!normalizedText) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        まだメッセージは設定されていません。
      </p>
    );
  }

  const done = count >= normalizedText.length;
  const visibleText = normalizedText.slice(0, count);

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
      {visibleText}
      <span
        aria-hidden
        className={done ? "ml-0.5 opacity-0" : "ml-0.5 inline-block animate-pulse opacity-80"}
      >
        |
      </span>
    </p>
  );
}
