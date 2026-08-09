import { cn } from "@/lib/utils";

/**
 * 読み取りリング。かざしたときに広がる電波を表す。
 * ヒーロー・遷移画面・スタンプ画面で共通して使い、サイト全体の記号にしている。
 */
export function NfcEmitter({
  size = "md",
  label,
  className,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const box = {
    sm: "h-16 w-16",
    md: "h-28 w-28",
    lg: "h-44 w-44 sm:h-56 sm:w-56",
  }[size];

  return (
    <div className={cn("relative grid place-items-center", box, className)} aria-hidden>
      {[0, 1, 2].map((ring) => (
        <span
          key={ring}
          className={cn(
            "nfc-emit absolute h-full w-full rounded-full border",
            ring === 1 && "nfc-emit-1",
            ring === 2 && "nfc-emit-2"
          )}
          style={{ borderColor: "var(--nfc-signal)" }}
        />
      ))}

      <span
        className="absolute rounded-full"
        style={{
          height: "38%",
          width: "38%",
          border: "1px solid var(--nfc-line-bright)",
        }}
      />

      {label ? (
        <span className="nfc-label relative" style={{ color: "var(--nfc-signal)" }}>
          {label}
        </span>
      ) : (
        <span
          className="nfc-blink relative block rounded-full"
          style={{
            height: "0.4rem",
            width: "0.4rem",
            backgroundColor: "var(--nfc-signal)",
          }}
        />
      )}
    </div>
  );
}
