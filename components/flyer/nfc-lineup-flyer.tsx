"use client";

import Image from "next/image";
import { Fragment } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { Download, Printer } from "lucide-react";
import { brandMark } from "@/components/flyer/brand";
import { useFitScale } from "@/components/flyer/use-fit-scale";

const standsPhoto = "/images/flyer/nfc-stand-lineup.webp";
const logo = "/images/logo-02_MIT.png";

/** Palette sampled from the printed reference: forest green + antique gold on white. */
const C = {
  ink: "#231f1e",
  sub: "#3d3d3d",
  green: "#44733e",
  greenDeep: "#1f6b2b",
  greenPrice: "#2e6631",
  greenEc: "#1d5a27",
  greenSoft: "#e8f1e4",
  greenLine: "#a7c29d",
  greenCard: "#9cb996",
  gold: "#ae8135",
  goldDeep: "#a4792a",
  goldLine: "#d3af7d",
  goldTint: "#fdfbf5",
  cream: "#faf6eb",
  rule: "#b2b9b3",
  /* Emphasis. Warm orange reads loudest against the green/gold sheet and still
     ties back to the brand coral used in the site header wordmark. */
  accent: "#c2410c",
  marker: "#ffd98a",
} as const;

/** 蛍光ペン風の強調。色帯＋文字色の二段構えで、印刷に落としても目に入る。 */
function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span
        aria-hidden
        className="absolute inset-x-[-6px] bottom-[2px] h-[13px] rounded-[3px]"
        style={{ background: C.marker }}
      />
      <span className="relative font-extrabold" style={{ color: C.accent }}>
        {children}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------- icons ---
 * The reference uses solid pictograms rather than the outline set used
 * elsewhere on the site, so they are hand-drawn here instead of pulled from
 * lucide. All of them paint with currentColor. */

type IconProps = { className?: string; style?: CSSProperties };

function ShieldCheckIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path
        fill="currentColor"
        d="M12 1.6 3.6 4.9v6.4c0 5.2 3.5 9.4 8.4 11.1 4.9-1.7 8.4-5.9 8.4-11.1V4.9L12 1.6Z"
      />
      <path
        fill="none"
        stroke="#44733e"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.1 11.9 2.7 2.7 5.1-5.1"
      />
    </svg>
  );
}

function CartIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M1.6 2.4h3.2l.7 3h16.1c.6 0 1 .6.8 1.2l-2.3 7.1c-.2.6-.7 1-1.3 1H8.2l.4 1.7h11v2.2H7.1c-.6 0-1-.4-1.2-.9L2.9 4.6H1.6V2.4Z" />
      <circle cx="8.4" cy="21" r="1.9" />
      <circle cx="18.4" cy="21" r="1.9" />
    </svg>
  );
}

function GiftIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M10.7 6.4C9.4 4.9 8.3 4 7.4 4a1.6 1.6 0 0 0 0 3.2c.7 0 1.8-.3 3.3-.8Zm2.6 0c1.5.5 2.6.8 3.3.8a1.6 1.6 0 0 0 0-3.2c-.9 0-2 .9-3.3 2.4Z" />
      <path d="M2.4 8.2h8.4v3.6H2.4V8.2Zm10.8 0h8.4v3.6h-8.4V8.2ZM3.6 13.4h7.2v7.4H4.8a1.2 1.2 0 0 1-1.2-1.2v-6.2Zm9.6 0h7.2v6.2a1.2 1.2 0 0 1-1.2 1.2h-6v-7.4Z" />
    </svg>
  );
}

function TwoLeavesIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 48 44" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M45.5 2.5c-9.6.6-16.6 4.4-19.6 10.4-3 6.1-1.6 12.9 1.5 17.4 5.9-2.6 11.6-7.7 14.5-14 2-4.3 3-9 3.6-13.8Z" />
      <path d="M2.5 12.2c.4 6.9 2.8 12.4 7 15.9 4.1 3.5 9 4.2 12.8 3.2-.5-5.6-3.1-11.3-7.5-14.8-3.4-2.7-7.6-3.8-12.3-4.3Z" />
      <path
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M40.5 8.5C34 14 29.5 22 27.5 30.5M7.5 17c4.9 3 9.7 7.9 12.5 13"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        d="M24 42c0-4.5.7-8.4 2-11.8"
      />
    </svg>
  );
}

function PencilIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M15.6 3.2 20.8 8.4 9.4 19.8 2.6 21.4l1.6-6.8L15.6 3.2Zm-1.4 4.2L5.9 15.7l-.7 3 3-.7 8.3-8.3-2.3-2.3Z" />
      <path d="M17 1.8 22.2 7l-1.9 1.9-5.2-5.2L17 1.8Z" />
    </svg>
  );
}

function ChainIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className} style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M9.6 14.4 14.4 9.6" />
      <path d="M11.2 6.8 13.6 4.4a4.6 4.6 0 0 1 6.5 6.5l-2.4 2.4" />
      <path d="M12.8 17.2l-2.4 2.4a4.6 4.6 0 0 1-6.5-6.5l2.4-2.4" />
    </svg>
  );
}

function GearIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 1.2h4l.5 2.9c.7.2 1.3.5 1.9.9l2.5-1.6 2.8 2.8-1.6 2.5c.4.6.7 1.2.9 1.9l2.9.5v4l-2.9.5c-.2.7-.5 1.3-.9 1.9l1.6 2.5-2.8 2.8-2.5-1.6c-.6.4-1.2.7-1.9.9l-.5 2.9h-4l-.5-2.9c-.7-.2-1.3-.5-1.9-.9l-2.5 1.6-2.8-2.8 1.6-2.5c-.4-.6-.7-1.2-.9-1.9l-2.9-.5v-4l2.9-.5c.2-.7.5-1.3.9-1.9L3.2 6.2 6 3.4l2.5 1.6c.6-.4 1.2-.7 1.9-.9L10 1.2Zm2 7.2a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PhoneTapIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 30 24" className={className} style={style} aria-hidden>
      <path
        fill="currentColor"
        d="M4.4 1.2h9.4c1 0 1.8.8 1.8 1.8v18c0 1-.8 1.8-1.8 1.8H4.4c-1 0-1.8-.8-1.8-1.8V3c0-1 .8-1.8 1.8-1.8Zm.6 3v15h8.2v-15H5Z"
      />
      <path
        fill="currentColor"
        d="M14.6 9.8c1.3-.3 2.3.4 2.4 1.5.1.9-.4 1.5-1 2.1-.5.5-.8.9-.7 1.4l-1.6.3c-.2-1 .3-1.8.9-2.4.4-.4.7-.7.6-1.1 0-.3-.3-.5-.7-.4l-.5-1.1c.2-.2.4-.3.6-.3Z"
      />
      <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
        <path d="M20.4 8.6a5.6 5.6 0 0 1 0 6.8" />
        <path d="M23.6 6.2a9.6 9.6 0 0 1 0 11.6" />
        <path d="M26.8 3.8a13.6 13.6 0 0 1 0 16.4" />
      </g>
    </svg>
  );
}

function ClipboardIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M12 .8a2.4 2.4 0 0 0-2.3 1.8H7.2A2.4 2.4 0 0 0 4.8 5v16.6a2.4 2.4 0 0 0 2.4 2.4h9.6a2.4 2.4 0 0 0 2.4-2.4V5a2.4 2.4 0 0 0-2.4-2.4h-2.5A2.4 2.4 0 0 0 12 .8Zm0 1.9a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8ZM7.2 4.6h1.4v2.2h6.8V4.6h1.4V21.8H7.2V4.6Z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.9 11 1 1 1.6-1.7M8.9 15l1 1 1.6-1.7M13.6 11.6h3.1M13.6 15.6h3.1"
      />
    </svg>
  );
}

function CheckBadgeIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6.8 12.3 3.4 3.4 7-7.4"
      />
    </svg>
  );
}

function GlobeIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <g fill="none" stroke="#ffffff" strokeWidth="1.5">
        <circle cx="12" cy="12" r="7.2" />
        <ellipse cx="12" cy="12" rx="3.1" ry="7.2" />
        <path d="M4.8 12h14.4M6.3 7.6c3.4 2.6 8 4.6 12 5.3M17.7 7.6c-2.2 1.7-4.9 3.2-7.6 4.2" />
      </g>
    </svg>
  );
}

