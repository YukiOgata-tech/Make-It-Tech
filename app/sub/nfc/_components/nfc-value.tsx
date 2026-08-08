import { ArrowRight } from "lucide-react";
import { NfcSection } from "./nfc-section";
import { nfcProblems, nfcUseCases } from "@/content/nfc/lp";

/** 導入前後の変化。かざす動作が何を置き換えるのかを一対一で見せる。 */
export function NfcProblems() {
  return (
    <NfcSection
      tone="surface"
      eyebrow={nfcProblems.eyebrow}
      title={nfcProblems.title}
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {nfcProblems.items.map((item) => (
          <li
            key={item.before}
            className="rounded-2xl border border-[#32454d] bg-[#101c20] p-5"
          >
            <p className="text-sm leading-relaxed text-[#b0c0c6]">{item.before}</p>
            <ArrowRight className="my-3 h-4 w-4 text-[#e2673d]" aria-hidden />
            <p className="text-sm font-medium leading-relaxed text-[#f2ece2]">
              {item.after}
            </p>
          </li>
        ))}
      </ul>
    </NfcSection>
  );
}

/** つなげられるページの一覧。 */
export function NfcUseCases() {
  return (
    <NfcSection
      id="use-cases"
      eyebrow={nfcUseCases.eyebrow}
      title={nfcUseCases.title}
      description={nfcUseCases.description}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {nfcUseCases.items.map((item) => (
          <li
            key={item.label}
            className="flex items-baseline gap-3 rounded-xl border border-[#32454d] bg-[#16262b] px-4 py-3"
          >
            <span className="text-sm font-semibold text-[#f2ece2]">{item.label}</span>
            <span className="text-xs text-[#7d8f96]">{item.note}</span>
          </li>
        ))}
      </ul>
    </NfcSection>
  );
}
