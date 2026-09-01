"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleCheck,
  Code2,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Layers3,
  LineChart,
  MessageCircle,
  MonitorSmartphone,
  MousePointerClick,
  Nfc,
  PenTool,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { webProductionFaqItems } from "@/content/pages/web-production";
import { cn } from "@/lib/utils";

type Feature = {
  icon: LucideIcon;
  index: string;
  title: string;
  description: string;
  points: string[];
  tone: string;
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

const features: Feature[] = [
  {
    icon: MonitorSmartphone,
    index: "01",
    title: "更新できるWebサイトをつくる",
    description:
      "CMSを利用し、お知らせやサービス情報を継続して発信できるWebサイトとして設計します。",
    points: ["スマートフォン対応", "CMS設計", "情報・画像の更新"],
    tone: "from-sky-500/15 to-cyan-400/5 text-sky-700 dark:text-sky-300",
  },
  {
    icon: Search,
    index: "02",
    title: "検索・マップで見つけてもらう",
    description:
      "Webサイト、Google検索、Googleマップの情報を整え、見つけてもらうための土台を育てます。",
    points: ["SEO", "MEO", "Googleビジネス"],
    tone: "from-emerald-500/15 to-teal-400/5 text-emerald-700 dark:text-emerald-300",
  },
  {
    icon: BrainCircuit,
    index: "03",
    title: "AIに理解される情報を増やす",
    description:
      "AI検索・生成AIによる情報探索を意識し、事業の実態や価値が伝わる情報を継続して整備します。",
    points: ["AIO", "情報設計", "コンテンツ整備"],
    tone: "from-violet-500/15 to-fuchsia-400/5 text-violet-700 dark:text-violet-300",
  },
  {
    icon: RefreshCw,
    index: "04",
    title: "公開後も改善を続ける",
    description:
      "情報更新、一般的なページ修正、構成改善、新しい検索動向に合わせた施策提案まで継続します。",
    points: ["軽微修正", "構成改善", "LINE相談"],
    tone: "from-orange-500/15 to-amber-400/5 text-orange-700 dark:text-orange-300",
  },
];

const supportItems = [
  "Webサイト公開後の継続運用",
  "軽微な修正・画像変更・情報更新",
  "一般的なページ修正・構成改善",
  "SEO・MEO・AIOの継続施策",
  "会社・店舗・サービス情報の充実",
  "Googleレビュー獲得の支援",
  "検索・AI検索の動向に応じた提案",
  "公式LINEでの連絡・相談",
];

const mobileSupportItems = [
  "公開後の継続運用",
  "修正・画像・情報更新",
  "ページ修正・構成改善",
  "SEO・MEO・AIO",
  "事業情報の充実",
  "Googleレビュー支援",
  "検索動向に応じた提案",
  "公式LINEで相談",
];

const process = [
  {
    number: "01",
    title: "ヒアリング",
    text: "事業内容、今の課題、見せたい情報、公開後の運用まで整理します。",
    icon: MessageCircle,
  },
  {
    number: "02",
    title: "構成・デザイン制作",
    text: "伝える順番と導線を設計し、実際の完成形が分かる状態まで制作します。",
    icon: PenTool,
  },
  {
    number: "03",
    title: "完成形を確認",
    text: "デザインと内容を確認し、公開・継続契約へ進むか判断できます。",
    icon: BadgeCheck,
  },
  {
    number: "04",
    title: "公開・運用開始",
    text: "CMS、検索対策、計測の土台を整え、Webサイトを公開します。",
    icon: Globe2,
  },
  {
    number: "05",
    title: "更新・改善",
    text: "検索やAIの変化、現場の状況に合わせて情報と導線を育てます。",
    icon: LineChart,
  },
];

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-90px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={cn(
        align === "center" ? "mx-auto max-w-5xl text-center" : "max-w-3xl"
      )}
    >
      <div
        className={cn(
          "mb-2 flex items-center gap-2 sm:mb-4 sm:gap-3",
          align === "center" && "justify-center"
        )}
      >
        <span className="h-px w-8 bg-primary" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">
          {eyebrow}
        </p>
      </div>
      <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground sm:mt-4 sm:text-base sm:leading-8">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

function HeroBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ scale: 1.03 }}
      animate={reduceMotion ? { scale: 1.03 } : { scale: [1.03, 1.075, 1.03] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    >
      <Image
        src="/images/web-production/hero-web-production.png"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-[58%_center] lg:object-center"
      />
    </motion.div>
  );
}