/** Line-art of the tabletop stand product, as drawn on the reference. */
function StandProductIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 132"
      className={className} style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
    >
      {/* Front panel, leaning back in a 3/4 view. */}
      <path d="M24 3 88 10 68 118 3 111Z" />
      {/* Panel thickness, visible down the right edge. */}
      <path d="M88 10 95 15 74 114 68 118" />
      {/* The L-foot, drawn as its visible outline only (no fills here, so the
          part hidden behind the panel is simply not drawn): a wedge poking out
          past the right edge, then the plate's front edge running back left to
          the panel's bottom-left corner. That trailing line is what makes the
          panel read as standing ON something rather than floating. */}
      <path d="M72 96 96 103 79 124 3 111" />
    </svg>
  );
}

/** Line-art of the flat plate product, as drawn on the reference. */
function PlateProductIcon({ className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className} style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.8"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M36 20 96 44 64 76 4 52Z" />
      <path d="M4 52v11l60 24V76M64 87l32-32V44" />
    </svg>
  );
}

/** Soft botanical sprig that bleeds out of the EC panel, as on the reference. */
function LeafSprig({ className, style }: IconProps) {
  const leaf = "M0 0C11-21 41-27 62-15 47 9 16 17 0 0Z";
  const placements = [
    "translate(112 26) rotate(-46) scale(.86)",
    "translate(104 44) rotate(-8) scale(.72)",
    "translate(70 62) rotate(-52) scale(.94)",
    "translate(66 88) rotate(-4) scale(.8)",
    "translate(30 108) rotate(-56) scale(.8)",
    "translate(28 132) rotate(2) scale(.68)",
    "translate(140 12) rotate(-28) scale(.6)",
  ];
  return (
    <svg viewBox="0 0 240 190" className={className} style={style} aria-hidden>
      <g opacity="0.6">
        <path
          d="M6 186C44 160 84 122 118 78 140 50 156 26 166 6"
          fill="none"
          stroke="#a9c6a0"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {placements.map((transform, i) => (
          <g key={i} transform={transform}>
            <path d={leaf} fill="#cadfc2" />
            <path d={leaf} fill="none" stroke="#a9c6a0" strokeWidth="2" />
            <path d="M2 -1C20 2 40 -3 58 -13" fill="none" stroke="#e9f2e5" strokeWidth="2.4" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ data --- */

const badges: { Icon: ComponentType<IconProps>; key: string; lines: [ReactNode, ReactNode] }[] = [
  { Icon: ShieldCheckIcon, key: "setup", lines: ["NFC設定・", "動作確認込み"] },
  { Icon: CartIcon, key: "order", lines: ["1個から", "注文OK"] },
  { Icon: GiftIcon, key: "bulk", lines: ["5個ごとに", <Marker key="bulk">1個分お得</Marker>] },
];

type PriceRow = { Icon: ComponentType<IconProps>; label: string; price: string };

const priceCards: {
  plan: string;
  headBg: string;
  border: string;
  bg: string;
  divider: string;
  priceColor: string;
  left: number;
  width: number;
  rows: [PriceRow, PriceRow];
}[] = [
  {
    plan: "デフォルトデザイン",
    headBg: C.green,
    border: C.greenCard,
    bg: "#fbfdfa",
    divider: "#bfd6b9",
    priceColor: C.greenPrice,
    left: 40,
    width: 392,
    rows: [
      { Icon: StandProductIcon, label: "スタンド型", price: "4,980" },
      { Icon: PlateProductIcon, label: "プレート型", price: "4,980" },
    ],
  },
  {
    plan: "オリジナルデザイン",
    headBg: C.gold,
    border: C.goldLine,
    bg: C.goldTint,
    divider: "#e2c795",
    priceColor: C.gold,
    left: 451,
    width: 399,
    rows: [
      { Icon: StandProductIcon, label: "スタンド型", price: "11,980" },
      { Icon: PlateProductIcon, label: "プレート型", price: "9,980" },
    ],
  },
];

const basics: { Icon: ComponentType<IconProps>; caption: string }[] = [
  { Icon: ChainIcon, caption: "ご指定URLの確認" },
  { Icon: GearIcon, caption: "NFC設定" },
  { Icon: PhoneTapIcon, caption: "読み取り確認" },
  { Icon: ClipboardIcon, caption: "発送前の動作チェック" },
];

/** Two QR destinations: buying (Shopify) and learning (the NFC explainer article).
 *  Both are placeholders — the Shopify domain and the article are still pending,
 *  so the sheet ships with empty QR frames to be filled once the URLs are fixed. */
const qrTiles: { key: string; label: string; caption: string; tone: string; dash: string }[] = [
  {
    key: "shop",
    label: "ECサイトはこちら ▶",
    caption: "商品一覧・ご購入",
    tone: "#2f6a33",
    dash: C.greenLine,
  },
  {
    key: "guide",
    label: "NFCの活用法 ▶",
    caption: "できること・導入事例",
    tone: C.goldDeep,
    dash: "#dfc79b",
  },
];

const notes = [
  "※ まとめ買い割引は5個ごとに1個分お得です。",
  "※ オリジナルデザインのまとめ買いは同一デザインが対象です。",
];

/* ----------------------------------------------------------------- sheet --- */

/** Section heading: green tab, label, then a dotted rule to the column edge. */
function SectionHeading({ top, label }: { top: number; label: string }) {
  return (
    <div
      className="absolute left-[40px] z-10 flex w-[809px] items-center gap-[12px]"
      style={{ top }}
    >
      <span className="h-[34px] w-[8px] rounded-[1px]" style={{ background: C.green }} />
      <span className="text-[32px] font-extrabold leading-none" style={{ color: C.ink }}>
        {label}
      </span>
      <span
        className="mt-[2px] flex-1"
        style={{ borderTop: `2px dotted ${C.greenLine}` }}
      />
    </div>
  );
}

export function NfcLineupFlyer() {
  const { stageRef, sheetRef, scale } = useFitScale();

  return (
    <main className="nfcf-print-root min-h-dvh overflow-auto bg-[#eef1ea] px-3 py-4 text-[#231f1e] sm:px-6">
      {/* The only @page on this route -> the print dialog defaults to A4 landscape. */}
      <style>{"@page { size: A4 landscape; margin: 0; }"}</style>

      <div className="mx-auto mb-4 flex w-full max-w-[1672px] justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#44733e] px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Printer className="h-4 w-4" />
          印刷
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#44733e]/40 bg-white px-4 py-2 text-sm font-semibold text-[#44733e] shadow-sm"
        >
          <Download className="h-4 w-4" />
          PDF保存
        </button>
      </div>

      <div
        ref={stageRef}
        className="nfcf-stage mx-auto w-full"
        style={{ "--fit-scale": scale } as CSSProperties}
      >
        <div className="nfcf-frame">
          <article
            ref={sheetRef}
            className="nfcf-sheet h-[1182px] w-[1672px] overflow-hidden bg-white shadow-2xl print:shadow-none"
          >
            {/* ---------------------------------------------- brand ---- */}
            <div className="absolute left-[60px] top-[29px] z-10 flex items-center gap-[18px]">
              <Image src={logo} alt="Make It Tech" width={180} height={180} priority className="h-[90px] w-[90px]" />
              <span className="text-[34px] leading-none" style={brandMark}>
                Make It Tech
              </span>
            </div>

            {/* ------------------------------------------- headline ---- */}
            <h1
              className="absolute left-[46px] top-[116px] z-10 whitespace-nowrap text-[50px] font-extrabold leading-[1.1] tracking-tight"
              style={{ color: C.ink }}
            >
              かざすだけで、
              <span style={{ color: C.greenDeep }}>見てほしいページへ。</span>
            </h1>

            <p
              className="absolute left-[46px] top-[192px] z-10 text-[22px] font-medium leading-[36px]"
              style={{ color: C.sub }}
            >
              Googleレビュー、Instagram、メニュー、予約ページなどへ、
              <br />
              スマホをかざすだけでスムーズに案内できます。
            </p>

            {/* --------------------------------------------- badges ---- */}
            <div className="absolute left-[46px] top-[285px] z-10 flex h-[80px] w-[803px] items-center justify-between">
              {badges.map(({ Icon, key, lines }, i) => (
                <Fragment key={key}>
                  {i > 0 && <span className="h-[74px] w-px shrink-0" style={{ background: "#c4c4c5" }} />}
                  <div className="flex items-center gap-[16px]">
                    <span
                      className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full"
                      style={{ background: C.green }}
                    >
                      <Icon className="h-[44px] w-[44px] text-white" />
                    </span>
                    <p
                      className="whitespace-nowrap text-[25px] font-bold leading-[36px]"
                      style={{ color: C.ink }}
                    >
                      {lines[0]}
                      <br />
                      {lines[1]}
                    </p>
                  </div>
                </Fragment>
              ))}
            </div>

            {/* ------------------------------------- use-case lead-in --- */}
            <div className="absolute left-[46px] top-[398px] z-10 flex items-center gap-[16px]">
              <TwoLeavesIcon className="h-[42px] w-[46px]" style={{ color: C.green }} />
              <span className="text-[38px] font-extrabold leading-none" style={{ color: C.ink }}>
                用途に合わせて選べます
              </span>
            </div>
            <p
              className="absolute left-[46px] top-[448px] z-10 text-[21px] font-medium"
              style={{ color: C.sub }}
            >
              レビュー促進、SNS案内、メニュー表示、予約導線づくりなどに対応。
            </p>

            {/* --------------------------------------------- pricing ---- */}
            <SectionHeading top={496} label="料金" />

            {priceCards.map((card) => (
              <div
                key={card.plan}
                className="absolute top-[542px] z-10 flex h-[234px] flex-col rounded-[14px] border-2 px-[13px] pb-[10px] pt-[11px]"
                style={{ left: card.left, width: card.width, borderColor: card.border, background: card.bg }}
              >
                <div
                  className="flex h-[45px] shrink-0 items-center justify-center rounded-[8px]"
                  style={{ background: card.headBg }}
                >
                  <span className="text-[24px] font-bold tracking-wide text-white">{card.plan}</span>
                </div>

                {card.rows.map((row, i) => (
                  <div
                    key={row.label}
                    className="flex flex-1 items-center pl-[9px] pr-[1px]"
                    style={
                      i === 1
                        ? { borderTop: `2px dashed ${card.divider}` }
                        : undefined
                    }
                  >
                    <row.Icon className="h-[54px] w-[54px] shrink-0" style={{ color: "#3a3a3a" }} />
                    <span className="ml-[14px] text-[22px] font-bold" style={{ color: C.ink }}>
                      {row.label}
                    </span>
                    <span className="ml-auto flex items-baseline" style={{ color: card.priceColor }}>
                      <span className="text-[46px] font-extrabold leading-none tracking-tight">
                        {row.price}
                      </span>
                      <span className="ml-[2px] text-[24px] font-bold leading-none">円</span>
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {/* ----------------------------------------- design fee ---- */}
            <div
              className="absolute left-[40px] top-[790px] z-10 flex h-[82px] w-[809px] items-center rounded-[14px] px-[24px]"
              style={{ background: C.cream }}
            >
              <span
                className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full"
                style={{ background: C.gold }}
              >
                <PencilIcon className="h-[32px] w-[32px] text-white" />
              </span>
              <div className="ml-[24px]">
                <p className="flex items-baseline">
                  <span className="text-[26px] font-bold" style={{ color: C.ink }}>
                    デザイン制作のご依頼
                  </span>
                  <span className="ml-[26px] text-[30px] font-extrabold" style={{ color: C.gold }}>
                    +5,000
                    <span className="text-[22px] font-bold">円</span>
                  </span>
                </p>
                <p className="mt-[5px] text-[19px] font-medium" style={{ color: C.sub }}>
                  完成データ支給なら追加制作費なし
                </p>
              </div>
            </div>

            {/* --------------------------------------- what's included -- */}
            <SectionHeading top={890} label="基本対応内容" />

            {/* Cells are content-sized (the captions differ a lot in length) and the
                leftover space is shared out evenly, matching the reference rhythm. */}
            <div className="absolute left-[31px] top-[930px] z-10 flex w-[610px] items-start justify-between">
              {basics.map(({ Icon, caption }, i) => (
                <Fragment key={caption}>
                  {i > 0 && (
                    <span
                      className="h-[128px] w-0 shrink-0"
                      style={{ borderLeft: `2px dotted ${C.rule}` }}
                    />
                  )}
                  <div className="flex flex-col items-center">
                    <span
                      className="flex h-[79px] w-[79px] items-center justify-center rounded-full"
                      style={{ background: C.greenSoft }}
                    >
                      <Icon className="h-[42px] w-[44px]" style={{ color: C.green }} />
                    </span>
                    <span
                      className="mt-[16px] whitespace-nowrap text-[17px] font-semibold"
                      style={{ color: C.ink }}
                    >
                      {caption}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>

            {/* ready-to-use callout */}
            <div
              className="absolute left-[650px] top-[930px] z-10 flex h-[152px] w-[199px] flex-col items-center justify-center rounded-[10px] border-2 bg-white"
              style={{ borderColor: "#215a28" }}
            >
              <CheckBadgeIcon className="h-[46px] w-[46px]" style={{ color: C.green }} />
              <p
                className="mt-[10px] text-center text-[22px] font-bold leading-[32px]"
                style={{ color: C.ink }}
              >
                設定済みで
                <br />
                すぐ使える状態で
                <br />
                お届け
              </p>
            </div>

            <span
              className="absolute left-[28px] top-[1087px] z-10 block h-[3px] w-[613px]"
              style={{ background: "#a2b09e" }}
            />

            {notes.map((note, i) => (
              <p
                key={note}
                className="absolute left-[36px] z-10 text-[17px] font-medium"
                style={{ top: 1101 + i * 27, color: C.sub }}
              >
                {note}
              </p>
            ))}

            {/* ----------------------------------------- product shot -- */}
            <div className="absolute left-[885px] top-[47px] z-10 h-[745px] w-[771px] overflow-hidden rounded-[18px]">
              <Image
                src={standsPhoto}
                alt="NFCスタンド・プレートの設置例（Instagram / デジタルメニュー / Googleレビュー）"
                width={1124}
                height={1086}
                priority
                className="h-full w-full object-cover"
              />
            </div>

            {/* --------------------------------------- destination panel --
                Two side-by-side QR slots:買う導線（EC）と、知る導線（NFC解説）。 */}
            <div
              className="absolute left-[885px] top-[838px] h-[324px] w-[772px] rounded-[24px] border-2"
              style={{
                borderColor: C.greenLine,
                background: "linear-gradient(135deg,#fbfdfa 0%,#f2f6ef 100%)",
              }}
            />
            <LeafSprig className="pointer-events-none absolute left-[822px] top-[1010px] z-[11] h-[172px] w-[220px]" />

            <div className="absolute left-[885px] top-[838px] z-20 h-[324px] w-[772px]">
              <div className="absolute left-[26px] top-[42px] w-[300px]">
                <GlobeIcon className="h-[84px] w-[84px]" style={{ color: C.green }} />
                <p
                  className="mt-[16px] text-[20px] font-semibold leading-[28px]"
                  style={{ color: C.ink }}
                >
                  デフォルトデザインの種類も、
                  <br />
                  NFCでできることも。
                </p>
                <p
                  className="mt-[10px] text-[33px] font-extrabold leading-none"
                  style={{ color: C.greenEc }}
                >
                  QRからチェック
                </p>
                <p className="mt-[14px] text-[16px] font-medium" style={{ color: C.sub }}>
                  気になる方は読み取ってください。
                </p>
              </div>

              <div className="absolute left-[344px] top-[26px] flex w-[402px] gap-[14px]">
                {qrTiles.map((tile) => (
                  <div key={tile.key} className="w-[194px]">
                    <div
                      className="flex h-[40px] items-center justify-center rounded-[8px]"
                      style={{ background: tile.tone }}
                    >
                      <span className="whitespace-nowrap text-[18px] font-bold text-white">
                        {tile.label}
                      </span>
                    </div>
                    <div
                      className="mt-[10px] flex h-[194px] items-center justify-center rounded-[10px] bg-white"
                      style={{ border: `2px dashed ${tile.dash}` }}
                    >
                      <span className="text-[17px] font-semibold" style={{ color: C.sub }}>
                        QRスペース
                      </span>
                    </div>
                    <p
                      className="mt-[8px] whitespace-nowrap text-center text-[15px] font-semibold"
                      style={{ color: C.ink }}
                    >
                      {tile.caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
