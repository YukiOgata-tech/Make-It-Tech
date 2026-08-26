"use client";

import Image from "next/image";
import { Fragment } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { Download, Printer } from "lucide-react";
import {
  TbBrain,
  TbChartBarPopular,
  TbDeviceDesktop,
  TbEdit,
  TbEye,
  TbMail,
  TbMapPin,
  TbMapPins,
  TbMessage,
  TbRefresh,
  TbSearch,
  TbTrendingUp,
  TbWifi,
  TbWorld,
} from "react-icons/tb";
import { brandMark } from "@/components/flyer/brand";
import { useFitScale } from "@/components/flyer/use-fit-scale";

const logo = "/images/logo-02_MIT.png";
const heroPhoto = "/images/flyer/web/hero-dashboard.webp";
const siteQr = "/images/flyer/web/qr-top-page.png";

/** Sampled from the reference sheet. */
const C = {
  navy: "#011d44",
  ink: "#0a1f47",
  orange: "#ef7a0a",
  orangeDeep: "#eb7502",
  orangeSoft: "#fea35c",
  gray: "#39435a",
  panelBorder: "#c9cfdc",
  divider: "#dfe3ea",
  planBorder: "#dfe4ec",
  nfcBorder: "#efa662",
} as const;

/**
 * Tailwind's `font-serif` leads with Georgia, which uses old-style figures — the
 * zeros in 24,980 drop to x-height and read as "o". Pin an explicit stack with
 * lining figures plus a Japanese Mincho, matching the reference sheet.
 */
const serif =
  '"Times New Roman", "Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "MS PMincho", "Noto Serif JP", serif';

/** On the navy footer the ink end of the header gradient would disappear, so the
 *  wordmark there runs from white into the same coral/teal. */
const brandMarkOnNavy: CSSProperties = {
  backgroundImage: "linear-gradient(120deg,#ffffff,rgb(226 103 61),rgb(42 157 145))",
};

type IconProps = { className?: string; style?: CSSProperties };

/* ------------------------------------------------------------------ data --- */

/** The four columns of the 強み panel. Cell bounds come from the reference. */
const strengths: {
  key: string;
  Icon: ComponentType<IconProps>;
  center: number;
  title: [string, string];
  note: ReactNode[];
}[] = [
  {
    key: "confirm",
    Icon: TbEye,
    center: 182,
    title: ["完成形を確認後、", "公開するか判断できる"],
    note: [
      "完成イメージを事前にご確認",
      "いただけます。公開を決定",
      "された場合に、制作費",
      <>
        <span style={{ color: C.orange }}>9,800円</span>が発生します。
      </>,
    ],
  },
  {
    key: "continue",
    Icon: TbRefresh,
    center: 452,
    title: ["制作して", "終わらない"],
    note: ["公開後も更新・改善・", "軽微修正まで継続。", "情報発信まで徹底サポート", "します。"],
  },
  {
    key: "search",
    Icon: GrowthIcon,
    center: 724,
    title: ["SEO・MEO・", "AI検索まで一体支援"],
    note: ["検索、Googleマップ、", "AI検索を意識した情報設計と", "継続施策で集客力を強化", "します。"],
  },
  {
    key: "instore",
    Icon: TbMapPins,
    center: 997,
    title: ["店舗導線まで", "設計可能"],
    note: ["レビュー獲得、Webアクセス、", "NFC・QR設計まで考えた", "導線設計で来店・問合せに", "つなげます。"],
  },
];

/** The three price blocks on the navy band. */
const prices: { key: string; label: string; pill: [number, number]; value: [number, number]; amount: string; unit: string; color: string; note?: string; noteAt?: [number, number] }[] = [
  { key: "init", label: "初期費用", pill: [108, 147], value: [133, 87], amount: "0", unit: "円", color: "#ffffff" },
  { key: "build", label: "制作費", pill: [391, 122], value: [349, 212], amount: "9,800", unit: "円", color: C.orange, note: "※公開決定時に発生", noteAt: [368, 1184] },
  { key: "month", label: "月額運用", pill: [680, 143], value: [632, 242], amount: "24,980", unit: "円", color: "#ffffff" },
];

