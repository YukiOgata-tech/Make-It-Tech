"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useFitScale } from "@/components/flyer/use-fit-scale";
import {
  CircleCheckBig,
  Download,
  Gift,
  MessageCircleMore,
  MessagesSquare,
  MonitorCheck,
  Nfc,
  PackageCheck,
  Printer,
  QrCode,
  Settings,
  Settings2,
  Star,
  Store,
  TrendingUp,
  Wifi,
} from "lucide-react";

const standsPhoto = "/images/flyer/google-review-stands.webp";
const logo = "/images/logo-02_MIT.png";

const G = {
  blue: "#4285F4",
  red: "#EA4335",
  yellow: "#FBBC05",
  green: "#34A853",
};

const navy = "#1b2a45";

// "Google" in its brand colours.
function GoogleWord({ size }: { size: number }) {
  const letters: [string, string][] = [
    ["G", G.blue],
    ["o", G.red],
    ["o", G.yellow],
    ["g", G.blue],
    ["l", G.green],
    ["e", G.red],
  ];
  return (
    <span style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.01em" }}>
      {letters.map(([ch, color], i) => (
        <span key={i} style={{ color }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

const features = [
  { Icon: Nfc, color: "#2f7cf0", title: "スマホを\nタッチするだけ", note: "NFC / QRで簡単アクセス" },
  { Icon: Store, color: "#22a06b", title: "設置かんたん", note: "置くだけで\nすぐに使える" },
  { Icon: TrendingUp, color: "#f5920b", title: "口コミ導線を\n改善", note: "レビュー数・評価UPで\n集客力アップ" },
  { Icon: Settings, color: "#8b3fd6", title: "事前設定も\nおまかせ", note: "NFC・QRの\n事前設定もこちらで対応" },
];

const steps = [
  { n: 1, Icon: MessagesSquare, title: "ご相談", note: "ご要望や使用環境を\nヒアリングします" },
  { n: 2, Icon: MonitorCheck, title: "デザイン確認", note: "デザイン案をご確認\nいただきます" },
  { n: 3, Icon: Settings2, title: "NFC・QR事前設定", note: "NFC・QRを事前設定し\n動作テストを実施" },
  { n: 4, Icon: PackageCheck, title: "制作・納品", note: "丁寧に制作し\n迅速に納品します" },
  { n: 5, Icon: CircleCheckBig, title: "設置してすぐ使える", note: "置くだけで運用開始\nすぐに使えます" },
];

// Renders text with \n as line breaks.
function Multi({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
    </>
  );
}

export function GoogleReviewFlyer() {
  const { stageRef, sheetRef, scale } = useFitScale();
  return (
    <main className="grev-print-root min-h-dvh overflow-auto bg-[#e9eef6] px-3 py-4 text-[#1b2a45] sm:px-6">
      {/* Force A4 landscape for this route's print output. Rendered in the body so
          it overrides the portrait flyer's default @page from globals.css. */}
      <style>{"@page { size: A4 landscape; margin: 0; }"}</style>
      <div className="mx-auto mb-4 flex w-full max-w-[1672px] justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2f7cf0] px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Printer className="h-4 w-4" />
          印刷
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#2f7cf0]/40 bg-white px-4 py-2 text-sm font-semibold text-[#2f7cf0] shadow-sm"
        >
          <Download className="h-4 w-4" />
          PDF保存
        </button>
      </div>

      <div
        ref={stageRef}
        className="grev-stage mx-auto w-full"
        style={{ "--fit-scale": scale } as CSSProperties}
      >
        <div className="grev-frame">
          <article ref={sheetRef} className="grev-sheet h-[941px] w-[1672px] overflow-hidden bg-white shadow-2xl print:shadow-none">
            {/* ---- product photo (top-right) ---- */}
            <div className="absolute right-0 top-0 z-0 h-[536px] w-[877px]">
              <Image
                src={standsPhoto}
                alt="Googleレビュー用 NFC/QR スタンドの設置例（標準デザイン・オリジナルデザイン）"
                width={877}
                height={536}
                priority
                className="h-full w-full object-cover"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0, #000 70px), linear-gradient(to bottom, #000 88%, transparent 100%)",
                  WebkitMaskComposite: "source-in",
                  maskImage:
                    "linear-gradient(to right, transparent 0, #000 70px)",
                }}
              />
              {/* サンプルQRを実際に読み取れないよう「サンプル」表示を重ねる */}
              <div
                className="absolute flex items-center justify-center rounded-xl bg-black/90 ring-1 ring-white/50"
                style={{ left: 684, top: 374, width: 86, height: 86 }}
              >
                <span className="-rotate-10 text-[15px] font-extrabold leading-none text-white drop-shadow">
                  QRサンプル
                </span>
              </div>
            </div>

            {/* ---- logo ---- */}
            <div className="absolute left-11 top-6 z-10 flex items-center gap-3">
              <Image src={logo} alt="Make It Tech" width={92} height={92} className="h-[74px] w-[74px]" priority />
              <span className="text-[40px] font-extrabold tracking-tight" style={{ color: navy }}>
                Make It Tech
              </span>
            </div>

            {/* ---- hero headline ---- */}
            <div className="absolute left-11 top-[140px] z-10 w-[730px]">
              <h1 className="font-extrabold leading-[1.4]" style={{ color: navy }}>
                <span className="block text-[76px]">
                  <GoogleWord size={76} />
                  レビュー
                </span>
                <span className="block text-[70px]">導線を、</span>
                <span className="block text-[70px]">
                  もっと
                  <span
                    style={{
                      background: "linear-gradient(90deg,#2f7cf0 0%,#22a3c9 45%,#22a06b 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    スマート
                  </span>
                  に。
                </span>
              </h1>
              <div
                className="mt-2 h-[6px] w-[610px] rounded-full"
                style={{
                  background: `linear-gradient(90deg,${G.blue} 0%,${G.blue} 25%,${G.red} 25%,${G.red} 50%,${G.yellow} 50%,${G.yellow} 75%,${G.green} 75%)`,
                }}
              />
              <p className="mt-3 text-[27px] font-bold" style={{ color: navy }}>
                NFC / QR でお客様をスムーズにGoogleレビューへ
              </p>
            </div>

            {/* ---- speech bubble ---- */}
            <div className="absolute left-[452px] top-[248px] z-20 w-[330px] rounded-2xl border border-[#e3e8f0] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(27,42,69,0.12)]">
              <div className="flex items-center gap-2">
                <Star className="h-7 w-7 shrink-0" style={{ color: G.yellow, fill: G.yellow }} />
                <p className="text-[19px] font-bold leading-[1.35]" style={{ color: navy }}>
                  1つのレビューが、
                  <br />
                  お店の信頼をつくります
                </p>
              </div>
              <div className="absolute -bottom-[9px] left-10 h-4 w-4 rotate-45 border-b border-r border-[#e3e8f0] bg-white" />
            </div>

            {/* ---- pricing boxes ---- */}
            {/* 標準デザイン */}
            <div className="absolute left-11 top-[556px] z-10 flex h-[104px] w-[252px] flex-col items-center justify-center rounded-2xl border-2 bg-white" style={{ borderColor: "#2f7cf0" }}>
              <p className="text-[19px] font-bold" style={{ color: "#2f7cf0" }}>標準デザイン</p>
              <p className="leading-none" style={{ color: "#2f7cf0" }}>
                <span className="text-[42px] font-extrabold">4,000</span>
                <span className="text-[22px] font-bold">円</span>
                <span className="ml-1 text-[13px] font-semibold text-[#64748b]">(税込)</span>
              </p>
            </div>
            {/* オリジナルデザイン */}
            <div className="absolute left-[308px] top-[556px] z-10 flex h-[104px] w-[300px] flex-col items-center justify-center rounded-2xl border-2 bg-white" style={{ borderColor: "#f5920b" }}>
              <p className="text-[19px] font-bold" style={{ color: "#f5920b" }}>オリジナルデザイン</p>
              <p className="leading-none" style={{ color: "#f5920b" }}>
                <span className="text-[42px] font-extrabold">10,000</span>
                <span className="text-[22px] font-bold">円〜</span>
                <span className="ml-1 text-[13px] font-semibold text-[#64748b]">(税込)</span>
              </p>
            </div>
            {/* 大量オーダー */}
            <div className="absolute left-[632px] top-[556px] z-10 h-[104px] w-[300px] overflow-hidden rounded-2xl border-2 border-[#e8412e] bg-white">
              <p className="bg-[#e8412e] py-1 text-center text-[17px] font-bold text-white">大量オーダー受付中！</p>
              <div className="flex items-center justify-center gap-2 px-3 py-2">
                <Gift className="h-8 w-8 shrink-0" style={{ color: "#e8412e" }} />
                <p className="leading-tight">
                  <span className="block text-[14px] font-semibold text-[#475569]">5個〜のご注文で</span>
                  <span className="block text-[19px] font-extrabold text-[#e8412e]">1個分無料（4+1制度）</span>
                </p>
              </div>
            </div>

            {/* ---- feature icons ---- */}
            <div className="absolute left-11 top-[688px] z-10 flex w-[890px] justify-between">
              {features.map(({ Icon, color, title, note }) => (
                <div key={title} className="flex w-[214px] items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold leading-[1.2]" style={{ color: navy }}>
                      <Multi text={title} />
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[1.25] text-[#64748b]">
                      <Multi text={note} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ---- NFC / QR badge ---- */}
            <div className="absolute left-[958px] top-[662px] z-10 flex h-[128px] w-[206px] flex-col items-center justify-center rounded-2xl border-2 border-[#dbe2ee] bg-white px-3">
              <div className="flex w-full items-center justify-around">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[15px] font-bold" style={{ color: navy }}>NFC</span>
                  <Wifi className="h-8 w-8 rotate-90" style={{ color: navy }} />
                </div>
                <div className="h-16 w-px bg-[#e3e8f0]" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[15px] font-bold" style={{ color: navy }}>QR</span>
                  <QrCode className="h-8 w-8" style={{ color: navy }} />
                </div>
              </div>
              <p className="mt-2 text-[17px] font-extrabold" style={{ color: navy }}>NFC / QR対応</p>
            </div>

            {/* ---- CTA ---- */}
            <div className="absolute left-[1190px] top-[658px] z-10 flex h-[134px] w-[474px] flex-col items-center justify-center rounded-3xl bg-[#e8412e] text-white shadow-[0_12px_30px_rgba(232,65,46,0.3)]">
              <div className="flex items-center gap-3">
                <p className="text-[40px] font-extrabold tracking-wide">導入相談受付中</p>
                <MessageCircleMore className="h-9 w-9" />
              </div>
              <div className="mt-1 h-[3px] w-[300px] rounded-full bg-white/60" />
              <p className="mt-2 text-[21px] font-bold">お気軽にご相談ください！</p>
            </div>

            {/* ---- process flow ---- */}
            <div className="absolute left-11 top-[818px] z-10 flex items-stretch gap-3">
              <div className="flex w-[140px] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#2f7cf0] px-2 text-center text-[24px] font-extrabold leading-[1.2] text-white">
                導入までの
                <br />
                流れ
              </div>

              {steps.map(({ n, Icon, title, note }, i) => (
                <div key={n} className="flex items-center">
                  <div className="flex h-[108px] w-[256px] flex-col justify-center rounded-2xl border border-[#e3e8f0] bg-white px-4 shadow-[0_6px_16px_rgba(27,42,69,0.06)]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2f7cf0] text-[15px] font-bold text-white">{n}</span>
                      <p className="whitespace-nowrap text-[18px] font-extrabold leading-tight" style={{ color: navy }}>{title}</p>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Icon className="h-8 w-8 shrink-0" style={{ color: "#2f7cf0" }} />
                      <p className="text-[13px] leading-[1.25] text-[#64748b]">
                        <Multi text={note} />
                      </p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="mx-1 h-0 w-0"
                      style={{
                        borderTop: "11px solid transparent",
                        borderBottom: "11px solid transparent",
                        borderLeft: "13px solid #2f7cf0",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
