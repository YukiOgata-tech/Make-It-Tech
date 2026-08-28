"use client";

import Image from "next/image";
import { Fragment } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { Download, Printer } from "lucide-react";
import {
  TbDeviceMobile,
  TbHandClick,
  TbMessageStar,
  TbPencil,
  TbPresentation,
  TbShoppingCart,
  TbWorld,
} from "react-icons/tb";
import { brandGradientText, GoogleWord } from "@/components/flyer/brand";
import { useFitScale } from "@/components/flyer/use-fit-scale";

const logo = "/images/logo-02_MIT.png";
const img = (name: string) => `/images/flyer/shop/${name}.webp`;

/** Sampled from the reference sheet. */
const C = {
  ink: "#0a1d33",
  blue: "#0d54ab",
  blueDeep: "#0243a3",
  coral: "#e9645f",
  coralWarm: "#f0925a",
  red: "#e45463",
  gray: "#545354",
  grayLight: "#7d7d82",
  cyan: "#138abe",
  teal: "#33938c",
  tealDeep: "#3fa29d",
  orange: "#ee8447",
  amber: "#ec952c",
  purple: "#6d4b93",
  purpleText: "#533a8c",
} as const;

/** Gradient border on a white panel: fill and border painted as two backgrounds. */
function gradientBorder(from: string, to: string, radius: number): CSSProperties {
  return {
    border: "2px solid transparent",
    borderRadius: radius,
    background: `linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,${from},${to}) border-box`,
  };
}

const pill = (from: string, to: string): CSSProperties => ({
  background: `linear-gradient(90deg,${from},${to})`,
});

/* ------------------------------------------------------------------ data --- */

type IconProps = { className?: string; style?: CSSProperties };

const features: {
  key: string;
  Icon: ComponentType<IconProps>;
  color: string;
  title: [ReactNode, ReactNode];
  titleAccent?: string;
  note: [string, string];
}[] = [
  {
    key: "review",
    Icon: TbMessageStar,
    color: C.cyan,
    title: [
      <>
        <GoogleWord />
        レビュー・
      </>,
      "口コミ導線に",
    ],
    note: ["高評価の獲得と口コミ拡散で", "お店の信頼度アップ。"],
  },
  {
    key: "site",
    Icon: TbWorld,
    color: C.teal,
    title: ["サイト・メニュー・", "SNS案内にも対応"],
    note: ["Webサイトやメニュー、予約", "ページ、SNSなど自由に設定。"],
  },
  {
    key: "design",
    Icon: TbPencil,
    color: C.orange,
    title: ["オリジナル", "デザイン対応"],
    note: ["ロゴやカラーを活かした", "オリジナルデザインが可能。"],
  },
  {
    key: "type",
    Icon: TbPresentation,
    color: C.purple,
    title: ["スタンド / プレート", "を選べる"],
    titleAccent: C.purpleText,
    note: ["設置場所や用途に合わせて", "最適なタイプを選択可能。"],
  },
  {
    key: "order",
    Icon: TbShoppingCart,
    color: C.amber,
    title: ["1個から", "注文可能"],
    note: ["小規模店舗や新規オープン", "にも導入しやすい。"],
  },
];

/**
 * Every photo is placed by the rectangle it occupies on the reference sheet,
 * scaled by 1182/1055 = 1.121. Each crop was taken at those same source pixels,
 * so rendering it at this exact box reproduces the original size and position —
 * no `max-h-*` / `object-contain` guesswork that can resolve to the wrong size.
 */
type Shot = { src: string; alt: string; left: number; top: number; width: number; height: number };

const heroShot: Shot = {
  src: "hero-stand",
  alt: "店舗カウンターに設置したオリジナルデザインのNFCスタンド",
  left: 667,
  top: 20,
  width: 500,
  height: 516,
};

