"use client";

import Image from "next/image";
import { Download, Mail, Monitor, Printer } from "lucide-react";
import type { CSSProperties } from "react";
import { useFitScale } from "@/components/flyer/use-fit-scale";

type MakeItTechFlyerProps = {
  siteQr: string;
  worksQr: string;
};

const heroVisual = "/images/flyer/MIT_flyer-hero-01.png";

const concerns = [
  ["サイトが古い･見づらい", "デザインや構成が時代に合っていない。スマホで見づらい"],
  ["管理費や更新費が高い", "月額コストを見直して効率化したい"],
  ["更新方法がわからない", "自分で更新できるサイトにしたい"],
  ["新規事業用を作りたい", "名刺代わり、且つ、魅力を伝えたい"],
  ["制作会社に相談しづらい", "相談先が都度バラバラ、管理が分散している"],
];

const strengths = [
  ["開発者と直接コミュニケーション", "公式LINEから気軽な質問が可能！専門用語不要！中継を介さない専門家と直接！"],
  ["要望に応じたCMS設計対応", "お知らせやメニューなど、更新･管理しやすく整えます。"],
  ["安心のサポート体制", "サーバー、データ管理･確認までまとめて支援。"],
  ["SEO/AIO/MEO対策も", "検索に必要な構成土台の整備と導入サポートも(丸投げもOK！)"],
  ["改善/修正･更新", "公開後の分析や導線改善も追加で相談できます。"],
];

const supportItems = [
  "サーバー･データベース管理",
  "CMS更新サポート",
  "SEO/MEO/AIO対策の土台整備",
  "検索状況の確認・改善相談",
  "公式LINE経由での相談対応",
  "SNS･Googleマップ連携サポート",
];

const processItems = [
  ["1", "ヒアリング", "ご要望や課題をお伺いします。"],
  ["2", "ご提案・お見積り", "最適なプランをご提示します。"],
  ["3", "草案制作･仮公開", "内容やデザインをご確認いただきます。ここで断っていただいても構いません！"],
  ["4", "本制作･SEO等の設計", "デザインと機能の本格化と、コンテンツのSEO/MEO/AIO設計を実装します。"],
  ["5", "本公開･運用", "公開。その後の運用や改善も支援します。"],
];

