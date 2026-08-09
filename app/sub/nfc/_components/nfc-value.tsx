import { NfcSection } from "./nfc-section";
import { nfcProblems } from "@/content/nfc/lp";

/**
 * 導入前後の変化。
 * カードを並べずに、罫線で区切った行として「いま」と「これから」を対比させる。
 */
export function NfcProblems() {
  return (
    <NfcSection eyebrow={nfcProblems.eyebrow} title={nfcProblems.title}>
      <ul>
        {nfcProblems.items.map((item, index) => (
          <li
            key={item.before}
            className="grid gap-4 py-7 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-8"
            style={{
              borderTop: index === 0 ? undefined : "1px solid var(--nfc-line)",
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "var(--nfc-faint)" }}>
              {item.before}
            </p>

            <span
              aria-hidden
              className="nfc-label hidden sm:block"
              style={{ color: "var(--nfc-signal)" }}
            >
              →
            </span>

            <p className="text-sm leading-relaxed sm:text-base">{item.after}</p>
          </li>
        ))}
      </ul>
    </NfcSection>
  );
}
