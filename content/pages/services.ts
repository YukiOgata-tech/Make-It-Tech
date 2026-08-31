import {
  BrainCircuit,
  Bot,
  ClipboardList,
  Globe,
  LineChart,
  Smartphone,
  Settings,
  Wrench,
} from "lucide-react";

export const serviceAreas = [
  {
    title: "HP/LP制作",
    desc: "SEO、導線設計、公開後の運用まで見据えたWeb制作に対応します。",
    icon: Globe,
    href: "/web-production",
    tone: "sky",
  },
  {
    title: "モバイルアプリ制作",
    desc: "予約、管理、記録、会員向け機能など、用途に合わせて小さく設計します。",
    icon: Smartphone,
    href: "/contact?category=モバイルアプリ制作",
    tone: "violet",
  },
  {
    title: "社内システム開発/相談",
    desc: "管理画面、簡易DB、権限設計など、業務に合わせた仕組みを相談できます。",
    icon: Wrench,
    href: "/contact?category=社内システム開発/相談",
    tone: "emerald",
  },
  {
    title: "AI導入支援",
    desc: "生成AI、社内データ活用、AIチャットボットなど、業務に合う使い方から導入を支援します。",
    icon: BrainCircuit,
    href: "/contact?category=AI導入支援",
    tone: "cyan",
  },
  {
    title: "DX支援コンサル",
    desc: "おすすめツールの紹介、導入支援、業務フロー整理まで現場目線で支援します。",
    icon: LineChart,
    href: "/survey",
    tone: "amber",
  },
  {
    title: "関連補助金申請補助",
    desc: "IT導入やWeb制作に関わる補助金の確認、整理、申請準備を補助します。",
    icon: ClipboardList,
    href: "/contact?category=関連補助金申請補助",
    tone: "rose",
  },
  {
    title: "LINE/Googleビジネス支援",
    desc: "公式LINE、Googleビジネスプロフィールの設定代行と運用補助に対応します。",
    icon: Bot,
    href: "/contact?category=LINE/Googleビジネス支援",
    tone: "lime",
  },
  {
    title: "Workspace設定/運用補助",
    desc: "Google Workspaceなどの初期設定、権限整理、日常運用の補助を行います。",
    icon: Settings,
    href: "/contact?category=Workspace設定/運用補助",
    tone: "indigo",
  },
] as const;

export const serviceDeliverables = [
  {
    title: "Web/LP制作での成果物",
    items: ["構成案･導線設計", "デザイン実装", "計測導線の整備", "更新しやすい構成"],
  },
  {
    title: "DX/業務改善での成果物",
    items: ["フローの見える化", "フォーム/シートの設計", "通知･集計の自動化", "運用手順書"],
  },
] as const;

export const serviceExamples = [
  {
    title: "生成AIを業務に取り入れたいが、使いどころが分からない",
    desc: "日々の業務を整理し、文章作成、情報検索、問い合わせ対応など、効果が見込める用途から導入を支援します。",
  },
  {
    title: "問い合わせ対応をAIやLINEで効率化したい",
    desc: "AIチャットボット、公式LINE、フォーム、通知を組み合わせ、対応しやすい窓口を整えます。",
  },
  {
    title: "Excel・紙・複数ツールへの転記作業を減らしたい",
    desc: "現在の流れを確認し、フォーム、管理シート、通知、集計などを自動化します。",
  },
  {
    title: "予約・顧客・シフトなどをまとめて管理したい",
    desc: "業務に合わせた管理画面や社内システムを設計し、分散している情報を一元化します。",
  },
  {
    title: "Webサイトが古く、問い合わせや更新がしづらい",
    desc: "目的と導線を見直し、スマートフォン対応、SEO、更新運用まで含めて再設計します。",
  },
  {
    title: "新しいアプリや業務ツールのアイデアを形にしたい",
    desc: "必要な機能を整理し、Webアプリ・モバイルアプリを用途に合う構成で開発します。",
  },
] as const;