export function MakeItTechFlyer({ siteQr, worksQr }: MakeItTechFlyerProps) {
  const { stageRef, sheetRef, scale } = useFitScale();
  return (
    <main className="flyer-print-root min-h-dvh overflow-auto bg-[#edf6f4] px-3 py-4 text-[#13233d] sm:px-6">
      <div className="mx-auto mb-4 flex w-full max-w-5xl justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0b8f84] px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Printer className="h-4 w-4" />
          印刷
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#0b8f84]/40 bg-white px-4 py-2 text-sm font-semibold text-[#0b8f84] shadow-sm"
        >
          <Download className="h-4 w-4" />
          PDF保存
        </button>
      </div>

      <div
        ref={stageRef}
        className="flyer-stage mx-auto w-full"
        style={{ "--fit-scale": scale } as CSSProperties}
      >
        <div className="flyer-frame">
          <article ref={sheetRef} className="flyer-sheet h-362 w-5xl overflow-hidden bg-[#fffdf9] px-9 py-5 shadow-2xl print:shadow-none">
            <section className="relative min-h-[25%]">
          <div className="absolute -right-6 -top-6 z-0 w-[60%]">
            <div className="absolute -right-8 -top-8 h-60 w-60 rounded-full bg-green-400/60" />
            <div className="relative ml-auto mt-2 w-full overflow-hidden border-none p-0 shadow-none">
              <div className="relative aspect-3/2 overflow-hidden rounded-[1.2rem]">
                <Image src={heroVisual} alt="Web制作と運用支援のイメージ" fill className="object-cover" priority />
              </div>
            </div>
            <div className="absolute right-2 top-6 flex h-20 w-32 items-center justify-center rounded-xl bg-[#0b8f84]/75 text-center text-white shadow-lg">
              <p className="text-[1rem] font-bold leading-6">
                テンプレート
                <br />
                不使用
                <span className="mt-1 block text-[0.68rem] leading-4">完全オリジナルで制作</span>
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-[84%]">
            <Image
              src="/images/title-01_MIT.png"
              alt="Make It Tech"
              width={1043}
              height={491}
              className="h-auto w-64 object-contain"
              priority
            />

            <p className="mt-2 inline-block border-b border-[#13233d]/50 pb-1 font-serif text-[2.32rem] font-semibold leading-[1.12] tracking-[0.06em] text-black">
              Web制作･リニューアルから
            </p>

            <h1 className="mt-2 font-serif text-[2.82rem] font-semibold leading-[1.16] tracking-[0.03em] text-black">
              <span className="inline whitespace-nowrap bg-gray-200/70 box-decoration-clone px-1">
                <span className="text-[#2d8686]">会社のDX</span>を同時に<span className="text-[#2d9ecb]">進めませんか？</span>
              </span>
            </h1>

            <p className="mt-4 text-[0.94rem] leading-7">
              サイトを作る・直すだけで終わらせず、更新体制、顧客や業務データDX、AI活用、業務効率化まで。
              <br />
              Webと社内ITの課題を、同時にまとめて相談/対応まで行えます。
            </p>
          </div>
        </section>

        <section className="mt-3 border border-[#bac6d3] bg-white">
          <h2 className="inline-block bg-[#13233d] px-5 py-1.5 text-[0.98rem] font-bold tracking-[0.08em] text-white">
            こんなお悩み、ありませんか？
          </h2>
          <div className="grid grid-cols-5 divide-x divide-dashed divide-[#aeb8c5] px-4 py-3 text-center">
            {concerns.map(([title, note]) => (
              <div key={title} className="px-1">
                <p className="mt-0.5 text-[0.82rem] font-bold leading-4">{title}</p>
                <p className="mt-1.5 text-[0.62rem] leading-4 text-[#3b4656]">{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-xl border-2 border-[#0b978f] bg-white px-3 pb-2 pt-2">
          <h2 className="-mt-6 inline-block bg-[#fffdf9] px-4 text-[1.42rem] font-semibold tracking-[0.12em] text-[#0b978f]">
            Make It Techが選ばれる理由
          </h2>
          <div className="mt-2 grid grid-cols-5 divide-x divide-dashed divide-[#0b978f]/50 text-center">
            {strengths.map(([title, body], index) => (
              <div key={title} className="px-2 text-left">
                <div className="grid grid-cols-[1.65rem_1fr] items-center gap-1.5">
                  <p className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b978f] text-[0.78rem] font-bold text-[#0b978f]">
                    {index + 1}
                  </p>
                  <p className="text-[0.74rem] font-bold leading-4 text-[#07867f]">{title}</p>
                </div>
                <p className="mt-2 text-[0.58rem] leading-4 text-[#263244]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 grid grid-cols-[1.03fr_0.72fr_0.95fr] gap-4">
          <div className="rounded-lg border border-[#bac6d3] bg-white p-4">
            <h2 className="inline-block rounded bg-[#13233d] px-4 py-1 text-[0.92rem] font-bold text-white">料金のご案内</h2>
            <div className="mt-2 grid gap-1.5">
              {[
                ["ライト制作", "10,000", "小規模LP・名刺代わりのページ", "#0b978f"],
                ["スタンダード制作", "80,000", "CMS対応・複数ページ・問い合わせ導線設計", "#2d9ecb"],
                ["オーダー制作", "200,000", "予約・会員機能・業務システム連携など", "#d8901f"],
              ].map(([name, price, note, color]) => (
                <div key={name} className="grid grid-cols-[6.2rem_1fr] items-center gap-2 rounded-md border border-[#d7e2e6] bg-[#fbfefd] px-2 py-1">
                  <div>
                    <p className="text-[0.66rem] font-bold leading-4" style={{ color }}>
                      {name}
                    </p>
                    <p className="text-[1.12rem] font-bold leading-5" style={{ color }}>
                      {price}<span className="text-[0.58rem]">円〜</span>
                    </p>
                  </div>
                  <p className="text-[0.58rem] font-medium leading-4 text-[#3b4656]">{note}</p>
                </div>
              ))}
            </div>
            <div className="mt-1.5 rounded bg-[#c2d9e1]/60 px-3 py-1">
              <p className="text-center text-[0.7rem] font-bold">別途お見積りの例</p>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-[0.64rem] leading-4">
                <p>✓ 予約・会員機能</p>
                <p>✓ LINE連携・自動応答</p>
                <p>✓ 顧客管理・マイページ</p>
                <p>✓ 多言語対応</p>
                <p>✓ 決済機能・ECサイト</p>
                <p>✓ 業務システム開発</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#0b978f] bg-white">
            <h2 className="bg-[#0b978f] py-2 text-center text-[0.9rem] font-bold text-white rounded-t-lg">月額管理・運用サポート</h2>
            <div className="px-4 py-1">
              <p className="text-center text-[2.05rem] font-bold text-[#0b978f]">9,800<span className="text-[0.92rem]">円〜</span></p>
              <p className="text-center text-[0.6rem] font-semibold text-[#116f69]">
                ライトプランは5,000円〜対応可能
              </p>
              <ul className="mt-2 space-y-1 text-[0.62rem] leading-4">
                {supportItems.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
              <p className="mt-2 rounded bg-[#eef7f5] px-2 py-1 text-[0.58rem] font-semibold leading-4 text-[#116f69]">
                業務改善・AI活用・ツール導入などの伴走支援は内容に応じて別途お見積り
              </p>
            </div>
          </div>

          <div className="relative rounded-lg border border-[#bac6d3] bg-white p-4">
            <h2 className="text-center text-[1.4rem] font-bold tracking-[0.12em]">品質保証で安心</h2>
            <p className="mt-0.5 text-center text-[0.68rem]">サイト完成･仮公開後、ご判断いただけます</p>
            <div className="mt-3 space-y-2">
              {processItems.map(([num, title, body]) => (
                <div key={num} className="grid grid-cols-[1.55rem_1fr] gap-2 text-[0.78rem] leading-4">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b978f] font-bold text-white">{num}</span>
                  <p className="">
                    <span className="block font-bold">{title}</span>
                    <span className="text-[13px]">{body}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="absolute -right-2 top-17 flex h-18 w-18 items-center justify-center rounded-3xl bg-[#dba72d] text-center text-sm font-semibold leading-4 text-white">
              仮公開後に
              <br />
              判断OK
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-[1fr_0.9fr_0.85fr] gap-4">
          <div className="overflow-hidden rounded-lg border border-[#bac6d3] bg-white">
            <div className="bg-[#0b978f] p-4 text-white">
              <p className="text-[0.8rem]">対面/オンラインどちらも対応可能</p>
              <p className="text-[1.85rem] font-bold">相談受付中!</p>
            </div>
            <div className="grid gap-1.5 p-4 text-[0.78rem]">
              <p>✓ オンライン相談OK</p>
              <p>✓ 対面相談OK</p>
              <p>✓ ご相談・お見積り無料</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-[#bac6d3] bg-white">
            <div className="relative h-full min-h-40">
              <Image src="/images/bg-design-02.png" alt="" fill className="object-cover opacity-80" />
              <div className="relative bg-white/90 px-4 py-2 text-center">
                <p className="text-[0.82rem] font-bold leading-5">
                  「こんなことできる？」だけでもOK！
                  <br />
                  お気軽にご連絡ください。
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[#bac6d3] bg-white">
            <h2 className="bg-[#13233d] py-2 text-center text-[0.9rem] font-bold text-white rounded-t-lg">まずはWebでチェック!</h2>
            <div className="grid grid-cols-2 gap-3 p-4 text-center">
              <div>
                <Image src={siteQr} alt="公式サイトQRコード" width={112} height={112} className="mx-auto" />
                <p className="mt-2 text-[0.64rem] font-bold">公式サイト</p>
              </div>
              <div>
                <Image src={worksQr} alt="実績ページQRコード" width={112} height={112} className="mx-auto" />
                <p className="mt-2 text-[0.64rem] font-bold">制作・支援実績</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-4 grid grid-cols-[1.25fr_1fr] items-center gap-4 border-t border-[#bac6d3] pt-3">
          <div className="text-[0.82rem] leading-6">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@make-it-tech.com</p>
            <p className="flex items-center gap-2"><Monitor className="h-4 w-4" /> https://make-it-tech.com</p>
          </div>
          <p className="text-right font-serif text-[0.96rem] leading-7">
            あなたの想いを、カタチに。
            <br />
            一緒に未来をつくりましょう。
          </p>
        </footer>
          </article>
        </div>
      </div>
    </main>
  );
}
