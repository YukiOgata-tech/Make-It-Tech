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
        <span className="nfc-label block opacity-75">
          {isLine ? "OFFICIAL LINE" : "ONLINE SHOP"}
        </span>
        <span className="nfc-display mt-1 block text-sm">{label}</span>
      </span>

      <ArrowUpRight
        className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </>
  );

  if (isLine) {
    return (
      <LineButton
        href={href}
        size="lg"
        className="group h-auto min-h-16 w-full justify-start gap-3 whitespace-normal rounded-xl px-4 py-3 text-left sm:w-auto"
      >
        {content}
      </LineButton>
    );
  }

  return (
    <a
      href={href}
      className="group inline-flex min-h-16 w-full items-center gap-3 bg-[var(--nfc-signal)] px-4 py-3 text-left text-[var(--nfc-void)] transition-transform hover:-translate-y-0.5 sm:w-auto"
    >
      {content}
    </a>
  );
}
