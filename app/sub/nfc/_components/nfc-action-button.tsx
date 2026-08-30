import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { LineButton } from "@/components/ui/line-button";

type NfcActionButtonProps = {
  href: string;
  kind: "line" | "shop";
  label: string;
};

/** 購入・相談へ迷わず進めるための、NFCページ共通の大きなCTA。 */
export function NfcActionButton({ href, kind, label }: NfcActionButtonProps) {
  const isLine = kind === "line";
  const content = (
    <>
      {!isLine ? (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center border border-current/20 bg-black/10"
          aria-hidden
        >
          <ShoppingBag className="h-5 w-5" />
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span
          className="nfc-label block"
          style={{ color: isLine ? "rgb(255 255 255 / 0.88)" : "var(--nfc-void)" }}
        >
          {isLine ? "OFFICIAL LINE" : "ONLINE SHOP"}
        </span>
        <span className="nfc-display mt-1 block text-sm">{label}</span>
      </span>

      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
          isLine ? "bg-white/[0.18] text-white" : "bg-black/[0.12] text-[var(--nfc-void)]"
        }`}
        aria-hidden
      >
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </>
  );

  if (isLine) {
    return (
      <LineButton
        href={href}
        size="lg"
        className="group h-auto min-h-[4.5rem] w-full justify-start gap-4 whitespace-normal rounded-2xl border border-white/30 bg-[#06C755] px-5 py-3.5 text-left shadow-[0_14px_28px_rgb(6_199_85_/_0.28)] hover:bg-[#05b34d] hover:shadow-[0_16px_34px_rgb(6_199_85_/_0.38)] [&>svg]:size-7 sm:w-auto"
      >
        {content}
      </LineButton>
    );
  }

  return (
    <a
      href={href}
      className="group inline-flex min-h-[4.5rem] w-full items-center gap-4 rounded-2xl bg-[var(--nfc-signal)] px-5 py-3.5 text-left text-[var(--nfc-void)] shadow-[0_14px_28px_rgb(0_229_199_/_0.2)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgb(0_229_199_/_0.3)] sm:w-auto"
    >
      {content}
    </a>
  );
}