/** The six inclusions. `center` is the cell centre on the 1182px canvas. */
const planItems: { key: string; Icon: ComponentType<IconProps>; center: number; label: [string, string?] }[] = [
  { key: "site", Icon: TbDeviceDesktop, center: 142, label: ["Webサイト運用"] },
  { key: "update", Icon: TbEdit, center: 328, label: ["情報更新・", "軽微修正"] },
  { key: "seo", Icon: TbSearch, center: 506, label: ["SEO対策"] },
  { key: "meo", Icon: TbMapPin, center: 675, label: ["MEO対策"] },
  { key: "aio", Icon: TbBrain, center: 855, label: ["AI検索を", "意識した情報整備"] },
  { key: "line", Icon: TbMessage, center: 1043, label: ["LINEでの", "相談・連絡"] },
];

const bodyLines = [
  "ホームページは“作ること”より、“その後どう活かすか”が重要です。",
  "Make It Techは、検索・Googleマップ・AI検索・店舗導線までを",
  "見据えた継続型のWebマーケティングで、",
  "お客様のビジネスを見つけてもらい続ける仕組みをつくります。",
];

/* ---------------------------------------------------------------- pieces --- */

/**
 * The reference draws ascending bars with a rising arrow above them. Tabler ships
 * the two marks separately, so they are composed here rather than redrawn by hand.
 */
function GrowthIcon({ className, style }: IconProps) {
  const { color, strokeWidth } = (style ?? {}) as CSSProperties;
  return (
    <span className={className} style={{ ...style, display: "block", position: "absolute" }}>
      <TbChartBarPopular
        style={{ position: "absolute", left: 0, bottom: 0, width: "76%", height: "76%", color, strokeWidth }}
      />
      <TbTrendingUp
        style={{ position: "absolute", right: 0, top: 0, width: "54%", height: "54%", color, strokeWidth }}
      />
    </span>
  );
}

/** Circular NFC badge: a ring with the wave mark over the letters. */
function NfcBadge() {
  return (
    <span
      className="absolute flex flex-col items-center justify-center rounded-full"
      style={{ left: 62, top: 1408, width: 80, height: 80, border: `2px solid ${C.nfcBorder}`, color: C.ink }}
    >
      <TbWifi style={{ width: 30, height: 30, marginBottom: -4 }} />
      <span className="text-[17px] font-bold leading-none">NFC</span>
    </span>
  );
}

/* ----------------------------------------------------------------- sheet --- */

