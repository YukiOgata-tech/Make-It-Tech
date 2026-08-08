import { ChevronDown } from "lucide-react";
import { NfcSection } from "./nfc-section";
import { nfcFaq, nfcCta, nfcNotes } from "@/content/nfc/lp";
import { nfcLinks, isShopReady } from "@/content/nfc/site";

/** FAQ。details/summary で組んでいるため JS なしでも開閉できる。 */
export function NfcFaq() {
  return (
    <NfcSection id="faq" eyebrow={nfcFaq.eyebrow} title={nfcFaq.title}>
      <div className="grid gap-3">
        {nfcFaq.items.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-[#32454d] bg-[#16262b] px-5 py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#f2ece2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]">
              {item.q}
              <ChevronDown
                aria-hidden
                className="h-4 w-4 shrink-0 text-[#7d8f96] transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[#b0c0c6]">{item.a}</p>
          </details>
        ))}
      </div>
    </NfcSection>
  );
}

/** 最終CTAと注記。 */
export function NfcCta() {
  return (
    <NfcSection tone="surface">
      <div className="rounded-3xl border border-[#32454d] bg-[#101c20] p-7 sm:p-10">
        <h2 className="font-heading text-xl font-bold leading-snug tracking-tight sm:text-2xl">
          {nfcCta.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b0c0c6]">
          {nfcCta.description}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          {isShopReady ? (
            <a
              href={nfcLinks.shopUrl}
              className="inline-flex h-12 items-center rounded-xl bg-[#e2673d] px-6 text-sm font-semibold text-[#fff8f2] transition-colors hover:bg-[#c9552e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              {nfcCta.primary}
            </a>
          ) : null}
          <a
            href={nfcLinks.contactUrl}
            className="inline-flex h-12 items-center rounded-xl border border-[#32454d] px-6 text-sm font-semibold text-[#f2ece2] transition-colors hover:border-[#f2c56b] hover:text-[#f2c56b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
          >
            {nfcCta.secondary}
          </a>
          <a
            href={nfcLinks.lineUrl}
            className="inline-flex h-12 items-center rounded-xl border border-[#32454d] px-6 text-sm font-semibold text-[#f2ece2] transition-colors hover:border-[#2a9d91] hover:text-[#2a9d91] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
          >
            LINEで相談
          </a>
        </div>

        <ul className="mt-8 grid gap-1.5 border-t border-[#32454d] pt-6">
          {nfcNotes.map((note) => (
            <li key={note} className="text-[11px] leading-relaxed text-[#7d8f96]">
              ※ {note}
            </li>
          ))}
        </ul>
      </div>
    </NfcSection>
  );
}
