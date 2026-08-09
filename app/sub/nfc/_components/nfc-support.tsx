import { NfcSection } from "./nfc-section";
import { nfcScope, nfcFlow } from "@/content/nfc/lp";
import { nfcLinks } from "@/content/nfc/site";

/** サポート範囲。含む / 含まないを対で並べ、あとから揉めないようにする。 */
export function NfcScope() {
  return (
    <NfcSection
      id="scope"
      eyebrow={nfcScope.eyebrow}
      title={nfcScope.title}
      description={nfcScope.description}
    >
      <div className="grid gap-px md:grid-cols-2" style={{ backgroundColor: "var(--nfc-line)" }}>
        <div className="p-7 sm:p-9" style={{ backgroundColor: "var(--nfc-void)" }}>
          <p className="nfc-label" style={{ color: "var(--nfc-signal)" }}>
            {nfcScope.included.title}
          </p>
          <ul className="mt-6 grid gap-4">
            {nfcScope.included.items.map((item) => (
              <li key={item} className="flex gap-3 text-sm">
                <span
                  aria-hidden
                  className="mt-2 h-px w-3 shrink-0"
                  style={{ backgroundColor: "var(--nfc-signal)" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-7 sm:p-9" style={{ backgroundColor: "var(--nfc-void)" }}>
          <p className="nfc-label">{nfcScope.excluded.title}</p>
          <ul className="mt-6 grid gap-4">
            {nfcScope.excluded.items.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm"
                style={{ color: "var(--nfc-faint)" }}
              >
                <span
                  aria-hidden
                  className="mt-2 h-px w-3 shrink-0"
                  style={{ backgroundColor: "var(--nfc-line-bright)" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p
        className="mt-8 text-sm leading-relaxed"
        style={{ color: "var(--nfc-dim)" }}
      >
        {nfcScope.fallback}{" "}
        <a
          href={nfcLinks.contactUrl}
          className="underline underline-offset-4 transition-opacity hover:opacity-80"
          style={{ color: "var(--nfc-signal)" }}
        >
          相談する
        </a>
      </p>
    </NfcSection>
  );
}

/** 注文から利用開始まで。実際に順序があるので番号を振っている。 */
export function NfcFlow() {
  return (
    <NfcSection eyebrow={nfcFlow.eyebrow} title={nfcFlow.title}>
      <ol className="grid gap-px md:grid-cols-5" style={{ backgroundColor: "var(--nfc-line)" }}>
        {nfcFlow.steps.map((step, index) => (
          <li
            key={step.title}
            className="p-6"
            style={{ backgroundColor: "var(--nfc-void)" }}
          >
            <span
              className="nfc-numeric block text-2xl"
              style={{ color: "var(--nfc-signal)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="nfc-display mt-4 text-sm">{step.title}</h3>
            <p
              className="mt-3 text-xs leading-relaxed"
              style={{ color: "var(--nfc-dim)" }}
            >
              {step.body}
            </p>
          </li>
        ))}
      </ol>

      <p className="nfc-label mt-8">{nfcFlow.note}</p>
    </NfcSection>
  );
}
