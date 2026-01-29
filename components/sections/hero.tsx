"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type Easing, type Variants } from "framer-motion";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { heroBullets, heroTrust } from "@/content/sections/hero";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Timer } from "lucide-react";

const typePhrases = [
  "現場で回るDXを設計。",
  "最短の改善ルートを可視化。",
  "小さく作って確実に検証。",
];

const easeOut: Easing = [0.22, 1, 0.36, 1];
const easeInOut: Easing = [0.45, 0, 0.55, 1];

const contentVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

function Glow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-aurora opacity-80 hero-aurora" />
      <div className="absolute inset-0 bg-grid opacity-30 hero-grid" />
      <div
        className="absolute -left-16 top-12 hidden h-56 w-56 rounded-full blur-3xl hero-orb sm:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgb(var(--brand-sun) / 0.35), transparent 70%)",
        }}
      />
      <div
        className="absolute right-[-12%] top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full blur-3xl hero-orb hero-orb-delayed sm:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgb(var(--brand-teal) / 0.3), transparent 70%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[-35%] hidden h-[140%] w-lg -translate-x-1/2 rotate-6 opacity-60 blur-3xl hero-orb sm:block"
        style={{
          backgroundImage:
            "radial-gradient(closest-side, rgb(var(--brand-coral) / 0.28), transparent 75%)",
        }}
      />
    </div>
  );
}

