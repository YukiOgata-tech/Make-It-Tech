import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NfcSection } from "./nfc-section";
import { nfcAdvanced, nfcCorporate } from "@/content/nfc/lp";
import { nfcHref, nfcLinks } from "@/content/nfc/site";

/**
 * 中間URL方式のカスタマイズ。
 * ここが一番「気になる」部分なので、説明で終わらせず動くデモへ送る。
 */
export function NfcAdvanced() {
  return (
    <NfcSection id="advanced" eyebrow={nfcAdvanced.eyebrow} title={nfcAdvanced.title}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--nfc-dim)" }}>
            {nfcAdvanced.lead}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={nfcHref("/demo")}
              className="nfc-display inline-flex h-12 items-center gap-2 px-6 text-sm transition-opacity hover:opacity-85"
              style={{
                backgroundColor: "var(--nfc-signal)",
                color: "var(--nfc-void)",
              }}
            >
              動くデモを見る
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={nfcLinks.contactUrl}
              className="nfc-display inline-flex h-12 items-center px-6 text-sm"
              style={{ border: "1px solid var(--nfc-line-bright)" }}
            >
              {nfcAdvanced.cta}
            </a>
          </div>

          <p className="nfc-label mt-8 leading-relaxed">{nfcAdvanced.note}</p>
        </div>

        <ul>
          {nfcAdvanced.items.map((item, index) => (
            <li
              key={item}
              className="flex items-baseline gap-4 py-4 text-sm"
              style={{
                borderTop: index === 0 ? undefined : "1px solid var(--nfc-line)",
                color: "var(--nfc-dim)",
              }}
            >
              <span className="nfc-numeric shrink-0 text-xs" style={{ color: "var(--nfc-faint)" }}>
                {String(index + 1).padStart(2, "0")}
              </span>
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
      eyebrow={nfcCorporate.eyebrow}
      title={nfcCorporate.title}
      description={nfcCorporate.description}
    >
      <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ backgroundColor: "var(--nfc-line)" }}>
        {nfcCorporate.targets.map((target) => (
          <li
            key={target}
            className="px-5 py-6 text-sm"
            style={{ backgroundColor: "var(--nfc-void)", color: "var(--nfc-dim)" }}
          >
            {target}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed" style={{ color: "var(--nfc-dim)" }}>
          {nfcCorporate.note}
        </p>
        <a
          href={nfcLinks.contactUrl}
          className="nfc-display inline-flex h-12 shrink-0 items-center px-6 text-sm transition-opacity hover:opacity-85"
          style={{
            backgroundColor: "var(--nfc-signal)",
            color: "var(--nfc-void)",
          }}
        >
          {nfcCorporate.cta}
        </a>
      </div>
    </NfcSection>
  );
}
