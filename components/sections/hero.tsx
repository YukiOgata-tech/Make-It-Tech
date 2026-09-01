"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  ExternalLink,
  Globe2,
  Nfc,
  PanelsTopLeft,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { nfcSite } from "@/content/nfc/site";
import { cn } from "@/lib/utils";

type ServiceLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
};

const serviceLinks: ServiceLink[] = [
  {
    title: "ホームページ制作",
    description: "制作・SEO・継続運用",
    href: "/web-production",
    icon: Globe2,
  },
  {
    title: "FDE・AI業務DX",
    description: "現場伴走・AI導入・業務改善",
    href: "/services/fde",
    icon: BrainCircuit,
  },
  {
    title: "システム・アプリ",
    description: "業務に合わせた設計・開発",
    href: "/services",
    icon: PanelsTopLeft,
  },
  {
    title: "NFC・店舗導線",
    description: "リアルとWebの接点づくり",
    href: nfcSite.url,
    icon: Nfc,
    external: true,
  },
];

const fdeSteps = ["課題整理", "設計", "実装", "現場定着"] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
};

function HeroBackground({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ scale: 1.02 }}
      animate={reduceMotion ? { scale: 1.02 } : { scale: [1.02, 1.055, 1.02] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    >
      <Image
        src="/images/hero-dx-fde-network.png"
        alt="Make It Techを中心に、Web制作、AI、DX、システム開発、業務改善がつながるイメージ"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-[52%_center] lg:object-center"
      />
    </motion.div>
  );
}

export function Hero({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b border-white/10 bg-[#07171d] text-white",
        className
      )}
    >
      <HeroBackground reduceMotion={reduceMotion} />
      <div className="pointer-events-none absolute inset-0 bg-black/18" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,14,22,0.72)_0%,rgba(3,14,22,0.35)_28%,rgba(3,14,22,0.72)_72%,rgba(3,14,22,0.98)_100%)] lg:hidden" />
      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(3,14,22,0.98)_0%,rgba(3,14,22,0.92)_32%,rgba(3,14,22,0.62)_53%,rgba(3,14,22,0.16)_78%,rgba(3,14,22,0.36)_100%)] lg:block" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#07171d] via-[#07171d]/82 to-transparent" />

      <div className="relative mx-auto flex min-h-[43rem] max-w-7xl flex-col justify-end px-4 py-8 sm:min-h-[48rem] sm:px-8 sm:py-14 lg:min-h-[calc(100svh-6rem)] lg:justify-between lg:py-16">
        <div className="flex flex-1 items-center">
          <motion.div
            className="max-w-3xl"
            variants={containerVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2.5">
              <span className="h-px w-7 bg-[#ef7a4f] sm:w-10" />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/82 sm:text-xs">
                新潟のIT・DX・AI活用支援
              </p>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:mt-5 sm:text-5xl lg:text-[4.1rem]"
            >
              <span className="block">事業の課題を、</span>
              <span className="mt-1 block sm:mt-2">
                <span className="text-[#ff9a60]">IT・DX・AI</span>で前へ。
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-2xl text-xs leading-6 text-white/88 sm:mt-6 sm:text-base sm:leading-8"
            >
              ホームページ制作、AI導入、業務システム・アプリ開発、LINE・Google・NFCを活用した店舗導線から、
              <span className="font-medium text-white">FDE（Forward Deployed Engineer）型の現場伴走支援</span>
              まで。課題整理から実装、定着・運用改善まで一貫して支援します。
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3"
            >
              <Button
                asChild
                size="lg"
                className="h-9 rounded-xl bg-[#ef6e42] px-3 text-xs text-white hover:bg-[#e56339] sm:h-11 sm:px-5 sm:text-sm"
              >
                <Link href="/services">
                  支援内容を見る <ArrowRight className="size-3.5 sm:size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-9 rounded-xl border-white/18 bg-white/[0.06] px-3 text-xs text-white hover:bg-white/12 hover:text-white sm:h-11 sm:px-5 sm:text-sm"
              >
                <Link href="/contact">まず相談する</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-5 border-l border-white/14 pl-3 sm:mt-8 sm:pl-4"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#76d9cb] sm:text-[11px]">
                  FDE / Forward Deployed Engineering
                </p>
                <span className="text-[9px] text-white/68 sm:text-[11px]">現場に入り、使われるところまで</span>
              </div>
              <ol className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-white/90 sm:mt-3 sm:gap-2 sm:text-xs">
                {fdeSteps.map((step, index) => (
                  <li key={step} className="flex items-center gap-1.5 sm:gap-2">
                    <span>{step}</span>
                    {index < fdeSteps.length - 1 ? (
                      <ArrowRight className="size-3 text-white/30" aria-hidden="true" />
                    ) : null}
                  </li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        </div>

        <motion.nav
          aria-label="主要サービス"
          className="mt-5 grid grid-cols-2 gap-1.5 border-t border-white/12 pt-4 sm:mt-8 sm:gap-3 sm:pt-6 lg:grid-cols-4"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
        >
          {serviceLinks.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                key={service.title}
                href={service.href}
                target={service.external ? "_blank" : undefined}
                rel={service.external ? "noreferrer" : undefined}
                className="group flex min-w-0 items-center gap-2 rounded-xl border border-white/12 bg-[#06151c]/68 p-2 backdrop-blur-md transition hover:border-white/24 hover:bg-[#0b222b]/82 sm:gap-3 sm:rounded-2xl sm:p-4"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.08] text-[#75d9ca] sm:size-11 sm:rounded-xl">
                  <Icon className="size-4 sm:size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-[11px] font-semibold leading-tight text-white sm:text-sm">
                    {service.title}
                    {service.external ? <ExternalLink className="size-3 text-white/35" aria-hidden="true" /> : null}
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] text-white/74 sm:mt-1 sm:text-xs">
                    {service.description}
                  </span>
                </span>
                {!service.external ? (
                  <ArrowRight className="hidden size-4 shrink-0 text-white/24 transition group-hover:translate-x-0.5 group-hover:text-white/60 sm:block" aria-hidden="true" />
                ) : null}
              </Link>
            );
          })}
        </motion.nav>
      </div>
    </section>
  );
}
