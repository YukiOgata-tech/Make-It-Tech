"use client";

import Image from "next/image";
import { Fragment } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { Download, Printer } from "lucide-react";
import {
  TbBuildingStore,
  TbChartBarPopular,
  TbChartHistogram,
  TbDeviceMobile,
  TbNfc,
  TbUsersGroup,
  TbWorld,
} from "react-icons/tb";
import { useFitScale } from "@/components/flyer/use-fit-scale";

const logo = "/images/logo-02_MIT.png";

/** Sampled from the reference sheet. */
const C = {
  navy: "#021e55",
  navyDeep: "#01144b",
  ink: "#1a1a1a",
  headerItem: "#0a2570",
  ringBlue: "#4b7cbd",
  ringGreen: "#6da56b",
  arcBlue: "#6d9acc",
  arcGreen: "#81b57d",
  yellow: "#fce243",
} as const;

type IconProps = { className?: string; style?: CSSProperties };

/* ------------------------------------------------------------------ data --- */

const headerItems: { key: string; Icon: ComponentType<IconProps>; iconLeft: number; textLeft: number; label: string }[] = [
  { key: "real", Icon: TbUsersGroup, iconLeft: 348, textLeft: 400, label: "店舗・現場の力を活かす" },
  { key: "web", Icon: TbWorld, iconLeft: 612, textLeft: 683, label: "Webとリアルをつなぐ" },
  { key: "stack", Icon: TbChartBarPopular, iconLeft: 865, textLeft: 936, label: "継続的に積み上げる" },
];

/**
 * The headline mixes two sizes (nouns larger than the particles) and marks the
 * two poles of the model. リアル / インターネット carry the same blue and green as
 * the left and right circles of the diagram beside them, so the underline is a
 * pointer into the figure rather than decoration.
 */
type HeroPart = { text: string; big?: boolean; accent?: string };

const heroLines: { top: number; left: number; big: number; small: number; parts: HeroPart[] }[] = [
  {
    top: 120,
    left: 49,
    big: 36,
    small: 28,
    parts: [
      { text: "リアル", big: true, accent: C.ringBlue },
      { text: "と" },
      { text: "インターネット", big: true, accent: C.ringGreen },
      { text: "の" },
      { text: "2つの視点", big: true },
    ],
  },
  {
    top: 176,
    left: 45,
    big: 49,
    small: 38,
    parts: [
      { text: "双方", big: true },
      { text: "の" },
      { text: "対策", big: true },
      { text: "を" },
      { text: "一体的に" },
      { text: "支援" },
    ],
  },
];

const heroBody = [
  "Make It Techは、店舗・現場で起きる行動をHPやレビューにつなぎ、",
  "SEO・MEO・AIO・レビュー・アクセスを継続的に積み上げていきます。",
  "集客・評価・アクセスまで総合的にサポートします。",
];

/**
 * The section artwork, trimmed to its own content. Within a row the images share
 * a height and their widths follow each file's native ratio — so the two panels
 * of a row are NOT split evenly (local is 1.84 wide, online 1.40, hence 565 vs
 * 430). Row heights are then solved together so all three rows end up the same
 * width and the block fills the vertical space it has.
 */
type Shot = { src: string; alt: string; left: number; top: number; width: number; height: number };

const contentShots: Shot[] = [
  { src: "local", alt: "リアル（現地）での仕組みづくり", left: 62, top: 372, width: 591, height: 321 },
  { src: "online", alt: "インターネット上での成果につなげる", left: 669, top: 372, width: 450, height: 321 },
  { src: "cycle", alt: "リアルとインターネットの好循環をつくる", left: 62, top: 709, width: 1059, height: 381 },
  { src: "support", alt: "Make It Tech のサポート内容", left: 62, top: 1106, width: 316, height: 396 },
  { src: "scenes", alt: "活用シーン（導入例）", left: 394, top: 1106, width: 728, height: 396 },
];

