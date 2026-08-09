"use client";

import { useState } from "react";
import { NfcSection } from "./nfc-section";
import { NfcEmitter } from "./nfc-emitter";
import { nfcUseCases } from "@/content/nfc/lp";

/**
 * つなげられるページの一覧。
 *
 * 一覧を眺めるだけでは「自分の店だと何になるのか」が想像しにくいので、
 * 選ぶとリングの下に行き先が出る形にしている。ヒーローと同じ記号を使い、
 * かざしたときに何が起きるかを自分の手で確かめられるようにした。
 */
export function NfcUseCases() {
  const [selected, setSelected] = useState(0);
  const active = nfcUseCases.items[selected];

  return (
    <NfcSection
      id="use-cases"
      eyebrow={nfcUseCases.eyebrow}
      title={nfcUseCases.title}
      description={nfcUseCases.description}
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
        {/* 選択肢 */}
        <ul className="flex flex-wrap gap-2" role="listbox" aria-label="つなげ先を選ぶ">
          {nfcUseCases.items.map((item, index) => {
            const isActive = index === selected;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => setSelected(index)}
                  onMouseEnter={() => setSelected(index)}
                  className="nfc-display px-4 py-2.5 text-xs transition-colors sm:text-sm"
                  style={{
                    border: `1px solid ${
                      isActive ? "var(--nfc-signal)" : "var(--nfc-line)"
                    }`,
                    color: isActive ? "var(--nfc-signal)" : "var(--nfc-dim)",
                    backgroundColor: isActive
                      ? "rgb(0 229 199 / 0.06)"
                      : "transparent",
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* 選んだ結果 */}
        <div
          className="flex flex-col items-center justify-center px-6 py-10 text-center"
          style={{ border: "1px solid var(--nfc-line)" }}
        >
          <NfcEmitter size="md" />

          <p className="nfc-label mt-8">かざすと開く</p>
          <p
            key={active.label}
            className="nfc-display nfc-pop mt-3 text-lg"
            style={{ color: "var(--nfc-signal)" }}
            aria-live="polite"
          >
            {active.label}
          </p>
          <p
            className="mt-3 text-xs leading-relaxed"
            style={{ color: "var(--nfc-dim)" }}
          >
            {active.note}
          </p>
        </div>
      </div>
    </NfcSection>
  );
}
