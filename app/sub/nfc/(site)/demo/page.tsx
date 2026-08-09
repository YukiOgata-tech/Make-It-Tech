import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Smartphone } from "lucide-react";
import { NfcSection } from "../../_components/nfc-section";
import { nfcDemoLink, resolveSlot, getJstHour } from "@/content/nfc/redirects";
import { nfcHref, nfcLinks, nfcSite } from "@/content/nfc/site";

/** 表示する時刻が毎回変わるため、キャッシュしない。 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "時間帯で行き先が変わるNFC（デモ）",
  description:
    "同じNFCスタンドでも、かざした時刻によって開くページが変わる仕組みのデモです。日中はd-miseのアプリ紹介、夜間はChatGPTを開きます。",
  robots: { index: false, follow: false },
};

const targetName = (kind: "url" | "app", label: string) =>
  kind === "app" ? `${label}（アプリ / Web版）` : label;

export default function NfcDemoPage() {
  const now = new Date();
  const hour = getJstHour(now);
  const activeSlot = resolveSlot(nfcDemoLink, now);
  const redirectPath = nfcHref(`/r/${nfcDemoLink.slug}`);

  return (
    <>
      <NfcSection
        eyebrow="カスタマイズNFC デモ"
        title={nfcDemoLink.name}
        description={nfcDemoLink.description}
      >
        {/* 現在の判定結果 */}
        <div className="rounded-2xl border border-[#2a9d91]/50 bg-[#16262b] p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs text-[#7d8f96]">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            日本時間 {hour}時台のいま
          </p>

          <p className="mt-3 font-heading text-xl font-bold sm:text-2xl">
            {activeSlot ? activeSlot.label : "時間帯の指定なし"}
          </p>

          <p className="mt-2 text-sm text-[#b0c0c6]">
            かざすと開くページ：
            <span className="ml-1 font-semibold text-[#f2c56b]">
              {activeSlot
                ? targetName(activeSlot.target.kind, activeSlot.target.label)
                : targetName(nfcDemoLink.fallback.kind, nfcDemoLink.fallback.label)}
            </span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={redirectPath}
              prefetch={false}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#e2673d] px-6 text-sm font-semibold text-[#fff8f2] transition-colors hover:bg-[#c9552e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              <Smartphone className="h-4 w-4" aria-hidden />
              かざしたときと同じ動きを試す
            </Link>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[#7d8f96]">
            スマートフォンで開くと、アプリへの切り替えまで確認できます。
          </p>
        </div>

        {/* 時間帯の設定 */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <caption className="pb-3 text-left text-xs text-[#7d8f96]">
              このタグに設定されている切り替えルール
            </caption>
            <thead>
              <tr className="border-b border-[#32454d] text-left text-xs text-[#7d8f96]">
                <th scope="col" className="py-2 pr-4 font-medium">
                  時間帯
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  開くページ
                </th>
                <th scope="col" className="py-2 font-medium">
                  いまの状態
                </th>
              </tr>
            </thead>
            <tbody>
              {nfcDemoLink.slots.map((slot) => {
                const isActive = activeSlot?.label === slot.label;
                return (
                  <tr key={slot.label} className="border-b border-[#32454d]/60">
                    <td className="py-3 pr-4 text-[#f2ece2]">{slot.label}</td>
                    <td className="py-3 pr-4 text-[#b0c0c6]">
                      {targetName(slot.target.kind, slot.target.label)}
                    </td>
                    <td className="py-3">
                      {isActive ? (
                        <span className="rounded-full bg-[#2a9d91] px-2.5 py-1 text-[11px] font-bold text-[#08201e]">
                          適用中
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#7d8f96]">待機</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </NfcSection>

      {/* 仕組み */}
      <NfcSection tone="surface" eyebrow="仕組み" title="タグには行き先そのものを書きません">
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "タグには中間URLを書く",
              body: `NFCタグに書き込むのは ${nfcSite.host}/r/${nfcDemoLink.slug} です。行き先そのものは書き込みません。`,
            },
            {
              title: "かざされた時点で判定する",
              body: "アクセスされた時刻を日本時間で見て、設定したルールのどれに当てはまるかを決めます。",
            },
            {
              title: "決まった行き先へ送る",
              body: "通常のページはそのまま開き、アプリを指定した場合はアプリを起動します。入っていなければWeb版に切り替えます。",
            },
          ].map((step, index) => (
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

        <div className="mt-6 rounded-2xl border border-[#32454d] bg-[#101c20] p-6">
          <h3 className="font-heading text-sm font-bold">この方式でできること</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              "タグを作り直さずに行き先を変更する",
              "曜日や期間で切り替える",
              "キャンペーン中だけ別ページに送る",
              "かざされた回数を数える",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-[#b0c0c6]">
                <span
                  aria-hidden
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f2c56b]"
                />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={nfcLinks.contactUrl}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#32454d] px-5 text-sm font-semibold text-[#f2ece2] transition-colors hover:border-[#f2c56b] hover:text-[#f2c56b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              こういう仕組みを相談する
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href={nfcHref("/")}
              className="inline-flex h-11 items-center rounded-xl border border-[#32454d] px-5 text-sm font-semibold text-[#b0c0c6] transition-colors hover:text-[#f2ece2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              商品の説明に戻る
            </Link>
          </div>
        </div>
      </NfcSection>

      {/* もう一つの事例 */}
      <NfcSection eyebrow="もう一つの事例" title="かざした回数を数えて、特典を出す">
        <div className="rounded-2xl border border-[#32454d] bg-[#16262b] p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-[#b0c0c6]">
            同じ札にかざすたびに回数が増え、3回目で特典が出るスタンプカードです。
            アプリのダウンロードも会員登録も必要ありません。その場で試せます。
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* /tap は Route Handler なので Link ではなく通常のリンクで遷移する */}
            <a
              href={nfcHref("/tap")}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2a9d91] px-5 text-sm font-semibold text-[#08201e] transition-colors hover:bg-[#248b80] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              <Smartphone className="h-4 w-4" aria-hidden />
              スタンプカードを試す
            </a>
            <Link
              href={nfcHref("/card")}
              className="inline-flex h-11 items-center rounded-xl border border-[#32454d] px-5 text-sm font-semibold text-[#b0c0c6] transition-colors hover:text-[#f2ece2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c56b]"
            >
              数えずに見るだけ
            </Link>
          </div>
        </div>
      </NfcSection>
    </>
  );
}
