import { NfcSection } from "./nfc-section";
import { nfcProducts, nfcDesignTiers, nfcBundle } from "@/content/nfc/lp";

const yen = (value: number) => `${value.toLocaleString("ja-JP")}円`;

/** 形状の選択。設置場所から選べるように、寸法と置き場所を並べる。 */
export function NfcProducts() {
  return (
    <NfcSection
      id="products"
      tone="surface"
      eyebrow={nfcProducts.eyebrow}
      title={nfcProducts.title}
      description={nfcProducts.description}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {nfcProducts.items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col rounded-2xl border border-[#32454d] bg-[#101c20] p-6"
          >
            <h3 className="font-heading text-lg font-bold">{item.name}</h3>
            <p className="mt-1 text-xs text-[#f2c56b]">{item.summary}</p>

            <p className="mt-4 text-sm leading-relaxed text-[#b0c0c6]">
              {item.description}
            </p>

            <dl className="mt-5 grid gap-3 border-t border-[#32454d] pt-5 text-sm">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <dt className="text-xs text-[#7d8f96]">サイズ</dt>
                <dd className="font-medium text-[#f2ece2]">
                  {item.size}
                  {!item.sizeConfirmed && (
                    <span className="ml-2 rounded bg-[#32454d] px-1.5 py-0.5 text-[10px] text-[#ceede4]">
                      確定前
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <dt className="text-xs text-[#7d8f96]">置き場所</dt>
                <dd className="text-[#b0c0c6]">{item.places.join(" / ")}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </NfcSection>
  );
}

/** デザイン区分と価格。無地モデルはEC限定のためここでは扱わない。 */
export function NfcDesignTiers() {
  return (
    <NfcSection
      id="pricing"
      eyebrow={nfcDesignTiers.eyebrow}
      title={nfcDesignTiers.title}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {nfcDesignTiers.items.map((tier) => (
          <article
            key={tier.id}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              tier.recommended
                ? "border-[#e2673d] bg-[#16262b]"
                : "border-[#32454d] bg-[#16262b]"
            }`}
          >
            {tier.recommended && (
              <span className="absolute -top-3 left-6 rounded-full bg-[#e2673d] px-3 py-1 text-[11px] font-bold text-[#fff8f2]">
                {tier.recommendLabel}
              </span>
            )}

            <h3 className="font-heading text-lg font-bold">{tier.name}</h3>
            <p className="mt-1 text-sm text-[#b0c0c6]">{tier.lead}</p>

            <p className="mt-5 font-heading text-3xl font-bold text-[#f2c56b]">
              {yen(tier.price)}
              <span className="ml-1 text-sm font-medium text-[#7d8f96]">/ 1個</span>
            </p>
            <p className="mt-1 text-xs text-[#7d8f96]">{tier.priceNote}</p>

            <ul className="mt-5 grid gap-2 border-t border-[#32454d] pt-5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-[#b0c0c6]">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#2a9d91]" />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[#32454d] bg-[#16262b] p-6">
        <h3 className="font-heading text-sm font-bold">
          {nfcDesignTiers.designFee.title}
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {nfcDesignTiers.designFee.rows.map((row) => (
            <div key={row.label} className="rounded-xl bg-[#101c20] p-4">
              <dt className="text-sm text-[#b0c0c6]">{row.label}</dt>
              <dd className="mt-1 font-heading text-xl font-bold text-[#f2ece2]">
                {row.value}
              </dd>
              <p className="mt-1 text-xs text-[#7d8f96]">{row.note}</p>
            </div>
          ))}
        </dl>
      </div>
    </NfcSection>
  );
}

/** まとめ買い割引。計算式ではなく「5個ごとに1個分」で伝える。 */
export function NfcBundle() {
  return (
    <NfcSection
      tone="surface"
      eyebrow={nfcBundle.eyebrow}
      title={nfcBundle.title}
      description={nfcBundle.description}
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <ul className="grid gap-3 sm:grid-cols-3">
          {nfcBundle.rows.map((row) => (
            <li
              key={row.qty}
              className="rounded-xl border border-[#32454d] bg-[#101c20] px-4 py-5 text-center"
            >
              <p className="font-heading text-2xl font-bold text-[#f2ece2]">
                {row.label}
              </p>
              <p className="mt-2 text-sm text-[#2a9d91]">{row.effect}</p>
            </li>
          ))}
        </ul>

        <div className="rounded-xl border border-[#32454d] bg-[#101c20] p-5">
          <p className="text-xs text-[#7d8f96]">{nfcBundle.example.title}</p>
          <p className="mt-3 flex flex-wrap items-baseline gap-3">
            <span className="text-sm text-[#7d8f96] line-through">
              {yen(nfcBundle.example.normal)}
            </span>
            <span className="font-heading text-2xl font-bold text-[#f2c56b]">
              {yen(nfcBundle.example.discounted)}
            </span>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[#7d8f96]">
            {nfcBundle.note}
          </p>
        </div>
      </div>
    </NfcSection>
  );
}
