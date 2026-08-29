import Image from "next/image";
import { NfcSection } from "./nfc-section";
import { nfcProducts, nfcDesignTiers } from "@/content/nfc/lp";

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
      <div className="grid gap-5 md:grid-cols-2">
        {nfcProducts.items.map((item) => (
          <article key={item.id} className="nfc-panel overflow-hidden">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={item.image.src}
                alt={item.image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                unoptimized
              />
              <div
                className="absolute inset-x-0 bottom-0 h-24"
                style={{
                  background: "linear-gradient(to top, var(--nfc-surface), transparent)",
                }}
                aria-hidden
              />
              <span
                className="nfc-label absolute left-5 top-5 px-3 py-2"
                style={{
                  backgroundColor: "rgb(5 7 13 / 0.82)",
                  color: "var(--nfc-signal)",
                }}
              >
                {item.summary}
              </span>
            </div>

            <div className="p-7 sm:p-9">
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
            </div>
          </article>
        ))}
      </div>
    </NfcSection>
  );
}

/** デザイン区分と価格。数字を主役に置く。 */
export function NfcDesignTiers() {
  return (
    <NfcSection id="pricing" eyebrow={nfcDesignTiers.eyebrow} title={nfcDesignTiers.title}>
      <div className="mb-12 grid grid-cols-3 gap-2 sm:gap-4">
        {nfcDesignTiers.gallery.map((image) => (
          <figure key={image.src} className="nfc-panel overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 33vw, 24rem"
                className="object-cover"
                unoptimized
              />
            </div>
            <figcaption className="nfc-label px-3 py-3 sm:px-5">
              {image.label}
            </figcaption>
          </figure>
        ))}
      </div>

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

      <div className="mt-12 overflow-x-auto border" style={{ borderColor: "var(--nfc-line)" }}>
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <thead>
            <tr style={{ backgroundColor: "var(--nfc-raised)" }}>
              <th className="nfc-label w-40 px-5 py-4" scope="col">
                比較項目
              </th>
              {nfcDesignTiers.items.map((tier) => (
                <th key={tier.id} className="px-5 py-4" scope="col">
                  <span className="nfc-display block text-sm">{tier.name}</span>
                  <span
                    className="nfc-numeric mt-1 block text-lg"
                    style={{ color: "var(--nfc-signal)" }}
                  >
                    {yen(tier.price)}円〜
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nfcDesignTiers.comparisonRows.map((row) => (
              <tr key={row.label} style={{ borderTop: "1px solid var(--nfc-line)" }}>
                <th className="nfc-label px-5 py-5" scope="row">
                  {row.label}
                </th>
                <td className="px-5 py-5 text-sm" style={{ color: "var(--nfc-dim)" }}>
                  {row.default}
                </td>
                <td className="px-5 py-5 text-sm" style={{ color: "var(--nfc-dim)" }}>
                  {row.original}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