const productTypes: {
  title: string;
  color: string;
  sub: string;
  center: number;
  shot: Shot;
}[] = [
  {
    title: "NFCスタンド",
    color: C.blue,
    sub: "レジ横・カウンター・卓上に",
    center: 140,
    shot: { src: "type-stand", alt: "Make It Techのロゴを印刷したNFCスタンド", left: 28, top: 953, width: 227, height: 225 },
  },
  {
    title: "NFCプレート",
    color: "#449b9b",
    sub: "壁面・テーブル・省スペースに",
    center: 382,
    shot: { src: "type-plate", alt: "デザイン入稿に対応したNFCプレートと貼り付け用テープ", left: 270, top: 963, width: 227, height: 215 },
  },
];

const designs: { caption: string; shot: Shot }[] = [
  {
    caption: "カフェ風デザイン",
    shot: {
      src: "design-cafe",
      alt: "カフェ向けオリジナルデザインのNFCプレート例",
      left: 511,
      top: 865,
      width: 216,
      height: 259,
    },
  },
  {
    caption: "定番・和食店デザイン",
    shot: {
      src: "design-washoku",
      alt: "和食店向けオリジナルデザインのNFCプレート例",
      left: 729,
      top: 863,
      width: 204,
      height: 263,
    },
  },
  {
    caption: "ラーメン店デザイン",
    shot: {
      src: "design-ramen",
      alt: "ラーメン店向けオリジナルデザインのNFCプレート例",
      left: 936,
      top: 861,
      width: 224,
      height: 266,
    },
  },
];

/** `qr` set = the real code is in; otherwise the dashed placeholder stays. */
const qrSlots: {
  left: number;
  color: string;
  border: string;
  label: string;
  qr?: { src: string; alt: string };
}[] = [
  {
    left: 721,
    color: C.blueDeep,
    border: "#133ba3",
    label: "ECサイト",
    qr: {
      src: "/images/flyer/shop/qr-shop.png",
      alt: "ECサイト（shop.make-it-tech.com）のQRコード",
    },
  },
  {
    left: 925,
    color: "#439c9b",
    border: C.tealDeep,
    label: "活用例・NFC記事",
    qr: {
      src: "/images/flyer/shop/qr-article.png",
      alt: "NFCの活用例・基礎知識をまとめた記事のQRコード",
    },
  },
];

/* ---------------------------------------------------------------- pieces --- */

/** The rounded pill that straddles a panel's top border. */
function PanelTab({
  left,
  top,
  width,
  from,
  to,
  label,
  fontSize,
}: {
  left: number;
  top: number;
  width: number;
  from: string;
  to: string;
  label: string;
  fontSize: number;
}) {
  return (
    <div
      className="absolute z-20 flex h-[38px] items-center justify-center rounded-full"
      style={{ left, top, width, ...pill(from, to) }}
    >
      <span className="font-bold tracking-wide text-white" style={{ fontSize }}>
        {label}
      </span>
    </div>
  );
}

/** One numbered step of the ご利用の流れ row. */
function FlowStep({
  n,
  color,
  lines,
  Icon,
  iconSize,
}: {
  n: number;
  color: string;
  lines: string[];
  Icon: ComponentType<IconProps>;
  iconSize: number;
}) {
  return (
    <div className="flex items-center gap-[14px]">
      <span
        className="flex h-[41px] w-[41px] shrink-0 items-center justify-center rounded-full text-[24px] font-bold text-white"
        style={{ background: color }}
      >
        {n}
      </span>
      <p className="whitespace-nowrap text-[23px] font-bold leading-[30px]" style={{ color: C.ink }}>
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
      <Icon className="shrink-0" style={{ width: iconSize, height: iconSize, color: C.ink }} />
    </div>
  );
}

/** A photo pinned to its exact rectangle on the sheet. */
function Shot({ shot, priority = false }: { shot: Shot; priority?: boolean }) {
  return (
    <Image
      src={img(shot.src)}
      alt={shot.alt}
      width={shot.width}
      height={shot.height}
      priority={priority}
      unoptimized
      className="absolute z-10 block"
      style={{ left: shot.left, top: shot.top, width: shot.width, height: shot.height }}
    />
  );
}

