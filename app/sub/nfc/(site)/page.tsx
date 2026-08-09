import { NfcHero } from "../_components/nfc-hero";
import { NfcProblems } from "../_components/nfc-value";
import { NfcUseCases } from "../_components/nfc-use-cases";
import { NfcProducts, NfcDesignTiers, NfcBundle } from "../_components/nfc-lineup";
import { NfcScope, NfcFlow } from "../_components/nfc-support";
import { NfcAdvanced, NfcCorporate } from "../_components/nfc-extras";
import { NfcFaq, NfcCta } from "../_components/nfc-closing";

/**
 * NFC事業LP。
 * 文言・価格は content/nfc/lp.ts、リンクとホスト設定は content/nfc/site.ts。
 */
export default function NfcHomePage() {
  return (
    <>
      <NfcHero />
      <NfcProblems />
      <NfcUseCases />
      <NfcProducts />
      <NfcDesignTiers />
      <NfcBundle />
      <NfcScope />
      <NfcFlow />
      <NfcAdvanced />
      <NfcCorporate />
      <NfcFaq />
      <NfcCta />
    </>
  );
}
