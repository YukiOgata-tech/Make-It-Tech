import { Check, Minus } from "lucide-react";
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
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[#2a9d91]/50 bg-[#16262b] p-6">
          <h3 className="font-heading text-sm font-bold text-[#2a9d91]">
            {nfcScope.included.title}
          </h3>
          <ul className="mt-4 grid gap-2.5">
            {nfcScope.included.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-[#f2ece2]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2a9d91]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#32454d] bg-[#16262b] p-6">
          <h3 className="font-heading text-sm font-bold text-[#b0c0c6]">
            {nfcScope.excluded.title}
          </h3>
          <ul className="mt-4 grid gap-2.5">
            {nfcScope.excluded.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-[#b0c0c6]">
                <Minus className="mt-0.5 h-4 w-4 shrink-0 text-[#7d8f96]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-5 rounded-xl border border-[#32454d] bg-[#16262b] px-5 py-4 text-sm leading-relaxed text-[#b0c0c6]">
        {nfcScope.fallback}{" "}
        <a
          href={nfcLinks.contactUrl}
          className="font-semibold text-[#f2c56b] underline underline-offset-4 hover:opacity-80"
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
    <NfcSection tone="surface" eyebrow={nfcFlow.eyebrow} title={nfcFlow.title}>
      <ol className="grid gap-4 md:grid-cols-5">
        {nfcFlow.steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl border border-[#32454d] bg-[#101c20] p-5"
          >
            <span className="font-heading text-xs font-bold text-[#e2673d]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-heading text-sm font-bold">{step.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#b0c0c6]">{step.body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-xs text-[#7d8f96]">{nfcFlow.note}</p>
    </NfcSection>
  );
}
