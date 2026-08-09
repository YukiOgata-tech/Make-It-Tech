import { NfcSection } from "./nfc-section";
import { nfcProducts, nfcDesignTiers, nfcBundle } from "@/content/nfc/lp";

const yen = (value: number) => value.toLocaleString("ja-JP");

/** 形状の選択。設置場所と寸法を並べ、選ぶ材料をそのまま出す。 */
export function NfcProducts() {
  return (
    <NfcSection
      id="products"
      eyebrow={nfcProducts.eyebrow}
      title={nfcProducts.title}
      description={nfcProducts.description}
    >
      <div className="grid gap-px" style={{ backgroundColor: "var(--nfc-line)" }}>
        <div className="grid gap-px md:grid-cols-2" style={{ backgroundColor: "var(--nfc-line)" }}>
          {nfcProducts.items.map((item) => (
            <article
              key={item.id}
              className="p-7 sm:p-9"
              style={{ backgroundColor: "var(--nfc-void)" }}
            >
              <p className="nfc-label">{item.summary}</p>
              <h3 className="nfc-display mt-3 text-xl sm:text-2xl">{item.name}</h3>

              <p
                className="mt-5 text-sm leading-relaxed"
                style={{ color: "var(--nfc-dim)" }}
              >
                {item.description}
              </p>

              <dl className="mt-8 grid gap-5">
                <div>
                  <dt className="nfc-label">寸法</dt>
                  <dd className="nfc-numeric mt-2 text-base">
                    {item.size}
                    {!item.sizeConfirmed && (
                      <span
                        className="nfc-label ml-3"
                        style={{ color: "var(--nfc-alert)" }}
                      >
                        確定前
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="nfc-label">置き場所</dt>
                  <dd className="mt-2 text-sm" style={{ color: "var(--nfc-dim)" }}>
                    {item.places.join(" / ")}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </NfcSection>
  );
}

/** デザイン区分と価格。数字を主役に置く。 */
export function NfcDesignTiers() {
  return (
    <NfcSection id="pricing" eyebrow={nfcDesignTiers.eyebrow} title={nfcDesignTiers.title}>
      <div className="grid gap-px md:grid-cols-2" style={{ backgroundColor: "var(--nfc-line)" }}>
        {nfcDesignTiers.items.map((tier) => (
          <article
            key={tier.id}
            className="relative p-7 sm:p-9"
            style={{ backgroundColor: "var(--nfc-void)" }}
          >
            {tier.recommended && (
              <span
                className="nfc-label absolute right-7 top-7 sm:right-9 sm:top-9"
                style={{ color: "var(--nfc-signal)" }}
              >
                {tier.recommendLabel}
              </span>
            )}

            <h3 className="nfc-display text-xl sm:text-2xl">{tier.name}</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--nfc-dim)" }}>
              {tier.lead}
            </p>

            <p className="mt-8 flex items-baseline gap-2">
              <span
                className="nfc-numeric text-5xl sm:text-6xl"
                style={{ color: "var(--nfc-signal)" }}
              >
                {yen(tier.price)}
              </span>
              <span className="nfc-label">円 / 1個</span>
            </p>
            <p className="nfc-label mt-3">{tier.priceNote}</p>

            <ul
              className="mt-8 grid gap-3 pt-7"
              style={{ borderTop: "1px solid var(--nfc-line)" }}
            >
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 text-sm"
                  style={{ color: "var(--nfc-dim)" }}
                >
                  <span
                    aria-hidden
                    className="mt-2 h-px w-3 shrink-0"
                    style={{ backgroundColor: "var(--nfc-signal)" }}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* デザイン制作費 */}
      <div className="mt-12">
        <p className="nfc-label">{nfcDesignTiers.designFee.title}</p>
        <dl className="mt-5 grid gap-px sm:grid-cols-2" style={{ backgroundColor: "var(--nfc-line)" }}>
          {nfcDesignTiers.designFee.rows.map((row) => (
            <div
              key={row.label}
              className="p-6"
              style={{ backgroundColor: "var(--nfc-void)" }}
            >
              <dt className="text-sm" style={{ color: "var(--nfc-dim)" }}>
                {row.label}
              </dt>
              <dd className="nfc-numeric mt-2 text-2xl">{row.value}</dd>
              <p className="nfc-label mt-3">{row.note}</p>
            </div>
          ))}
        </dl>
      </div>
    </NfcSection>
  );
}

/** まとめ買い。計算式ではなく結果だけを見せる。 */
export function NfcBundle() {
  return (
    <NfcSection
      eyebrow={nfcBundle.eyebrow}
      title={nfcBundle.title}
      description={nfcBundle.description}
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <ul className="grid gap-px sm:grid-cols-3" style={{ backgroundColor: "var(--nfc-line)" }}>
          {nfcBundle.rows.map((row) => (
            <li
              key={row.qty}
              className="px-6 py-8 text-center"
              style={{ backgroundColor: "var(--nfc-void)" }}
            >
              <p className="nfc-numeric text-3xl">{row.label}</p>
              <p className="nfc-label mt-3" style={{ color: "var(--nfc-signal)" }}>
                {row.effect}
              </p>
            </li>
          ))}
        </ul>

        <div className="p-7" style={{ border: "1px solid var(--nfc-line)" }}>
          <p className="nfc-label">{nfcBundle.example.title}</p>
          <p className="mt-5 flex flex-wrap items-baseline gap-3">
            <span
              className="nfc-numeric text-lg line-through"
              style={{ color: "var(--nfc-faint)" }}
            >
              {yen(nfcBundle.example.normal)}
            </span>
            <span
              className="nfc-numeric text-3xl"
              style={{ color: "var(--nfc-signal)" }}
            >
              {yen(nfcBundle.example.discounted)}
              <span className="nfc-label ml-2">円</span>
            </span>
          </p>
          <p className="nfc-label mt-6 leading-relaxed">{nfcBundle.note}</p>
        </div>
      </div>
    </NfcSection>
  );
}