const closingLine =
  "Make It Techは、店舗の「今」だけでなく「これから」も一緒に考え、成果が積み上がる仕組みをつくります。";

/** Four cells between the tagline block and the CTA badge, split by ✕ marks. */
const footerItems: {
  key: string;
  Icon: ComponentType<IconProps>;
  left: number;
  width: number;
  label: string;
  body: [string, string];
}[] = [
  { key: "web", Icon: TbBuildingStore, left: 300, width: 132, label: "Web制作・運用", body: ["集客の土台を", "つくる"] },
  { key: "nfc", Icon: TbNfc, left: 452, width: 132, label: "NFC導線設計", body: ["現地の行動を", "引き出す"] },
  { key: "meo", Icon: TbChartHistogram, left: 604, width: 132, label: "MEO・AIO・SEO", body: ["見つけてもらい", "選ばれる"] },
  { key: "growth", Icon: TbDeviceMobile, left: 756, width: 134, label: "分析・改善・提案", body: ["成果を継続的に", "伸ばす"] },
];

/** One code replaces the CTA badge. Dropping the second slot frees enough room
 *  to run the caption beside it and take the code from 82 to 96px (≈17mm in
 *  print), which matters more for scanning than a second destination did. */
const footerLine = { src: "/images/flyer/marketing/qr-line.png", left: 1064, top: 1566, size: 96 };

const crossMarks = [430, 582, 734];

/* ---------------------------------------------------------------- pieces --- */

/**
 * The hero diagram, drawn at the reference's own scale: the SVG viewBox matches
 * the source region (391×223 px) so every centre and radius below is a directly
 * measured coordinate rather than a guess.
 */
function CycleDiagram({ style }: { style?: CSSProperties }) {
  const circle = { left: { cx: 73, cy: 112, r: 59 }, mid: { cx: 198, cy: 103, r: 70 }, right: { cx: 323, cy: 112, r: 59 } };
  return (
    <svg viewBox="0 0 391 223" style={style} aria-hidden>
      {/* two-way arcs: outward arrowheads at both ends, as on the reference */}
      <path d="M72 62 C110 -18 286 -18 324 62" fill="none" stroke={C.arcBlue} strokeWidth="13" strokeLinecap="butt" />
      <polygon points="60,44 92,52 66,78" fill={C.arcBlue} />
      <polygon points="336,44 304,52 330,78" fill={C.arcBlue} />
      <path d="M72 162 C110 242 286 242 324 162" fill="none" stroke={C.arcGreen} strokeWidth="13" strokeLinecap="butt" />
      <polygon points="60,180 92,172 66,146" fill={C.arcGreen} />
      <polygon points="336,180 304,172 330,146" fill={C.arcGreen} />

      <circle cx={circle.left.cx} cy={circle.left.cy} r={circle.left.r} fill="#ffffff" stroke={C.ringBlue} strokeWidth="4" />
      <circle cx={circle.right.cx} cy={circle.right.cy} r={circle.right.r} fill="#ffffff" stroke={C.ringGreen} strokeWidth="4" />
      <circle cx={circle.mid.cx} cy={circle.mid.cy} r={circle.mid.r} fill={C.navy} />

      <foreignObject x={circle.left.cx - 55} y={circle.left.cy - 46} width={110} height={96}>
        <div className="flex h-full flex-col items-center justify-center gap-[3px] text-center leading-none">
          <TbBuildingStore style={{ width: 30, height: 30, color: C.ringBlue, strokeWidth: 2 }} />
          <span className="text-[15px] font-bold" style={{ color: C.ringBlue }}>リアル(現地)</span>
          <span className="text-[9px] font-medium" style={{ color: C.ringBlue }}>店舗･お客様の行動</span>
        </div>
      </foreignObject>
      <foreignObject x={circle.mid.cx - 66} y={circle.mid.cy - 32} width={132} height={68}>
        <div className="flex h-full flex-col items-center justify-center gap-[6px] text-center leading-none text-white">
          <span className="text-[19px] font-bold" style={{ fontFamily: "var(--font-display)" }}>Make It Tech</span>
          <span className="text-[12px] font-medium">の強み</span>
        </div>
      </foreignObject>
      <foreignObject x={circle.right.cx - 56} y={circle.right.cy - 46} width={112} height={96}>
        <div className="flex h-full flex-col items-center justify-center gap-[3px] text-center leading-none">
          <TbWorld style={{ width: 30, height: 30, color: C.ringGreen, strokeWidth: 2 }} />
          <span className="text-[15px] font-bold" style={{ color: C.ringGreen }}>インターネット上</span>
          <span className="text-[9px] font-medium" style={{ color: C.ringGreen }}>SEO･MEO･AI</span>
        </div>
      </foreignObject>
    </svg>
  );
}

