"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useFitScale } from "@/components/flyer/use-fit-scale";
import {
  Bot,
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
  { Icon: TrendingUp, color: "#f5920b", title: "口コミ導線を\n改善", note: "レビュー・評価UPで\n集客力アップ" },
  { Icon: Settings, color: "#8b3fd6", title: "事前設定も\nおまかせ", note: "NFC・QRの\n事前設定も対応" },
];

const steps = [
  { n: 1, Icon: MessagesSquare, title: "ご相談", note: "ご要望や使用環境を\nヒアリングします" },
  { n: 2, Icon: MonitorCheck, title: "デザイン確認", note: "テンプレ/オリジナル/依頼\nを選択します" },
  { n: 3, Icon: Settings2, title: "NFC・QR事前設定", note: "希望動作やサイトの\n設定とテストを実施" },
  { n: 4, Icon: PackageCheck, title: "制作・納品", note: "準備・制作し\n納品します" },
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
      {/* The only @page on this route -> the print dialog defaults to A4 landscape.
          (The portrait flyer injects its own portrait @page on its own route.) */}
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
          <article ref={sheetRef} className="grev-sheet h-[1182px] w-[1672px] overflow-hidden bg-white shadow-2xl print:shadow-none">
            {/* ---- product photo (top-right) ---- */}
            <div className="absolute right-0 top-0 z-0 h-[567px] w-[928px]">
              <Image
                src={standsPhoto}
                alt="Googleレビュー用 NFC/QR スタンドの設置例（標準デザイン・オリジナルデザイン）"
                width={928}
                height={567}
                priority
                className="h-full w-full object-cover"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0, #000 76px), linear-gradient(to bottom, #000 90%, transparent 100%)",
                  WebkitMaskComposite: "source-in",
                  maskImage:
                    "linear-gradient(to right, transparent 0, #000 76px)",
                }}
              />
              {/* サンプルQRを実際に読み取れないよう「QRサンプル」表示を重ねる */}
              <div
                className="absolute flex items-center justify-center rounded-xl bg-black/90 ring-1 ring-white/70"
                style={{ left: "78.4%", top: "69%", width: "10%", height: "17%" }}
              >
                <span className="-rotate-10 text-[15px] font-extrabold leading-none text-white drop-shadow">
                  QRサンプル
                </span>
              </div>
            </div>

            {/* ---- logo ---- */}
            <div className="absolute left-12 top-[38px] z-10 flex items-center gap-3">
              <Image src={logo} alt="Make It Tech" width={96} height={96} className="h-[82px] w-[82px]" priority />
              <span className="text-[46px] font-extrabold tracking-tight" style={{ color: navy }}>
                Make It Tech
              </span>
            </div>

            {/* ---- hero headline ---- */}
            <div className="absolute left-12 top-[190px] z-10 w-[780px]">
              <h1 className="font-extrabold leading-[1.44]" style={{ color: navy }}>
                <span className="block text-[82px]">
                  <GoogleWord size={82} />
                  レビュー
                </span>
                <span className="block text-[76px]">導線を、</span>
                <span className="block text-[76px]">
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
                className="mt-3 h-[7px] w-[664px] rounded-full"
                style={{
                  background: `linear-gradient(90deg,${G.blue} 0%,${G.blue} 25%,${G.red} 25%,${G.red} 50%,${G.yellow} 50%,${G.yellow} 75%,${G.green} 75%)`,
                }}
              />
              <p className="mt-4 text-[29px] font-bold" style={{ color: navy }}>
                NFC / QR でお客様をスムーズにGoogleレビューへ
              </p>
            </div>

            {/* ---- speech bubble ---- */}
            <div className="absolute left-[486px] top-[320px] z-20 w-[348px] rounded-2xl border border-[#e3e8f0] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(27,42,69,0.12)]">
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 shrink-0" style={{ color: G.yellow, fill: G.yellow }} />
                <p className="text-[20px] font-bold leading-[1.35]" style={{ color: navy }}>
                  1つのレビューが、
                  <br />
                  お店の信頼をつくります
                </p>
              </div>
              <div className="absolute -bottom-[9px] left-10 h-4 w-4 rotate-45 border-b border-r border-[#e3e8f0] bg-white" />
            </div>

            {/* ---- pricing boxes ---- */}
            {/* 標準デザイン */}
            <div className="absolute left-12 top-[652px] z-10 flex h-[142px] w-[280px] flex-col items-center justify-center rounded-2xl border-2 bg-white" style={{ borderColor: "#2f7cf0" }}>
              <p className="text-[22px] font-bold" style={{ color: "#2f7cf0" }}>標準デザイン</p>
              <p className="mt-1 leading-none" style={{ color: "#2f7cf0" }}>
                <span className="text-[52px] font-extrabold">4,000</span>
                <span className="text-[26px] font-bold">円</span>
                <span className="ml-1 text-[15px] font-semibold text-[#64748b]">(税込)</span>
              </p>
            </div>
            {/* オリジナルデザイン */}
            <div className="absolute left-[344px] top-[652px] z-10 flex h-[142px] w-[334px] flex-col items-center justify-center rounded-2xl border-2 bg-white" style={{ borderColor: "#f5920b" }}>
              <p className="text-[22px] font-bold" style={{ color: "#f5920b" }}>オリジナルデザイン</p>
              <p className="mt-1 leading-none" style={{ color: "#f5920b" }}>
                <span className="text-[52px] font-extrabold">10,000</span>
                <span className="text-[26px] font-bold">円〜</span>
                <span className="ml-1 text-[15px] font-semibold text-[#64748b]">(税込)</span>
              </p>
            </div>
            {/* 大量オーダー */}
            <div className="absolute left-[712px] top-[652px] z-10 flex h-[142px] w-[334px] flex-col overflow-hidden rounded-2xl border-2 border-[#e8412e] bg-white">
              <p className="bg-[#e8412e] py-1.5 text-center text-[19px] font-bold text-white">大量オーダー受付中！</p>
              <div className="flex flex-1 items-center justify-center gap-3 px-4">
                <Gift className="h-10 w-10 shrink-0" style={{ color: "#e8412e" }} />
                <p className="leading-tight">
                  <span className="block text-[16px] font-semibold text-[#475569]">5個〜のご注文で</span>
                  <span className="block text-[22px] font-extrabold text-[#e8412e]">1個分無料（4+1制度）</span>
                </p>
              </div>
            </div>

            {/* ---- AIO callout (fills the space + ties reviews to AI-search optimization) ---- */}
            <div className="absolute left-[1084px] top-[598px] z-10 flex h-[196px] w-[550px] items-center gap-4 rounded-2xl border-2 border-dashed border-[#a5a0f5] bg-gradient-to-br from-[#f5f4ff] to-[#eaf0ff] px-6">
              <div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7b6ef0] to-[#5b6cf0] shadow-[0_8px_20px_rgba(91,108,240,0.35)]">
                <Bot className="h-11 w-11 text-white" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-[#5b6cf0] px-3 py-[3px] text-[14px] font-bold text-white">
                  AI検索最適化
                </span>
                <p className="mt-2 whitespace-nowrap text-[25px] font-extrabold leading-tight" style={{ color: navy }}>
                  クチコミは<span className="text-[#5b6cf0]">AIO対策</span>にもつながる
                </p>
                <p className="mt-2 text-[15px] font-medium leading-[1.5] text-[#4a5568]">
                  AIが情報を要約・推薦する時代。蓄積された高評価の口コミが、AI検索でも
                  <span className="font-bold text-[#4338ca]">「選ばれるお店」</span>
                  の判断材料になります。
                </p>
              </div>
            </div>

            {/* ---- feature icons ---- */}
            <div className="absolute left-12 top-[846px] z-10 flex w-[904px] justify-between">
              {features.map(({ Icon, color, title, note }) => (
                <div key={title} className="flex w-[216px] items-center gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="whitespace-nowrap text-[18px] font-bold leading-[1.25]" style={{ color: navy }}>
                      <Multi text={title} />
                    </p>
                    <p className="mt-1 text-[13px] leading-[1.3] text-[#64748b]">
                      <Multi text={note} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ---- NFC / QR badge ---- */}
            <div className="absolute left-[968px] top-[828px] z-10 flex h-[158px] w-[220px] flex-col items-center justify-center rounded-2xl border-2 border-[#dbe2ee] bg-white px-3">
              <div className="flex w-full items-center justify-around">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[16px] font-bold" style={{ color: navy }}>NFC</span>
                  <Wifi className="h-9 w-9 rotate-90" style={{ color: navy }} />
                </div>
                <div className="h-[72px] w-px bg-[#e3e8f0]" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[16px] font-bold" style={{ color: navy }}>QR</span>
                  <QrCode className="h-9 w-9" style={{ color: navy }} />
                </div>
              </div>
              <p className="mt-3 text-[19px] font-extrabold" style={{ color: navy }}>NFC / QR対応</p>
            </div>

            {/* ---- CTA ---- */}
            <div className="absolute left-[1214px] top-[822px] z-10 flex h-[170px] w-[420px] flex-col items-center justify-center rounded-3xl bg-[#e8412e] text-white shadow-[0_12px_30px_rgba(232,65,46,0.3)]">
              <div className="flex items-center gap-3">
                <p className="text-[44px] font-extrabold tracking-wide">導入相談受付中</p>
                <MessageCircleMore className="h-10 w-10" />
              </div>
              <div className="mt-2 h-[3px] w-[320px] rounded-full bg-white/60" />
              <p className="mt-3 text-[23px] font-bold">お気軽にご相談ください！</p>
            </div>

            {/* ---- process flow (fixed-width container + flex-1 cards so it can
                     never overflow the 1672px sheet) ---- */}
            <div className="absolute left-[44px] top-[1030px] z-10 flex w-[1584px] items-stretch gap-[12px]">
              <div className="flex w-[146px] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#2f7cf0] px-2 text-center text-[24px] font-extrabold leading-[1.2] text-white">
                導入までの
                <br />
                流れ
              </div>

              {steps.map(({ n, Icon, title, note }, i) => (
                <div key={n} className="flex flex-1 items-center">
                  <div className="flex h-[126px] flex-1 flex-col justify-center rounded-2xl border border-[#e3e8f0] bg-white px-[14px] shadow-[0_6px_16px_rgba(27,42,69,0.06)]">
                    <div className="flex items-center gap-[6px]">
                      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#2f7cf0] text-[15px] font-bold text-white">{n}</span>
                      <p className="whitespace-nowrap text-[18px] font-extrabold leading-tight" style={{ color: navy }}>{title}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Icon className="h-8 w-8 shrink-0" style={{ color: "#2f7cf0" }} />
                      <p className="text-[13px] leading-[1.3] text-[#314d74]">
                        <Multi text={note} />
                      </p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="mx-[6px] h-0 w-0 shrink-0"
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
