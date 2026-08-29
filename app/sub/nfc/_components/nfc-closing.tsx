import { Plus } from "lucide-react";
import { NfcActionButton } from "./nfc-action-button";
import { NfcSection } from "./nfc-section";
import { nfcFaq, nfcCta, nfcNotes } from "@/content/nfc/lp";
import { nfcLinks, isShopReady } from "@/content/nfc/site";

/** FAQ。details/summary で組んでいるため JS なしでも開閉できる。 */
export function NfcFaq() {
  return (
    <NfcSection id="faq" eyebrow={nfcFaq.eyebrow} title={nfcFaq.title}>
      <div>
        {nfcFaq.items.map((item, index) => (
          <details
            key={item.q}
            className="group py-5"
            style={{
              borderTop: index === 0 ? "1px solid var(--nfc-line)" : undefined,
              borderBottom: "1px solid var(--nfc-line)",
            }}
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-sm sm:text-base">
              {item.q}
              <Plus
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 transition-transform group-open:rotate-45"
                style={{ color: "var(--nfc-signal)" }}
              />
            </summary>
            <p
              className="mt-4 max-w-3xl text-sm leading-relaxed"
              style={{ color: "var(--nfc-dim)" }}
            >
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </NfcSection>
  );
}

/** 最終CTAと注記。 */
export function NfcCta() {
  return (
    <NfcSection>
      <h2 className="nfc-display max-w-3xl text-2xl leading-tight sm:text-4xl">
        {nfcCta.title}
      </h2>
      <p
        className="mt-5 max-w-2xl text-sm leading-relaxed"
        style={{ color: "var(--nfc-dim)" }}
      >
        {nfcCta.description}
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        {isShopReady ? (
          <NfcActionButton
            href={nfcLinks.shopUrl}
            kind="shop"
            label={nfcCta.primary}
          />
        ) : null}
        <NfcActionButton
          href={nfcLinks.lineUrl}
          kind="line"
          label={nfcCta.secondary}
        />
      </div>

      <ul
        className="mt-16 grid gap-2 pt-8"
        style={{ borderTop: "1px solid var(--nfc-line)" }}
      >
        {nfcNotes.map((note) => (
          <li key={note} className="nfc-label leading-relaxed">
            {note}
          </li>
        ))}
      </ul>
    </NfcSection>
  );
}