/* ----------------------------------------------------------------- sheet --- */

export function MarketingFlyer({ content }: { content?: ReactNode }) {
  const { stageRef, sheetRef, scale } = useFitScale();

  return (
    <main className="mktf-print-root min-h-dvh overflow-auto bg-[#eef1f6] px-3 py-4 text-[#1a1a1a] sm:px-6">
      {/* The only @page on this route -> the print dialog defaults to A4 portrait. */}
      <style>{"@page { size: A4 portrait; margin: 0; }"}</style>

      <div className="mx-auto mb-4 flex w-full max-w-[1182px] justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#021e55] px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Printer className="h-4 w-4" />
          印刷
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#021e55]/40 bg-white px-4 py-2 text-sm font-semibold text-[#021e55] shadow-sm"
        >
          <Download className="h-4 w-4" />
          PDF保存
        </button>
      </div>

      <div
        ref={stageRef}
        className="mktf-stage mx-auto w-full"
        style={{ "--fit-scale": scale } as CSSProperties}
      >
        <div className="mktf-frame">
          <article
            ref={sheetRef}
            className="mktf-sheet h-[1672px] w-[1182px] overflow-hidden bg-white shadow-2xl print:shadow-none"
          >
            {/* ============================================ header ===== */}
            {/* Full-width navy, then a white plate on the right: that yields the
                thin navy strip above and the hairline rule below in one go. */}
            <div className="absolute inset-x-0 top-0 z-0" style={{ height: 84, background: C.navy }} />
            <div className="absolute z-10 bg-white" style={{ left: 312, top: 14, width: 870, height: 69 }} />
            <Image
              src={logo}
              alt=""
              width={84}
              height={84}
              priority
              className="absolute z-20 block"
              style={{ left: 26, top: 21, width: 42, height: 42 }}
            />
            <span
              className="absolute z-20 whitespace-nowrap text-[28px] font-bold leading-none text-white"
              style={{ left: 80, top: 31, fontFamily: "var(--font-display)" }}
            >
              Make It Tech
            </span>
            {headerItems.map((item) => (
              <Fragment key={item.key}>
                <item.Icon
                  className="absolute z-20"
                  style={{ left: item.iconLeft, top: 30, width: 40, height: 40, color: C.headerItem, strokeWidth: 2 }}
                />
                <span
                  className="absolute z-20 whitespace-nowrap text-[16px] font-bold leading-none"
                  style={{ left: item.textLeft, top: 41, color: C.headerItem }}
                >
                  {item.label}
                </span>
              </Fragment>
            ))}

            {/* ============================================== hero ===== */}
            {heroLines.map((line) => (
              <p
                key={line.top}
                className="absolute z-10 flex items-baseline whitespace-nowrap leading-none"
                style={{ left: line.left, top: line.top, color: C.navyDeep }}
              >
                {line.parts.map((part, i) => (
                  <span
                    key={i}
                    className="relative inline-block font-black"
                    style={{ fontSize: part.big ? line.big : line.small }}
                  >
                    {part.text}
                    {part.accent ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-0 rounded-full"
                        style={{ bottom: -9, height: 6, background: part.accent }}
                      />
                    ) : null}
                  </span>
                ))}
              </p>
            ))}
            <p
              className="absolute z-10 whitespace-nowrap text-[18px] font-medium leading-[33.5px]"
              style={{ left: 47, top: 264, color: C.ink }}
            >
              {heroBody.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </p>
            <CycleDiagram style={{ position: "absolute", left: 695, top: 109, width: 438, height: 250, zIndex: 10 }} />

            {/* ========================================== content ====== */}
            {content ?? (
              <>
                {contentShots.map((shot) => (
                  <Image
                    key={shot.src}
                    src={`/images/flyer/marketing/${shot.src}.webp`}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    className="absolute z-10 block"
                    style={{ left: shot.left, top: shot.top, width: shot.width, height: shot.height }}
                  />
                ))}
                <p
                  className="absolute z-10 -translate-x-1/2 whitespace-nowrap text-[22px] font-bold leading-none"
                  style={{ left: 591, top: 1516, color: C.navyDeep }}
                >
                  {closingLine}
                </p>
              </>
            )}

            {/* ============================================ footer ===== */}
            {/* 152px tall was crowding every row into its neighbour; at 112 the
                three bands (identity / services / closing) each get clear air,
                and the 40px saved widens the content rows above. */}
            <div className="absolute inset-x-0 z-10" style={{ top: 1560, height: 112, background: C.navy }} />
            <Image
              src={logo}
              alt=""
              width={80}
              height={80}
              className="absolute z-20 block"
              style={{ left: 38, top: 1568, width: 40, height: 40 }}
            />
            <span
              className="absolute z-20 whitespace-nowrap text-[26px] font-bold leading-none text-white"
              style={{ left: 88, top: 1576, fontFamily: "var(--font-display)" }}
            >
              Make It Tech
            </span>
            <p
              className="absolute z-20 whitespace-nowrap text-[13px] font-medium leading-[18px] text-white"
              style={{ left: 38, top: 1608 }}
            >
              リアルとWebをつなぎ、
              <br />
              未来の集客をつくりましょう
            </p>

            {footerItems.map((item, i) => (
              <Fragment key={item.key}>
                <span
                  className="absolute z-20 -translate-x-1/2 whitespace-nowrap text-center text-[13px] font-bold leading-none text-white"
                  style={{ left: item.left + item.width / 2, top: 1572 }}
                >
                  {item.label}
                </span>
                <item.Icon
                  className="absolute z-20"
                  style={{ left: item.left, top: 1598, width: 30, height: 30, color: "#ffffff", strokeWidth: 1.8 }}
                />
                <p
                  className="absolute z-20 whitespace-nowrap text-[12px] font-medium leading-[17px] text-white"
                  style={{ left: item.left + 36, top: 1600 }}
                >
                  {item.body[0]}
                  <br />
                  {item.body[1]}
                </p>
                {i < crossMarks.length ? (
                  <span
                    className="absolute z-20 text-[16px] font-bold leading-none"
                    style={{ left: crossMarks[i], top: 1606, color: C.yellow }}
                  >
                    ✕
                  </span>
                ) : null}
              </Fragment>
            ))}

            {/* white plate so the code keeps its quiet zone against the navy */}
            <div
              className="absolute z-20 bg-white"
              style={{ left: footerLine.left, top: footerLine.top, width: footerLine.size, height: footerLine.size }}
            />
            <Image
              src={footerLine.src}
              alt="Make It Tech 公式LINEの友だち追加QRコード"
              width={88}
              height={88}
              className="absolute z-20 block"
              style={{ left: footerLine.left + 4, top: footerLine.top + 4, width: 88, height: 88 }}
            />
            <p
              className="absolute z-20 whitespace-nowrap text-[14px] font-bold leading-[20px] text-white"
              style={{ left: 946, top: 1594 }}
            >
              公式LINEで
              <br />
              お問い合わせ
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
