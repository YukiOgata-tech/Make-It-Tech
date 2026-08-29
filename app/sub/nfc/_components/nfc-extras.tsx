import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NfcEmitter } from "./nfc-emitter";
import { NfcSection } from "./nfc-section";
import { nfcAdvanced } from "@/content/nfc/lp";
import { nfcHref, nfcLinks } from "@/content/nfc/site";

/**
 * 中間URL方式のカスタマイズ。
 * ここが一番「気になる」部分なので、説明で終わらせず動くデモへ送る。
 */
export function NfcAdvanced() {
  return (
    <NfcSection id="advanced" eyebrow={nfcAdvanced.eyebrow} title={nfcAdvanced.title}>
      <div className="nfc-panel overflow-hidden">
        <div
          className="grid items-center gap-3 p-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:p-7"
          style={{ backgroundColor: "var(--nfc-raised)" }}
        >
          {[
            { label: "NFC TAG", value: "固定URL" },
            { label: "MIT ROUTE", value: "条件を判定" },
            { label: "DESTINATION", value: "行き先を変更" },
          ].map((node, index) => (
            <div key={node.label} className="contents">
              <div className="border px-4 py-5" style={{ borderColor: "var(--nfc-line-bright)" }}>
                <p className="nfc-label">{node.label}</p>
                <p className="nfc-display mt-2 text-sm">{node.value}</p>
              </div>
              {index < 2 ? (
                <ArrowRight
                  className="mx-auto hidden h-4 w-4 sm:block"
                  style={{ color: "var(--nfc-signal)" }}
                  aria-hidden
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid gap-10 p-7 sm:p-9 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <NfcEmitter size="sm" />
          <p
            className="mt-7 text-sm leading-relaxed"
            style={{ color: "var(--nfc-dim)" }}
          >
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
              href={nfcLinks.lineUrl}
              className="nfc-display inline-flex h-12 items-center px-6 text-sm"
              style={{ border: "1px solid var(--nfc-line-bright)" }}
            >
              {nfcAdvanced.cta}
            </a>
          </div>

          <p className="nfc-label mt-8 leading-relaxed">{nfcAdvanced.note}</p>
        </div>

        <ul className="grid gap-px sm:grid-cols-2" style={{ backgroundColor: "var(--nfc-line)" }}>
          {nfcAdvanced.items.map((item, index) => (
            <li
              key={item}
              className="flex items-baseline gap-4 p-5 text-sm"
              style={{
                backgroundColor: "var(--nfc-surface)",
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
      </div>
    </NfcSection>
  );
}