export function Hero({ className }: { className?: string }) {
  const bulletPreview = heroBullets.slice(0, 2);
  const bulletRest = heroBullets.slice(2);
  const shouldReduceMotion = useReducedMotion();
  const slideDistance = shouldReduceMotion ? 0 : 16;
  const heroRef = React.useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const progressOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [0.2, 0.8, 1]);
  const progressAngle = useTransform(scrollYProgress, [0, 1], ["0deg", "320deg"]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const parallaxRotate = useTransform(scrollYProgress, [0, 1], [0, -4]);

  const [typedText, setTypedText] = React.useState(typePhrases[0]);
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (shouldReduceMotion) {
      setTypedText(typePhrases[0]);
      return;
    }

    const currentPhrase = typePhrases[phraseIndex];
    let nextCharIndex = charIndex + (isDeleting ? -1 : 1);
    let nextIsDeleting = isDeleting;
    let delay = isDeleting ? 35 : 70;

    if (!isDeleting && nextCharIndex >= currentPhrase.length) {
      nextCharIndex = currentPhrase.length;
      nextIsDeleting = true;
      delay = 1200;
    }

    if (isDeleting && nextCharIndex <= 0) {
      nextCharIndex = 0;
      nextIsDeleting = false;
      delay = 500;
    }

    const timeout = window.setTimeout(() => {
      setCharIndex(nextCharIndex);
      setIsDeleting(nextIsDeleting);
      setTypedText(currentPhrase.slice(0, nextCharIndex));
      if (isDeleting && nextCharIndex === 0) {
        setPhraseIndex((prev) => (prev + 1) % typePhrases.length);
      }
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, shouldReduceMotion]);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: slideDistance },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: easeOut },
    },
  };

  const listItemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: easeOut },
    },
  };

  const floatAnimation = shouldReduceMotion
    ? { y: 0, rotate: 0 }
    : { y: [0, -12, 0], rotate: [0, 0.6, 0] };
  const floatTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 10, repeat: Infinity, ease: easeInOut };

  return (
    <section ref={heroRef} className={cn("relative overflow-hidden pt-10 sm:pt-16", className)}>
      <Glow />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-3 sm:gap-8 sm:px-6 sm:pb-20 lg:grid-cols-2 lg:items-center lg:px-8">
        <motion.div
          className="relative"
          variants={contentVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl text-xs sm:text-sm">
              IT活用･業務改善 総合支援
            </Badge>
            <Badge
              variant="outline"
              className="rounded-xl border-primary/30 text-primary text-xs sm:text-sm"
            >
              実装型 / 現場密着
            </Badge>
            <Badge
              variant="outline"
              className="rounded-xl border-primary/30 text-primary text-xs sm:text-sm"
            >
              補助金･助成金 対応可
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-4 text-2xl font-semibold tracking-tight sm:mt-5 sm:text-5xl"
          >
            Web制作からITによる業務改善･
            <span className="text-gradient text-gradient-animate">DX</span>まで。
            <span className="block text-muted-foreground text-lg sm:text-2xl">
              “現場で回るシステム”を提供します。
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg"
          >
            {site.description}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-2 sm:mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground sm:text-base"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
              Signal
            </span>
            <span className="flex min-h-[1.4em] max-w-full items-center font-medium text-foreground min-w-72 sm:min-w-104">
              <span className="whitespace-pre">{typedText}</span>
              <span className="type-caret" aria-hidden="true" />
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 grid gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3"
          >
            <Button asChild className="rounded-xl">
              <Link href="/contact">
                無料相談へ <ArrowRight className="sm:ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/services">対応できることを見る</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 hidden gap-3 md:grid"
          >
            <motion.div variants={listVariants} className="grid gap-3">
              {heroBullets.map((b) => (
                <motion.div
                  key={b}
                  variants={listItemVariants}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{b}</span>
                </motion.div>
              ))}
              <motion.div
                variants={listItemVariants}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>IT導入補助金・小規模事業者持続化補助金などの申請サポート</span>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 grid gap-2 md:hidden">
            {bulletPreview.map((b) => (
              <div key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{b}</span>
              </div>
            ))}
          </motion.div>

          {bulletRest.length ? (
            <motion.div variants={itemVariants} className="mt-3 md:hidden">
              <MobileDisclosure summary="対応内容をもっと見る">
                <div className="grid gap-2">
                  {bulletRest.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </MobileDisclosure>
            </motion.div>
          ) : null}

          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:mt-8 sm:gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2 sm:px-3 sm:py-2">
              <ShieldCheck className="h-4 w-4" />
              対応範囲は事前に合意して進行
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/70 px-3 py-2 sm:px-3 sm:py-2">
              <Timer className="h-4 w-4" />
              まずは2週間〜の小さな改善もOK
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative hidden lg:block lg:justify-self-end"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.15 }}
          style={{ y: parallaxY }}
        >
          <motion.div
            className="absolute -left-6 top-14 hidden h-48 w-px origin-top rounded-full bg-primary/40 lg:block"
            style={{ scaleY: progressScale, opacity: progressOpacity }}
            aria-hidden="true"
          />

          <motion.div
            className="absolute -right-6 top-8 hidden items-center gap-3 rounded-2xl border border-primary/20 bg-background/70 px-3 py-2 text-[11px] text-muted-foreground shadow-sm backdrop-blur lg:flex"
            style={{ opacity: progressOpacity }}
          >
            <div className="h-9 w-9 rounded-full border border-primary/30 bg-secondary/30 p-[3px]">
              <div
                className="hero-progress-ring h-full w-full rounded-full"
                style={{
                  ...(progressAngle
                    ? ({ "--hero-progress": progressAngle } as React.CSSProperties)
                    : {}),
                }}
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-foreground">Scroll Focus</span>
              <span>改善の流れを確認</span>
            </div>
          </motion.div>

          <motion.div className="relative" animate={floatAnimation} transition={floatTransition}>
            <motion.div
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-50 blur-2xl"
              style={{
                backgroundImage:
                  "conic-gradient(from 90deg, rgb(var(--brand-sun) / 0.4), rgb(var(--brand-teal) / 0.35), rgb(var(--brand-coral) / 0.4), rgb(var(--brand-sun) / 0.4))",
                rotate: parallaxRotate,
              }}
            />
            <div className="pointer-events-none absolute -inset-2 rounded-[2.2rem] border border-primary/20" />

            <Card className="relative overflow-hidden rounded-3xl border bg-card/70 shadow-sm backdrop-blur">
              <div className="pointer-events-none absolute inset-0 bg-[url('/images/bg-light.png')] bg-cover bg-center opacity-50 dark:bg-[url('/images/bg-dark.png')]" />
              <div className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/2 translate-x-[-20%] rotate-6 bg-white/15 blur-xl hero-sheen" />

              <CardContent className="relative p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold tracking-tight">よくある課題 → 解決の方向性</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      “まず整理”して、必要なら実装へ。ムダな開発を避けます。
                    </p>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <h3 className="text-sm font-medium">問い合わせ・予約が分散（電話/LINE/紙）</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      → フォーム統一＋自動通知＋管理シートで一元化
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <h3 className="text-sm font-medium">Excelが属人化して引き継げない</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      → 入力ルール＋ビュー分離＋運用手順の整備
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <h3 className="text-sm font-medium">IT導入したいが何から？</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      → 目標/KPI→優先順位→最小実装のロードマップ
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid gap-3 sm:grid-cols-3">
                  {heroTrust.map((t) => (
                    <div key={t.title} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <t.icon className="h-4 w-4 text-primary" />
                      <h3 className="mt-2 text-sm font-medium">{t.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-muted/60 p-4">
                  <p className="text-sm font-medium">次の一手（おすすめ）</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    まずは「現状の困りごと」と「理想」を整理して、最短の改善案を作ります。
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button asChild size="sm" className="rounded-xl">
                      <Link href="/contact">相談する</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                      <Link href="/survey">LINEで相談</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
