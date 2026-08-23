import type { CSSProperties } from "react";

/**
 * The site header wordmark gradient (`.brand-mark` in globals.css), pinned to its
 * light-theme values. Flyers must not follow next-themes into the dark palette —
 * they are print artwork, so the colours have to be fixed.
 */
export const brandGradientText: CSSProperties = {
  backgroundImage: "linear-gradient(120deg,rgb(28 44 52),rgb(226 103 61),rgb(42 157 145))",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/** The full header treatment: Outfit 600, tracked out, uppercase, gradient. */
export const brandMark: CSSProperties = {
  ...brandGradientText,
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

/** Google's official wordmark palette. */
const GOOGLE_LETTERS: [string, string][] = [
  ["G", "#4285F4"],
  ["o", "#EA4335"],
  ["o", "#FBBC05"],
  ["g", "#4285F4"],
  ["l", "#34A853"],
  ["e", "#EA4335"],
];

/**
 * "Google" in its brand colours. Inherits font-size and weight from the run it
 * sits in, so it can be dropped inline into a headline or a body sentence;
 * pass `size` only when it needs to break out of the surrounding type.
 */
export function GoogleWord({
  size,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={className} style={{ letterSpacing: "-0.01em", fontSize: size, ...style }}>
      {GOOGLE_LETTERS.map(([char, color], i) => (
        <span key={i} style={{ color }}>
          {char}
        </span>
      ))}
    </span>
  );
}
