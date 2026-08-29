import { ArrowUpRight, ShoppingBag } from "lucide-react";

type NfcActionButtonProps = {
  href: string;
  kind: "line" | "shop";
  label: string;
};

/** 購入・相談へ迷わず進めるための、NFCページ共通の大きなCTA。 */
export function NfcActionButton({ href, kind, label }: NfcActionButtonProps) {
  const isLine = kind === "line";

  return (
    <a
      href={href}
      className={`group inline-flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-transform hover:-translate-y-0.5 sm:w-auto ${
        isLine
          ? "bg-[#06C755] text-white"
          : "bg-[var(--nfc-signal)] text-[var(--nfc-void)]"
      }`}
    >
      {isLine ? (
        <span
          className="relative grid h-9 w-11 shrink-0 place-items-center rounded-[0.6rem] bg-white text-[10px] font-black leading-none tracking-[-0.08em] text-[#06C755] after:absolute after:-bottom-1 after:left-2 after:border-r-[5px] after:border-t-[5px] after:border-r-transparent after:border-t-white"
          aria-hidden
        >
          LINE
        </span>
      ) : (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center border border-current/20 bg-black/10"
          aria-hidden
        >
          <ShoppingBag className="h-5 w-5" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="nfc-label block opacity-75">
          {isLine ? "OFFICIAL LINE" : "ONLINE SHOP"}
        </span>
        <span className="nfc-display mt-1 block text-sm">{label}</span>
      </span>

      <ArrowUpRight
        className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </a>
  );
}
