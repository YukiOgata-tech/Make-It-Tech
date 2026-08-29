import { NfcSection } from "./nfc-section";
import { nfcProblems } from "@/content/nfc/lp";

/** 導入前後の変化。比較表にして、どこが変わるのかを横並びで読めるようにする。 */
export function NfcProblems() {
  return (
    <NfcSection eyebrow={nfcProblems.eyebrow} title={nfcProblems.title}>
      <div className="overflow-x-auto border" style={{ borderColor: "var(--nfc-line)" }}>
        <table className="w-full min-w-2xl border-collapse text-left">
          <thead>
            <tr style={{ backgroundColor: "var(--nfc-raised)" }}>
              <th className="nfc-label w-10 px-3 py-2 sm:px-5 sm:py-4" scope="col">
                No.
              </th>
              <th className="nfc-label px-3 py-2 sm:px-5 sm:py-4" scope="col">
                これまで
              </th>
              <th
                className="nfc-label px-3 py-2 sm:px-5 sm:py-4"
                style={{ color: "var(--nfc-signal)" }}
                scope="col"
              >
                NFCを置いたあと
              </th>
            </tr>
          </thead>
          <tbody>
            {nfcProblems.items.map((item, index) => (
              <tr key={item.before} style={{ borderTop: "1px solid var(--nfc-line)" }}>
                <td
                  className="nfc-numeric px-5 py-6 align-top text-xs"
                  style={{ color: "var(--nfc-faint)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </td>
                <td
                  className="px-5 py-6 text-sm leading-relaxed"
                  style={{ color: "var(--nfc-faint)" }}
                >
                  {item.before}
                </td>
                <td className="px-5 py-6 text-sm leading-relaxed sm:text-base">
                  <span
                    className="mr-3 inline-block h-1.5 w-1.5 rounded-full align-middle"
                    style={{ backgroundColor: "var(--nfc-signal)" }}
                    aria-hidden
                  />
                  {item.after}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NfcSection>
  );
}
