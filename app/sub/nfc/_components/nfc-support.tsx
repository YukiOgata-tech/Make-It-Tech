import Image from "next/image";
import { ArrowRight, MessageCircleMore } from "lucide-react";
import { NfcSection } from "./nfc-section";
import { nfcFlow } from "@/content/nfc/lp";
import { nfcLinks } from "@/content/nfc/site";

/** 注文から利用開始まで。購入者が行う2つの操作だけに絞って見せる。 */
export function NfcFlow() {
  return (
    <NfcSection
      id="flow"
      eyebrow={nfcFlow.eyebrow}
      title={nfcFlow.title}
      description={nfcFlow.description}
    >
      <div
        className="grid overflow-hidden border lg:grid-cols-[0.9fr_1.1fr]"
        style={{ borderColor: "var(--nfc-line)" }}
      >
        <div className="relative min-h-72 lg:min-h-full">
          <Image
            src={nfcFlow.visual.src}
            alt={nfcFlow.visual.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, transparent 35%, rgb(5 7 13 / 0.82))",
            }}
            aria-hidden
          />
          <p
            className="nfc-label absolute bottom-5 left-5 px-3 py-2"
            style={{ backgroundColor: "rgb(5 7 13 / 0.82)" }}
          >
            Configured & ready
          </p>
        </div>

        <ol className="grid" style={{ backgroundColor: "var(--nfc-surface)" }}>
          {nfcFlow.steps.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-5 p-7 sm:grid-cols-[4rem_1fr] sm:p-9"
              style={{
                borderTop: index === 0 ? undefined : "1px solid var(--nfc-line)",
              }}
            >
              <span
                className="nfc-numeric text-4xl"
                style={{ color: "var(--nfc-signal)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="nfc-label">{step.label}</p>
                <h3 className="nfc-display mt-3 text-xl">{step.title}</h3>
                <p
                  className="mt-4 text-sm leading-relaxed"
                  style={{ color: "var(--nfc-dim)" }}
                >
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div
        className="mt-6 grid gap-6 border p-7 sm:p-9 lg:grid-cols-[auto_1fr_auto] lg:items-center"
        style={{
          borderColor: "rgb(0 229 199 / 0.5)",
          backgroundColor: "rgb(0 229 199 / 0.06)",
        }}
      >
        <span
          className="grid h-14 w-14 place-items-center rounded-full"
          style={{
            backgroundColor: "var(--nfc-signal)",
            color: "var(--nfc-void)",
          }}
          aria-hidden
        >
          <MessageCircleMore className="h-6 w-6" />
        </span>

        <div>
          <p className="nfc-label" style={{ color: "var(--nfc-signal)" }}>
            {nfcFlow.lineSupport.eyebrow}
          </p>
          <h3 className="nfc-display mt-3 text-xl sm:text-2xl">
            {nfcFlow.lineSupport.title}
          </h3>
          <p
            className="mt-3 max-w-2xl text-sm leading-relaxed"
            style={{ color: "var(--nfc-dim)" }}
          >
            {nfcFlow.lineSupport.body}
          </p>
        </div>

        <a
          href={nfcLinks.lineUrl}
          className="nfc-display inline-flex h-12 shrink-0 items-center justify-center gap-2 px-6 text-sm transition-opacity hover:opacity-85"
          style={{
            backgroundColor: "var(--nfc-signal)",
            color: "var(--nfc-void)",
          }}
        >
          {nfcFlow.lineSupport.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </NfcSection>
  );
}