function RealWebCycle() {
  const reduceMotion = useReducedMotion();
  const steps = [
    { icon: Store, label: "来店・利用", note: "お店で体験" },
    { icon: Nfc, label: "現地でアクション", note: "NFC・QR" },
    { icon: Globe2, label: "Webへ蓄積", note: "レビュー・情報" },
    { icon: MousePointerClick, label: "次の接点へ", note: "予約・再来店" },
  ];

  return (
    <div className="relative mt-6 sm:mt-10">
      <div className="absolute left-[12%] right-[12%] top-14 hidden h-px bg-white/20 lg:block" />
      <motion.div
        className="absolute left-[12%] top-[3.38rem] hidden h-1 rounded-full bg-linear-to-r from-cyan-300 via-emerald-300 to-amber-300 lg:block"
        animate={reduceMotion ? undefined : { width: ["0%", "76%", "76%"], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              className="relative rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur sm:rounded-3xl sm:p-5"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10 text-cyan-200 sm:size-11 sm:rounded-2xl">
                  <Icon className="size-4 sm:size-5" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-semibold leading-tight text-white sm:text-base">{step.label}</p>
                  <p className="mt-1 text-[10px] text-white/55 sm:text-xs">{step.note}</p>
                </div>
                <span className="hidden pt-1 text-xs font-bold tracking-widest text-white/35 sm:block">0{index + 1}</span>
              </div>
              {index < steps.length - 1 ? (
                <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-white/40 lg:block" />
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function WebProductionPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative isolate min-h-[43rem] overflow-hidden border-b border-white/10 bg-[#06131e] text-white sm:min-h-[46rem] lg:min-h-[calc(100svh-6.5rem)]">
        <HeroBackground />
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(4,13,22,0.98)_4%,rgba(4,13,22,0.9)_42%,rgba(4,13,22,0.3)_72%,rgba(4,13,22,0.08)_100%)] lg:hidden" />
        <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(4,13,22,0.97)_0%,rgba(4,13,22,0.9)_30%,rgba(4,13,22,0.56)_51%,rgba(4,13,22,0.08)_78%)] lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-[#06131e]/70 to-transparent" />

        <div className="relative mx-auto flex min-h-[43rem] max-w-7xl items-end px-4 pb-8 pt-52 sm:min-h-[46rem] sm:px-8 sm:pb-12 sm:pt-64 lg:min-h-[calc(100svh-6.5rem)] lg:items-center lg:py-16">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full max-w-2xl">
            <motion.div variants={reveal} className="flex items-center gap-2.5">
              <span className="h-px w-8 bg-[#ff9a4d]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 sm:text-xs">
                新潟のホームページ制作・継続運用
              </p>
            </motion.div>

            <motion.h1
              variants={reveal}
              className="mt-4 text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.05em] text-white sm:mt-6 sm:text-6xl lg:text-[4.35rem]"
            >
              <span className="block whitespace-nowrap">見つけてもらい、</span>
              <span className="mt-1 block whitespace-nowrap sm:mt-2">
                <span className="text-[#ffad42]">続ける</span>HPへ。
              </span>
            </motion.h1>

            <motion.p
              variants={reveal}
              className="mt-4 max-w-xl text-xs leading-6 text-white/[0.72] sm:mt-6 sm:text-base sm:leading-8"
            >
              Web制作からSEO・MEO・AI検索対応、公開後の更新・改善まで。
              作って終わらない、事業の情報と評価が積み上がるWeb運用を支援します。
            </motion.p>

            <motion.div variants={reveal} className="mt-5 grid grid-cols-[1.35fr_0.65fr] gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
              <Button asChild size="lg" className="h-10 rounded-xl bg-[#ec6537] px-4 text-xs text-white shadow-lg shadow-black/20 hover:bg-[#d9572d] sm:h-12 sm:rounded-2xl sm:px-6 sm:text-sm">
                <Link href="/hp-lp-request">
                  HP制作を相談する <ArrowRight className="ml-1.5 size-4 sm:ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-10 rounded-xl border-white/25 bg-white/[0.08] px-4 text-xs text-white backdrop-blur hover:bg-white/15 hover:text-white sm:h-12 sm:rounded-2xl sm:px-6 sm:text-sm">
                <Link href="#pricing">料金を見る</Link>
              </Button>
            </motion.div>

            <motion.dl variants={reveal} className="mt-6 grid max-w-2xl grid-cols-3 divide-x divide-white/15 border-y border-white/15 sm:mt-8">
              {[
                ["初期費用", "0円"],
                ["制作費", "9,800円"],
                ["月額運用", "24,980円"],
              ].map(([label, value]) => (
                <div key={label} className="px-2 py-3 first:pl-0 last:pr-0 sm:px-4 sm:py-4">
                  <dt className="text-[9px] font-bold text-white/45 sm:text-xs">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-white sm:text-xl">{value}</dd>
                </div>
              ))}
            </motion.dl>

            <motion.div variants={reveal} className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-white/60 sm:mt-4 sm:text-xs">
              {["完成形を確認して判断", "SEO・MEO・AIO対応", "公開後も更新・改善"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CircleCheck className="size-3.5 text-[#ffad42]" />
                  {item}
                </span>
              ))}
              <span className="w-full text-[9px] text-white/40 sm:text-[10px]">表示価格は税込です。独自ドメイン費は別途。</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid gap-6 sm:gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="Our approach"
                title={
                  <>
                    公開は、
                    <br />
                    <span className="text-gradient">スタート地点。</span>
                  </>
                }
                description="検索・マップ・AIの情報は常に変化します。だからこそ、公開後も事業の実態、評価、コンテンツを継続して整えることを大切にしています。"
              />
              <Reveal className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.06] p-3 sm:mt-7 sm:rounded-3xl sm:p-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary sm:size-10 sm:rounded-2xl">
                    <Layers3 className="size-4 sm:size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold sm:text-base">単発施策ではなく、積み上げる運用</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-7">
                      情報更新、レビュー、アクセス、活動実態をWeb上に蓄積し、見つけてもらい続ける基盤を育てます。
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <motion.div
              className="grid grid-cols-2 gap-2 sm:gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.title}
                    variants={reveal}
                    className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl sm:rounded-[1.75rem] sm:p-6"
                  >
                    <div className={cn("absolute inset-0 bg-linear-to-br opacity-70", feature.tone)} />
                    <div className="relative">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-background/75 shadow-sm sm:size-11 sm:rounded-2xl">
                          <Icon className="size-4 sm:size-5" />
                        </span>
                        <h3 className="min-w-0 flex-1 pt-0.5 text-sm font-semibold leading-snug sm:pt-1.5 sm:text-xl">
                          {feature.title}
                        </h3>
                        <span className="hidden pt-1.5 text-xs font-bold tracking-[0.2em] text-muted-foreground/60 sm:block">
                          {feature.index}
                        </span>
                      </div>
                      <p className="mt-5 hidden text-sm leading-7 text-muted-foreground sm:block">{feature.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1 sm:mt-5 sm:gap-2">
                        {feature.points.map((point) => (
                          <span key={point} className="rounded-full border border-border/70 bg-background/60 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground sm:px-2.5 sm:py-1 sm:text-[10px]">
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#071f3f] py-8 text-white sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(50,196,191,0.18),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(244,159,75,0.14),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-8">
          <Reveal className="max-w-3xl">
            <div className="mb-2 flex items-center gap-2 sm:mb-4 sm:gap-3">
              <span className="h-px w-8 bg-cyan-300" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200 sm:text-sm">
                Real × Web
              </p>
            </div>
            <h2 className="text-2xl font-semibold leading-tight sm:text-4xl lg:text-[2.7rem]">
              店舗の「今」を、
              <br />
              Webの「これから」へつなぐ。
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-white/65 sm:mt-5 sm:text-base sm:leading-8">
              来店者の行動をレビュー、Webアクセス、メニュー、予約へつなぎ、オンライン上に評価と情報接触を積み上げます。
              リアルとインターネットの両方から、集客・評価・再来店を支援します。
            </p>
          </Reveal>

          <RealWebCycle />

          <Reveal className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur sm:mt-8 sm:gap-5 sm:rounded-[2rem] sm:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[9px] font-bold text-cyan-200 sm:px-3 sm:text-xs">
                  店舗・現地向け追加支援
                </span>
                <span className="text-[9px] text-white/45 sm:text-xs">NFC商品本体は別途</span>
              </div>
              <h3 className="mt-2 text-sm font-semibold leading-snug sm:mt-4 sm:text-2xl">
                現場の状況に合わせ、導線を随時サポート
              </h3>
              <p className="mt-3 hidden max-w-3xl text-sm leading-7 text-white/60 sm:block">
                レジ前、客席、入口、時間帯、季節、キャンペーン。設置場所とお客様の行動に合わせて、NFC・QRとWebの使い方を設計・改善します。
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-2 text-center sm:rounded-3xl sm:px-6 sm:py-4">
              <p className="text-[9px] font-bold text-white/55 sm:text-xs">基本プランに追加</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white sm:text-3xl">
                ＋15,000<span className="text-[10px] sm:text-sm">円/月</span>
              </p>
              <p className="mt-1 text-[10px] text-white/45">税込</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 py-8 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title={<>始めやすく、続ける価値が分かる料金設計</>}
            description="制作と継続運用を分けて明示します。月額費用は、サーバーを置いておくだけの維持費ではありません。"
            align="center"
          />

          <Reveal className="mt-6 sm:hidden">
            <div className="overflow-hidden rounded-[1.4rem] border border-border/70 bg-card shadow-xl shadow-slate-950/5">
              <div className="bg-[#0b2b2e] p-3 text-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-teal-200">
                    Web production &amp; growth
                  </p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white/70">
                    すべて税込
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-[0.88fr_1.12fr] divide-x divide-white/15">
                  <div className="pr-3">
                    <p className="text-[9px] font-bold text-white/50">公開時の制作費</p>
                    <p className="mt-1 flex items-end gap-1 font-semibold tabular-nums">
                      <span className="text-2xl tracking-tight">9,800</span>
                      <span className="pb-0.5 text-[10px]">円</span>
                    </p>
                    <p className="mt-1 text-[9px] text-white/45">初期費用 0円</p>
                  </div>
                  <div className="pl-3">
                    <p className="text-[9px] font-bold text-teal-100/65">公開後の継続支援</p>
                    <p className="mt-1 flex items-end gap-1 font-semibold tabular-nums">
                      <span className="text-2xl tracking-tight">24,980</span>
                      <span className="pb-0.5 text-[10px]">円/月</span>
                    </p>
                    <p className="mt-1 text-[9px] text-teal-100/45">運用・改善・集客支援</p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-start gap-2 rounded-xl border border-sky-500/20 bg-sky-500/[0.07] p-2.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">完成形を確認してから公開を判断</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                      公開を決定した場合に、制作費9,800円が発生します。
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold text-foreground">制作・公開に含まれること</p>
                    <span className="text-[9px] text-muted-foreground">ドメイン費は別途</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["CMSサイト制作", "スマホ対応", "検索・導線設計"].map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2 py-1 text-[9px] font-semibold text-muted-foreground">
                        <CircleCheck className="size-3 text-primary" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 border-t border-border/70 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold text-foreground">公開後に続く支援</p>
                    <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-bold text-teal-700 dark:text-teal-300">
                      月額プラン
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                    {mobileSupportItems.map((item) => (
                      <div key={item} className="flex items-start gap-1.5 text-[10px] leading-4 text-muted-foreground">
                        <span className="mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300">
                          <Check className="size-2.5" strokeWidth={3} />
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button asChild className="mt-3 h-10 w-full rounded-xl bg-[#0b2b2e] text-xs text-white hover:bg-[#103b3e]">
                  <Link href="/hp-lp-request">
                    HP制作を相談する <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 hidden gap-5 sm:grid lg:grid-cols-[0.82fr_1.18fr]">
            <Reveal className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/75 p-3 shadow-sm sm:rounded-[2rem] sm:p-8">
              <div className="absolute -right-10 -top-12 size-40 rounded-full bg-cyan-400/10 blur-2xl" />
              <div className="relative">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300 sm:text-xs sm:tracking-[0.18em]">
                  Web site production
                </p>
                <h3 className="mt-2 text-sm font-semibold sm:mt-4 sm:text-xl">Webサイト制作</h3>
                <div className="mt-3 flex items-end gap-1 sm:mt-6 sm:gap-2">
                  <span className="text-2xl font-semibold tabular-nums tracking-tight sm:text-5xl">9,800</span>
                  <span className="pb-0.5 text-[10px] font-semibold sm:pb-1 sm:text-base">円</span>
                </div>
                <p className="mt-1 text-[9px] text-muted-foreground sm:text-xs">税込 / 初期費用0円</p>

                <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/[0.07] p-2 sm:mt-7 sm:rounded-2xl sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-700 dark:text-sky-300 sm:size-5" />
                    <div>
                      <p className="text-[11px] font-semibold leading-4 sm:text-sm">完成形を見てから判断</p>
                      <p className="mt-1 hidden text-xs leading-6 text-muted-foreground sm:block">
                        実際のデザイン・完成形をご確認後、公開・継続契約へ進むか判断できます。
                      </p>
                    </div>
                  </div>
                </div>

                <ul className="mt-4 grid gap-1.5 text-[10px] leading-4 text-muted-foreground sm:mt-6 sm:gap-3 sm:text-sm sm:leading-normal">
                  {["CMSを利用したWebサイト制作", "スマートフォン対応", "検索を意識した情報・導線設計"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-primary sm:size-4" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[9px] leading-4 text-muted-foreground sm:mt-5 sm:text-[11px] sm:leading-5">
                  ※独自ドメインの取得費・更新費は別途です。
                </p>
              </div>
            </Reveal>

            <Reveal className="relative overflow-hidden rounded-2xl border border-primary/25 bg-[#0b2b2e] p-3 text-white shadow-xl shadow-teal-900/15 sm:rounded-[2rem] sm:p-8 sm:shadow-2xl" delay={0.08}>
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-teal-300/15 blur-3xl" />
              <div className="absolute -bottom-24 -left-20 size-64 rounded-full bg-amber-300/10 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-teal-200 sm:text-xs sm:tracking-[0.18em]">
                      Continuous growth
                    </p>
                    <h3 className="mt-2 text-sm font-semibold leading-snug sm:mt-4 sm:text-2xl">
                      Web運用・改善・マーケティング継続支援
                    </h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white/70 sm:px-3 sm:py-1 sm:text-xs">
                    月額プラン
                  </span>
                </div>

                <div className="mt-3 flex items-end gap-1 sm:mt-7 sm:gap-2">
                  <span className="text-2xl font-semibold tabular-nums tracking-tight sm:text-6xl">24,980</span>
                  <span className="pb-0.5 text-[9px] font-semibold sm:pb-1 sm:text-base">円/月</span>
                </div>
                <p className="mt-1 text-[9px] text-white/50 sm:text-xs">税込</p>

                <div className="mt-4 grid gap-1.5 sm:mt-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3">
                  {supportItems.map((item) => (
                    <div key={item} className="flex items-start gap-1.5 text-[10px] leading-4 text-white/75 sm:gap-2 sm:text-sm sm:leading-6">
                      <span className="mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full bg-teal-300/15 text-teal-200 sm:mt-1 sm:size-4">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-6">
                  <p className="hidden text-xs leading-6 text-white/50 sm:block">
                    対応範囲はサイト規模・内容を確認して事前に整理します。
                  </p>
                  <Button asChild className="h-9 rounded-lg bg-white px-2 text-[10px] text-[#0b2b2e] hover:bg-white/90 sm:h-10 sm:rounded-xl sm:px-4 sm:text-sm">
                    <Link href="/hp-lp-request">
                      制作を相談する <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/35 py-8 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <SectionHeading
            eyebrow="Process"
            title={<>完成形を確認してから、公開へ</>}
            description="相談時点で内容が固まっていなくても大丈夫です。事業内容と目的から、必要な情報と導線を一緒に整理します。"
          />

          <div className="relative mt-6 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-4 md:grid-cols-5">
            <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-border md:block" />
            {process.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.number} className="relative last:col-span-2 md:last:col-span-1" delay={index * 0.05}>
                  <article className="h-full rounded-2xl border border-border/70 bg-background/70 p-3 shadow-sm backdrop-blur sm:rounded-3xl sm:p-5">
                    <div className="relative z-10 flex items-start gap-2 sm:gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm sm:size-11 sm:rounded-2xl">
                        <Icon className="size-4 sm:size-5" />
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <span className="text-[9px] font-bold tracking-[0.14em] text-muted-foreground sm:text-[10px] sm:tracking-[0.18em]">
                          STEP {step.number}
                        </span>
                        <h3 className="mt-0.5 text-sm font-semibold sm:mt-1 sm:text-base">{step.title}</h3>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] leading-4 text-muted-foreground sm:mt-4 sm:text-xs sm:leading-6">{step.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Custom development"
                title={<>ホームページを超える仕組みも、相談できます</>}
                description="予約、会員、決済、顧客管理などは、通常のWebサイト制作とは分けて要件を整理し、Webアプリ開発として個別にお見積りします。"
              />
              <Reveal className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3">
                {[
                  [LayoutDashboard, "予約・会員機能"],
                  [Bot, "LINE連携・自動応答"],
                  [Code2, "顧客管理・マイページ"],
                  [Ticket, "クーポン・Webアプリ"],
                ].map(([Icon, label]) => {
                  const ItemIcon = Icon as LucideIcon;
                  return (
                    <div key={label as string} className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 p-2 sm:gap-3 sm:rounded-2xl sm:p-4">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground sm:size-9 sm:rounded-xl">
                        <ItemIcon className="size-3.5 sm:size-4" />
                      </span>
                      <span className="text-[10px] font-semibold leading-tight sm:text-sm">{label as string}</span>
                    </div>
                  );
                })}
              </Reveal>
            </div>

            <Reveal className="rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm sm:rounded-[2rem] sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs">FAQ</p>
                  <h2 className="mt-1 text-base font-semibold sm:mt-2 sm:text-2xl">よくある質問</h2>
                </div>
                <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary sm:size-11 sm:rounded-2xl">
                  <MessageCircle className="size-4 sm:size-5" />
                </span>
              </div>

              <div className="mt-3 divide-y divide-border/70 sm:mt-6">
                {webProductionFaqItems.map((item, index) => (
                  <details key={item.question} className="group py-3 sm:py-4" open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold marker:content-none sm:gap-4 sm:text-sm">
                      <span>{item.question}</span>
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition group-open:rotate-45">
                        <span className="text-lg font-light leading-none">＋</span>
                      </span>
                    </summary>
                    <p className="pr-8 pt-2 text-[10px] leading-5 text-muted-foreground sm:pt-3 sm:text-sm sm:leading-7">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-8 sm:pb-12">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[#102c37] px-3 py-6 text-white shadow-xl sm:rounded-[2.25rem] sm:px-10 sm:py-14 sm:shadow-2xl lg:px-14">
          <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/4 size-72 rounded-full bg-teal-300/15 blur-3xl" />
          <div className="relative grid gap-4 sm:gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-teal-200 sm:text-xs">Start with your story</p>
              <h2 className="mt-2 text-xl font-semibold leading-tight sm:mt-4 sm:text-4xl">
                まだ内容が決まっていなくても、
                <br className="hidden sm:block" />
                事業のことから聞かせてください。
              </h2>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-white/60 sm:mt-4 sm:text-base sm:leading-8">
                見せたい情報、今困っていること、公開後に続けたいことを整理し、必要なページと運用方法を提案します。
              </p>
            </div>
            <div className="grid gap-2 sm:flex sm:gap-3 lg:grid">
              <Button asChild size="lg" className="h-9 rounded-xl bg-white px-4 text-xs text-[#102c37] hover:bg-white/90 sm:h-12 sm:rounded-2xl sm:px-6 sm:text-sm">
                <Link href="/hp-lp-request">
                  HP制作を相談する <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Link
                href="/contact"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-white/20 px-4 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white sm:h-12 sm:rounded-2xl sm:px-6 sm:text-sm"
              >
                簡単なお問い合わせ <ExternalLink className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
