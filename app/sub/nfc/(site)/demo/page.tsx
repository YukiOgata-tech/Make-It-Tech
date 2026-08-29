import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";
import { NfcSection } from "../../_components/nfc-section";
import { NfcEmitter } from "../../_components/nfc-emitter";
import { nfcDemoLink, resolveSlot, getJstHour } from "@/content/nfc/redirects";
import { nfcHref, nfcLinks, nfcSite } from "@/content/nfc/site";

/** 表示する時刻が毎回変わるため、キャッシュしない。 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "できること（デモ）",
  description:
    "かざした時刻で行き先が変わる、来店回数を数えて特典を出す。NFCで実際に動かせる仕組みのデモです。",
  robots: { index: false, follow: false },
};

const targetName = (kind: "url" | "app", label: string) =>
  kind === "app" ? `${label}（アプリ / Web版）` : label;

export default function NfcDemoPage() {
  const now = new Date();
  const hour = getJstHour(now);
  const activeSlot = resolveSlot(nfcDemoLink, now);
  const active = activeSlot?.target ?? nfcDemoLink.fallback;

  return (
    <>
      {/* 事例1：時間帯で切り替わる */}
      <NfcSection
        divide={false}
        eyebrow="Case 01 / 時間帯で切り替える"
        title={nfcDemoLink.name}
        description={nfcDemoLink.description}
      >
        <div className="grid gap-px lg:grid-cols-[1fr_22rem]" style={{ backgroundColor: "var(--nfc-line)" }}>
          {/* 現在の判定 */}
          <div className="p-7 sm:p-10" style={{ backgroundColor: "var(--nfc-void)" }}>
            <p className="nfc-label">
              <span
                className="nfc-blink mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ backgroundColor: "var(--nfc-signal)" }}
                aria-hidden
              />
              Live / 日本時間 {hour}時台
            </p>

            <p className="nfc-display mt-6 text-2xl sm:text-3xl">
              {activeSlot ? activeSlot.label : "時間帯の指定なし"}
            </p>

            <p className="nfc-label mt-8">いまかざすと開くページ</p>
            <p
              className="nfc-display mt-2 text-lg"
              style={{ color: "var(--nfc-signal)" }}
            >
              {targetName(active.kind, active.label)}
            </p>

            <div className="mt-10">
              <Link
                href={nfcHref(`/r/${nfcDemoLink.slug}`)}
                prefetch={false}
                className="nfc-display inline-flex h-12 items-center gap-2 px-6 text-sm transition-opacity hover:opacity-85"
                style={{
                  backgroundColor: "var(--nfc-signal)",
                  color: "var(--nfc-void)",
                }}
              >
                <Smartphone className="h-4 w-4" aria-hidden />
                かざしたときと同じ動きを試す
              </Link>
              <p className="nfc-label mt-4">
                スマートフォンで開くと、アプリへの切り替えまで確認できます
              </p>
            </div>
          </div>

          {/* ルール */}
          <div className="p-7 sm:p-9" style={{ backgroundColor: "var(--nfc-void)" }}>
            <p className="nfc-label">設定されている切り替えルール</p>
            <ul className="mt-6">
              {nfcDemoLink.slots.map((slot, index) => {
                const isActive = activeSlot?.label === slot.label;
                return (
                  <li
                    key={slot.label}
                    className="py-5"
                    style={{
                      borderTop: index === 0 ? undefined : "1px solid var(--nfc-line)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="nfc-display text-sm"
                        style={{
                          color: isActive ? "var(--nfc-signal)" : "var(--nfc-dim)",
                        }}
                      >
                        {slot.label}
                      </span>
                      {isActive && (
                        <span
                          className="nfc-label"
                          style={{ color: "var(--nfc-signal)" }}
                        >
                          適用中
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-2 text-xs"
                      style={{ color: "var(--nfc-faint)" }}
                    >
                      {targetName(slot.target.kind, slot.target.label)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </NfcSection>

      {/* 事例2：回数を数える */}
      <NfcSection
        eyebrow="Case 02 / 回数を数える"
        title="かざした回数を数えて、特典を出す"
        description="同じ札にかざすたびに回数が増え、3回目で特典が出ます。アプリのダウンロードも会員登録も必要ありません。その場で試せます。"
      >
        <div
          className="flex flex-col items-center px-6 py-12 text-center"
          style={{ border: "1px solid var(--nfc-line)" }}
        >
          <NfcEmitter size="md" />

          <p className="mt-8 max-w-lg text-sm leading-relaxed" style={{ color: "var(--nfc-dim)" }}>
            回数はNFCタグを実際にタップして、この端末で
            <span className="nfc-display mx-1" style={{ color: "var(--nfc-signal)" }}>
              {nfcSite.host}/tap
            </span>
            を開いたときだけ増えます。
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={nfcHref("/card")}
              className="nfc-display inline-flex h-12 items-center px-6 text-sm"
              style={{ border: "1px solid var(--nfc-line-bright)" }}
            >
              現在のスタンプを確認
            </Link>
          </div>
        </div>
      </NfcSection>

      {/* 仕組み */}
      <NfcSection eyebrow="Mechanism" title="タグには行き先そのものを書きません">
        <ol className="grid gap-px md:grid-cols-3" style={{ backgroundColor: "var(--nfc-line)" }}>
          {[
            {
              title: "タグには中間URLを書く",
              body: `NFCタグに書き込むのは ${nfcSite.host}/r/${nfcDemoLink.slug} です。行き先そのものは書き込みません。`,
            },
            {
              title: "かざされた時点で判定する",
              body: "アクセスされた時刻や回数を見て、設定したルールのどれに当てはまるかを決めます。",
            },
            {
              title: "決まった行き先へ送る",
              body: "通常のページはそのまま開き、アプリを指定した場合はアプリを起動します。入っていなければWeb版に切り替えます。",
            },
          ].map((step, index) => (
            <li key={step.title} className="p-7" style={{ backgroundColor: "var(--nfc-void)" }}>
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

        <div className="mt-12">
          <p className="nfc-label">この方式でできること</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "タグを作り直さずに行き先を変更する",
              "曜日や期間で切り替える",
              "キャンペーン中だけ別ページに送る",
              "かざされた回数を数える",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm"
                style={{ color: "var(--nfc-dim)" }}
              >
                <span
                  aria-hidden
                  className="mt-2 h-px w-3 shrink-0"
                  style={{ backgroundColor: "var(--nfc-signal)" }}
                />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={nfcLinks.contactUrl}
              className="nfc-display inline-flex h-12 items-center gap-2 px-6 text-sm"
              style={{ border: "1px solid var(--nfc-line-bright)" }}
            >
              こういう仕組みを相談する
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href={nfcHref("/")}
              className="nfc-display inline-flex h-12 items-center px-6 text-sm"
              style={{ border: "1px solid var(--nfc-line)", color: "var(--nfc-dim)" }}
            >
              商品の説明に戻る
            </Link>
          </div>
        </div>
      </NfcSection>
    </>
  );
}