function FlowArrow() {
  return (
    <span
      className="shrink-0"
      style={{
        width: 0,
        height: 0,
        borderTop: "13px solid transparent",
        borderBottom: "13px solid transparent",
        borderLeft: `16px solid ${C.ink}`,
      }}
    />
  );
}

/* ----------------------------------------------------------------- sheet --- */

export function ShopFlyer() {
  const { stageRef, sheetRef, scale } = useFitScale();

  return (
    <main className="shopf-print-root min-h-dvh overflow-auto bg-[#eef1f6] px-3 py-4 text-[#0a1d33] sm:px-6">
      {/* The only @page on this route -> the print dialog defaults to A4 portrait. */}
      <style>{"@page { size: A4 portrait; margin: 0; }"}</style>

      <div className="mx-auto mb-4 flex w-full max-w-[1182px] justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0d54ab] px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Printer className="h-4 w-4" />
          印刷
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#0d54ab]/40 bg-white px-4 py-2 text-sm font-semibold text-[#0d54ab] shadow-sm"
        >
          <Download className="h-4 w-4" />
          PDF保存
        </button>
      </div>

      <div
        ref={stageRef}
        className="shopf-stage mx-auto w-full"
        style={{ "--fit-scale": scale } as CSSProperties}
      >
        <div className="shopf-frame">
          <article
            ref={sheetRef}
            className="shopf-sheet h-[1672px] w-[1182px] overflow-hidden bg-white shadow-2xl print:shadow-none"
          >
            {/* =========================================== 1. header ==== */}
            <div className="absolute left-[50px] top-[34px] z-10 flex items-center gap-[24px]">
              <Image
                src={logo}
                alt="Make It Tech"
                width={226}
                height={226}
                priority
                unoptimized
                className="h-[113px] w-[117px]"
              />
              <span
                className="text-[60px] font-semibold leading-none tracking-tight"
                style={{ ...brandGradientText, fontFamily: "var(--font-display)" }}
              >
                Make It Tech <span className="text-[40px]"> -nfc-</span>
              </span>
            </div>

            <h1
              className="absolute left-[44px] top-[163px] z-10 whitespace-nowrap text-[56px] font-bold leading-none tracking-tight"
              style={{ color: C.blue }}
            >
              <GoogleWord />
              <span className="text-[36px]">レビュー･</span>SNS<span className="text-[36px]">への導線を</span>
            </h1>
            <p
              className="absolute left-[43px] top-[258px] z-10 whitespace-nowrap text-[58px] font-bold leading-none tracking-tight"
              style={{ color: C.ink }}
            >
              
              <span
                style={{
                  backgroundImage: `linear-gradient(100deg,${C.coralWarm},${C.coral})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                NFCで構築しませんか？
              </span>
            </p>

            <p
              className="absolute left-[48px] top-[360px] z-10 text-[22px] font-bold leading-[39px]"
              style={{ color: C.ink }}
            >
              レビューやサイトアクセスは、
              <span style={{ color: C.blueDeep }}>MEO･AIO対策</span>
              の重要な接点。
              <br />
              客観的な評価指標として、
              <span style={{ color: C.blueDeep }}>AI</span>
              <span style={{ color: C.red }}>が重視する情報導線づくり</span>
              にも。
            </p>

            <p
              className="absolute left-[45px] top-[460px] z-10 text-[21px] font-medium leading-[34px]"
              style={{ color: C.ink }}
            >
              お客様がスマホをかざすだけで、
              <GoogleWord />
              レビュー、サイト、
              <br />
              SNS、メニュー、予約ページなどへスムーズに案内できます。
            </p>

            {/* 1080x1115 = 印刷時309dpi。unoptimized なので原寸のまま配信される。
                四辺のアルファは画像側でぼかしてあり、白地に溶けて境界が出ない。 */}
            <Shot shot={heroShot} priority />

            {/* ========================================= 2. features ==== */}
            {features.map((feature, i) => (
              <div
                key={feature.key}
                className="absolute top-[550px] z-10 h-[228px] rounded-[16px] bg-white shadow-[0_3px_14px_rgba(10,29,51,0.13)]"
                style={{ left: 39 + i * 223.5, width: 211 }}
              >
                <feature.Icon
                  className="absolute left-1/2 top-[17px] -translate-x-1/2"
                  style={{ width: 68, height: 68, color: feature.color, strokeWidth: 1.6 }}
                />
                <p
                  className="absolute inset-x-0 top-[95px] text-center text-[19px] font-bold leading-[28px]"
                  style={{ color: feature.titleAccent ?? C.ink }}
                >
                  <span className="block whitespace-nowrap">{feature.title[0]}</span>
                  <span className="block whitespace-nowrap" style={{ color: C.ink }}>
                    {feature.title[1]}
                  </span>
                </p>
                <p
                  className="absolute inset-x-0 top-[166px] text-center text-[14px] font-medium leading-[21px]"
                  style={{ color: C.gray }}
                >
                  <span className="block whitespace-nowrap">{feature.note[0]}</span>
                  <span className="block whitespace-nowrap">{feature.note[1]}</span>
                </p>
              </div>
            ))}

            {/* =================================== 3. types / designs === */}
            <div
              className="absolute left-[21px] top-[825px] z-0 h-[367px] w-[484px]"
              style={gradientBorder("#7fb4dd", "#8fc9c5", 20)}
            />
            <PanelTab
              left={124}
              top={806}
              width={235}
              from="#3689bd"
              to="#52a6a2"
              label="選べる2つのタイプ"
              fontSize={22}
            />
            <span
              className="absolute left-[261px] top-[862px] z-10 h-[323px] w-0"
              style={{ borderLeft: "2px dashed #d9dde3" }}
            />

            {productTypes.map((type) => (
              <Fragment key={type.title}>
                <p
                  className="absolute top-[858px] z-10 -translate-x-1/2 whitespace-nowrap text-[22px] font-bold leading-none"
                  style={{ left: type.center, color: type.color }}
                >
                  {type.title}
                </p>
                <p
                  className="absolute top-[887px] z-10 -translate-x-1/2 whitespace-nowrap text-[14px] font-medium leading-none"
                  style={{ left: type.center, color: C.ink }}
                >
                  {type.sub}
                </p>
                <Shot shot={type.shot} />
              </Fragment>
            ))}

            <div
              className="absolute left-[509px] top-[825px] z-0 h-[367px] w-[655px]"
              style={gradientBorder("#f6c08e", "#eb9aa2", 20)}
            />
            <PanelTab
              left={660}
              top={806}
              width={291}
              from="#f1955b"
              to="#e96b74"
              label="オリジナルデザイン例"
              fontSize={22}
            />

            {designs.map((design) => (
              <Fragment key={design.shot.src}>
                <Shot shot={design.shot} />
                <p
                  className="absolute top-[1153px] z-10 -translate-x-1/2 whitespace-nowrap text-[18px] font-medium leading-none"
                  style={{ left: design.shot.left + design.shot.width / 2, color: "#4b4b4b" }}
                >
                  {design.caption}
                </p>
              </Fragment>
            ))}

            {/* ====================================== 4. flow / price === */}
            <div
              className="absolute left-[22px] top-[1213px] z-0 h-[157px] w-[873px]"
              style={gradientBorder("#3c72b3", "#61ab9f", 18)}
            />
            <div
              className="absolute left-[24px] top-[1215px] z-10 flex h-[40px] w-[401px] items-center rounded-tl-[16px] rounded-br-[18px] pl-[28px]"
              style={pill("#3282bd", "#459a94")}
            >
              <span className="text-[22px] font-bold tracking-wide text-white">ご利用の流れ</span>
            </div>

            <div className="absolute left-[46px] top-[1264px] z-10 flex w-[830px] items-center justify-between">
              <FlowStep n={1} color="#1256aa" lines={["スマホを", "かざす"]} Icon={TbHandClick} iconSize={64} />
              <FlowArrow />
              <FlowStep n={2} color="#3a9c9c" lines={["ページが", "開く"]} Icon={TbDeviceMobile} iconSize={60} />
              <FlowArrow />
              <FlowStep
                n={3}
                color="#ed7d65"
                lines={["レビュー・", "アクセスに"]}
                Icon={TbMessageStar}
                iconSize={64}
              />
            </div>

            <div className="absolute left-[908px] top-[1232px] z-10 h-[137px] w-[256px] overflow-hidden rounded-[16px] bg-white shadow-[0_3px_14px_rgba(10,29,51,0.13)]">
              <p
                className="flex h-[37px] items-center justify-center text-[20px] font-bold text-white"
                style={pill("#f2a53d", "#eb736c")}
              >
                価格の目安
              </p>
              <p className="mt-[12px] text-center leading-none" style={{ color: C.ink }}>
                <span className="text-[45px] font-bold tracking-tight">4,980</span>
                <span className="text-[28px] font-bold">円〜</span>
              </p>
              <p className="mt-[12px] text-center text-[15px] font-medium" style={{ color: C.grayLight }}>
                ※詳細はECサイトをご確認ください
              </p>
            </div>

            {/* ============================================= 5. to EC === */}
            <p
              className="absolute left-[30px] top-[1408px] z-10 flex items-center gap-[14px] whitespace-nowrap text-[37px] font-bold leading-none"
              style={{ color: C.blueDeep }}
            >
              <span className="text-[30px] font-bold" style={{ color: "#c3cee3" }}>
                {"\\\\"}
              </span>
              商品詳細・デザイン例はECサイトへ
              <span className="text-[30px] font-bold" style={{ color: "#c3cee3" }}>
                {"//"}
              </span>
            </p>

            <div
              className="absolute left-[74px] top-[1472px] z-10 flex h-[41px] w-[550px] items-center justify-center rounded-[8px]"
              style={pill("#1d63b3", "#4ca5a6")}
            >
              <span className="text-[26px] font-bold tracking-wide text-white">活用例・NFC記事もチェック</span>
            </div>

            <p
              className="absolute left-[114px] top-[1526px] z-10 text-[18px] font-medium leading-[24px]"
              style={{ color: C.gray }}
            >
              導入事例や効果的な活用方法、NFCの基礎知識など、
              <br />
              役立つ情報を発信しています。
            </p>

            {qrSlots.map((slot) => (
              <div key={slot.label} className="absolute top-[1405px] z-10 w-[168px]" style={{ left: slot.left }}>
                {slot.qr ? (
                  <div className="flex h-[148px] w-full items-center justify-center">
                    <Image
                      src={slot.qr.src}
                      alt={slot.qr.alt}
                      width={148}
                      height={148}
                      unoptimized
                      className="block"
                      style={{ width: 148, height: 148 }}
                    />
                  </div>
                ) : (
                  <div
                    className="h-[148px] w-full rounded-[12px] bg-white"
                    style={{ border: `2px dashed ${slot.border}` }}
                  />
                )}
                <p
                  className="mt-[12px] whitespace-nowrap text-center text-[18px] font-bold"
                  style={{ color: slot.color }}
                >
                  {slot.label}
                </p>
              </div>
            ))}

            {/* ============================================ 6. footer === */}
            <div
              className="absolute inset-x-0 top-[1604px] z-10 flex h-[68px] items-center justify-center gap-[24px] text-white"
              style={{
                background:
                  "linear-gradient(90deg,#084eaa 0%,#1f69b4 12%,#438ebc 25%,#28a0b8 38%,#58aaa7 50%,#7fbba6 63%,#bab77d 76%,#f3a73d 88%,#ef8757 100%)",
              }}
            >
              <span className="flex items-center gap-[14px]">
                <TbWorld style={{ width: 34, height: 34 }} />
                <span className="text-[27px] font-bold tracking-tight">shop.make-it-tech.com</span>
              </span>
              <span className="h-[30px] w-px bg-white/90" />
              <span className="text-[23px] font-medium">お店の「伝える」を、もっとスマートに。</span>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