export function WebServiceFlyer() {
  const { stageRef, sheetRef, scale } = useFitScale();

  return (
    <main className="webf-print-root min-h-dvh overflow-auto bg-[#eef1f6] px-3 py-4 text-[#0a1f47] sm:px-6">
      {/* The only @page on this route -> the print dialog defaults to A4 portrait. */}
      <style>{"@page { size: A4 portrait; margin: 0; }"}</style>

      <div className="mx-auto mb-4 flex w-full max-w-[1182px] justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#011d44] px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Printer className="h-4 w-4" />
          印刷
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#011d44]/40 bg-white px-4 py-2 text-sm font-semibold text-[#011d44] shadow-sm"
        >
          <Download className="h-4 w-4" />
          PDF保存
        </button>
      </div>

      <div
        ref={stageRef}
        className="webf-stage mx-auto w-full"
        style={{ "--fit-scale": scale } as CSSProperties}
      >
        <div className="webf-frame">
          <article
            ref={sheetRef}
            className="webf-sheet h-[1672px] w-[1182px] overflow-hidden bg-white shadow-2xl print:shadow-none"
          >
            {/* ============================================ 1. hero ===== */}
            {/* Bleeds to the top and right edge, exactly as on the reference. */}
            <Image
              src={heroPhoto}
              alt="アクセス解析ダッシュボードとGoogleマップのレビュー画面"
              width={462}
              height={599}
              priority
              className="absolute z-0 block"
              style={{ left: 664, top: 0, width: 518, height: 672 }}
            />

            <Image
              src={logo}
              alt="Make It Tech"
              width={264}
              height={286}
              priority
              className="absolute z-10 block"
              style={{ left: 54, top: 39, width: 132, height: 143 }}
            />
            <span
              className="absolute z-10 whitespace-nowrap text-[40px] leading-none"
              style={{ left: 211, top: 72, ...brandMark }}
            >
              Make It Tech
            </span>
            <span
              className="absolute z-10 flex items-center justify-center whitespace-nowrap rounded-full text-[18px] font-bold text-white"
              style={{ left: 211, top: 128, width: 312, height: 31, background: C.navy }}
            >
              Web制作・継続Webマーケティング
            </span>

            <h1
              className="absolute z-10 whitespace-nowrap text-[48px] font-semibold leading-none"
              style={{ left: 48, top: 243, color: C.ink, fontFamily: serif }}
            >
              見つけてもらい続ける
              <span style={{ color: C.orange }}>HP</span>へ
            </h1>

            <p
              className="absolute z-10 whitespace-nowrap text-[27px] font-bold leading-[39px]"
              style={{ left: 49, top: 338, color: C.ink }}
            >
              検索・Googleマップ・AI検索を意識した、
              <br />
              <span style={{ color: C.orange }}>継続運用型</span>のWeb制作。
            </p>

            <p
              className="absolute z-10 whitespace-nowrap text-[25px] font-bold leading-none"
              style={{ left: 57, top: 465, color: C.ink }}
            >
              Web制作 <span style={{ color: C.orangeSoft }}>×</span> SEO{" "}
              <span style={{ color: C.orangeSoft }}>×</span> MEO{" "}
              <span style={{ color: C.orangeSoft }}>×</span> AI検索対応{" "}
              <span style={{ color: C.orangeSoft }}>×</span> 継続運用
            </p>
            <span
              className="absolute z-10 block"
              style={{ left: 54, top: 512, width: 688, height: 2, background: "#e4e7ee" }}
            />

            {bodyLines.map((line, i) => (
              <p
                key={line}
                className="absolute z-10 whitespace-nowrap text-[18px] font-medium leading-none"
                style={{ left: 54, top: 533 + i * 32.5, color: C.ink }}
              >
                {line}
              </p>
            ))}

            {/* ========================================= 2. strengths === */}
            <div
              className="absolute z-0 rounded-[22px] border bg-white shadow-[0_2px_10px_rgba(1,29,68,0.07)]"
              style={{ left: 47, top: 700, width: 1088, height: 331, borderColor: C.panelBorder }}
            />
            {[317, 588, 860].map((x) => (
              <span
                key={x}
                className="absolute z-10 block"
                style={{ left: x, top: 741, width: 1, height: 268, background: C.divider }}
              />
            ))}
            <div
              className="absolute z-20 flex items-center justify-center rounded-[26px]"
              style={{ left: 335, top: 684, width: 512, height: 54, background: C.navy }}
            >
              <span className="whitespace-nowrap text-[32px] font-semibold leading-none text-white" style={{ fontFamily: serif }}>
                Make It Tech の <span className="text-[46px]" style={{ color: C.orange }}>4</span> つの強み
              </span>
            </div>

            {strengths.map((s) => (
              <Fragment key={s.key}>
                <s.Icon
                  className="absolute z-10"
                  style={{ left: s.center - 34, top: 728, width: 68, height: 68, color: C.ink, strokeWidth: 2.3 }}
                />
                <p
                  className="absolute z-10 -translate-x-1/2 whitespace-nowrap text-center text-[26px] font-semibold leading-[34px]"
                  style={{ left: s.center, top: 812, color: C.ink, fontFamily: serif }}
                >
                  {s.title[0]}
                  <br />
                  {s.title[1]}
                </p>
                <p
                  className="absolute z-10 -translate-x-1/2 whitespace-nowrap text-center text-[19px] font-medium leading-[28px]"
                  style={{ left: s.center, top: 897, color: C.gray }}
                >
                  {s.note.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </Fragment>
            ))}

            {/* ============================================= 3. price === */}
            <div
              className="absolute z-0 rounded-[18px]"
              style={{ left: 48, top: 1046, width: 1085, height: 180, background: C.navy }}
            />
            {[308, 597].map((x) => (
              <span
                key={x}
                className="absolute z-10 block"
                style={{ left: x, top: 1074, width: 1, height: 127, background: "#3a4c6e" }}
              />
            ))}
            {prices.map((p) => (
              <Fragment key={p.key}>
                <span
                  className="absolute z-10 flex items-center justify-center whitespace-nowrap rounded-[7px] text-[24px] font-semibold leading-none"
                  style={{ left: p.pill[0], top: 1065, width: p.pill[1], height: 35, background: "#ffffff", color: C.ink, fontFamily: serif }}
                >
                  {p.label}
                </span>
                <p
                  className="absolute z-10 flex items-baseline justify-center whitespace-nowrap leading-none"
                  style={{ left: p.value[0], top: 1116, width: p.value[1], color: p.color, fontFamily: serif }}
                >
                  <span className="text-[72px] font-semibold tracking-[-0.05em]">{p.amount}</span>
                  <span className="text-[38px] font-semibold">{p.unit}</span>
                </p>
                {p.note && p.noteAt ? (
                  <p
                    className="absolute z-10 whitespace-nowrap text-[19px] font-bold leading-none text-white"
                    style={{ left: p.noteAt[0], top: p.noteAt[1] }}
                  >
                    {p.note}
                  </p>
                ) : null}
              </Fragment>
            ))}
            <p
              className="absolute z-10 whitespace-nowrap text-[16px] font-bold leading-none text-white"
              style={{ left: 971, top: 1065 }}
            >
              ※ドメイン代は別途
            </p>
            <div
              className="absolute z-10 flex flex-col items-center justify-center rounded-[6px] px-[10px]"
              style={{ left: 895, top: 1094, width: 226, height: 119, background: C.orangeDeep }}
            >
              {["完成デザインをご確認後、", "公開を決定された場合に", "9,800円の制作費が", "発生します。"].map((l) => (
                <span key={l} className="whitespace-nowrap text-[17px] font-bold leading-[26px] text-white">
                  {l}
                </span>
              ))}
            </div>

            {/* ======================================== 4. plan items === */}
            <div
              className="absolute z-0 rounded-[14px] border bg-white shadow-[0_2px_8px_rgba(1,29,68,0.06)]"
              style={{ left: 46, top: 1247, width: 1089, height: 130, borderColor: C.planBorder }}
            />
            <span
              className="absolute z-10 -translate-x-1/2 whitespace-nowrap bg-white px-[16px] text-[32px] font-semibold leading-none"
              style={{ left: 590, top: 1234, color: C.ink, fontFamily: serif }}
            >
              月額 24,980円に含まれる内容
            </span>
            {[237, 420, 591, 759, 952].map((x) => (
              <span
                key={x}
                className="absolute z-10 block"
                style={{ left: x, top: 1274, width: 1, height: 92, background: C.divider }}
              />
            ))}
            {planItems.map((item) => (
              <Fragment key={item.key}>
                <item.Icon
                  className="absolute z-10"
                  style={{ left: item.center - 24, top: 1279, width: 48, height: 48, color: C.ink, strokeWidth: 2 }}
                />
                <p
                  className="absolute z-10 -translate-x-1/2 whitespace-nowrap text-center text-[16px] font-bold leading-[20px]"
                  style={{ left: item.center, top: 1330, color: C.ink }}
                >
                  {item.label[0]}
                  {item.label[1] ? (
                    <>
                      <br />
                      {item.label[1]}
                    </>
                  ) : null}
                </p>
              </Fragment>
            ))}

            {/* ============================================== 5. NFC ==== */}
            <div
              className="absolute z-0 rounded-[14px] border-2 bg-white"
              style={{ left: 46, top: 1391, width: 1089, height: 113, borderColor: C.nfcBorder }}
            />
            <NfcBadge />
            <p
              className="absolute z-10 whitespace-nowrap text-[26px] font-semibold leading-none"
              style={{ left: 185, top: 1417, color: C.ink, fontFamily: serif }}
            >
              NFC高度活用オプション
            </p>
            <p
              className="absolute z-10 flex items-baseline whitespace-nowrap leading-none"
              style={{ left: 172, top: 1451, color: C.ink, fontFamily: serif }}
            >
              <span className="text-[46px] font-semibold">＋15,000</span>
              <span className="text-[28px] font-semibold">円／月</span>
            </p>
            {[485, 958].map((x) => (
              <span
                key={x}
                className="absolute z-10 block"
                style={{ left: x, top: 1409, width: 1, height: 77, background: C.nfcBorder }}
              />
            ))}
            <p
              className="absolute z-10 whitespace-nowrap text-[17px] font-bold leading-[27px]"
              style={{ left: 525, top: 1424, color: C.ink }}
            >
              店舗内の顧客接点を、Googleレビュー・Webアクセス・
              <br />
              メニュー予約導線などのWebマーケティング施策へ接続。
            </p>
            <p
              className="absolute z-10 whitespace-nowrap text-[16px] font-bold leading-[27px]"
              style={{ left: 985, top: 1424, color: C.ink }}
            >
              ※NFCスタンド・
              <br />
              プレート本体は別途
            </p>

            {/* =========================================== 6. footer ==== */}
            <div
              className="absolute inset-x-0 z-0"
              style={{ top: 1520, height: 152, background: C.navy }}
            />
            <p
              className="absolute z-10 whitespace-nowrap text-[28px] font-medium leading-[36px] text-white"
              style={{ left: 59, top: 1531, fontFamily: serif }}
            >
              Web制作だけでなく、
              <br />
              その後の集客・運用まで相談したい方へ
            </p>
            <span
              className="absolute z-10 block"
              style={{ left: 50, top: 1604, width: 510, height: 2, background: C.orange }}
            />
            <Image
              src={logo}
              alt=""
              width={132}
              height={132}
              className="absolute z-10 block"
              style={{ left: 45, top: 1607, width: 66, height: 66 }}
            />
            <span
              className="absolute z-10 whitespace-nowrap text-[34px] leading-none"
              style={{ left: 168, top: 1626, ...brandMark, ...brandMarkOnNavy }}
            >
              Make It Tech
            </span>
            <span
              className="absolute z-10 flex items-center gap-[18px] whitespace-nowrap text-[24px] font-medium leading-none text-white"
              style={{ left: 555, top: 1611 }}
            >
              <TbWorld style={{ width: 28, height: 28 }} />
              https://make-it-tech.com
            </span>
            <span
              className="absolute z-10 flex items-center gap-[18px] whitespace-nowrap text-[24px] font-medium leading-none text-white"
              style={{ left: 555, top: 1643 }}
            >
              <TbMail style={{ width: 28, height: 28 }} />
              info@make-it-tech.com
            </span>
            {/* Square white plate so the code keeps its quiet zone against the navy. */}
            <div
              className="absolute z-10 flex items-center justify-center rounded-[2px] bg-white"
              style={{ left: 981, top: 1532, width: 128, height: 128 }}
            >
              <Image
                src={siteQr}
                alt="Make It Tech 公式サイトのQRコード"
                width={116}
                height={116}
                className="block"
                style={{ width: 116, height: 116 }}
              />
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
