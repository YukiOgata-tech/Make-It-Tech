import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NfcSection } from "./nfc-section";
import { nfcAdvanced, nfcCorporate } from "@/content/nfc/lp";
import { nfcHref, nfcLinks } from "@/content/nfc/site";

/** 中間URL方式のカスタマイズ。実際に動くデモへ誘導する。 */
export function NfcAdvanced() {
  return (
    <NfcSection id="advanced" eyebrow={nfcAdvanced.eyebrow} title={nfcAdvanced.title}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm leading-relaxed text-[#b0c0c6]">{nfcAdvanced.lead}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={nfcHref("/demo")}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2a9d91] px-5 text-sm font-semibold text-[#08201e] transition-colors hover:bg-[#248b80] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              動くデモを見る
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={nfcLinks.contactUrl}
              className="inline-flex h-11 items-center rounded-xl border border-[#32454d] px-5 text-sm font-semibold text-[#f2ece2] transition-colors hover:border-[#f2c56b] hover:text-[#f2c56b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              {nfcAdvanced.cta}
            </a>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-[#7d8f96]">
            {nfcAdvanced.note}
          </p>
        </div>

        <ul className="grid gap-2.5 rounded-2xl border border-[#32454d] bg-[#16262b] p-6 sm:grid-cols-2 lg:grid-cols-1">
          {nfcAdvanced.items.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-[#b0c0c6]">
              <span
                aria-hidden
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f2c56b]"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </NfcSection>
  );
}

/** 法人・大量導入。 */
export function NfcCorporate() {
  return (
    <NfcSection
      tone="surface"
      eyebrow={nfcCorporate.eyebrow}
      title={nfcCorporate.title}
      description={nfcCorporate.description}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {nfcCorporate.targets.map((target) => (
          <li
            key={target}
            className="rounded-xl border border-[#32454d] bg-[#101c20] px-4 py-4 text-sm text-[#b0c0c6]"
          >
            {target}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#32454d] bg-[#101c20] p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-[#b0c0c6]">{nfcCorporate.note}</p>
        <a
          href={nfcLinks.contactUrl}
          className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#e2673d] px-5 text-sm font-semibold text-[#fff8f2] transition-colors hover:bg-[#c9552e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
        >
          {nfcCorporate.cta}
        </a>
      </div>
    </NfcSection>
  );
}
