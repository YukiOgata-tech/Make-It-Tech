import {
  Bot,
  ClipboardList,
  Globe,
  Hammer,
  LineChart,
  MonitorSmartphone,
  Sparkles,
  Smartphone,
  Settings,
  Wrench,
} from "lucide-react";

export const serviceAreas = [
  {
    title: "HP/LP制作",
    desc: "SEO、導線設計、公開後の運用まで見据えたWeb制作に対応します。",
    icon: Globe,
    href: "/hp-lp-request",
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

export const servicePrinciples = [
  {
    title: "作る前に整理",
    desc: "現状と理想を整理し、必要な範囲だけを見極めます。",
    icon: Sparkles,
  },
  {
    title: "最小構成で早く動かす",
    desc: "まず動く状態を作り、効果が見えたら拡張します。",
    icon: Hammer,
  },
  {
    title: "既存ツールで済むなら作らない",
    desc: "コストと期間を最適化するために“作らない”判断。",
    icon: MonitorSmartphone,
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
    title: "問い合わせが電話とLINEで分散している",
    desc: "フォーム統一+通知自動化で窓口を一本化。",
  },
  {
    title: "手打ちExcelやデータ管理が多い。それを引き継ぐのも難しい。",
    desc: "既存事項のルール化で運用を標準化。もしくはAIや計算システム込みの自動化。",
  },
  {
    title: "Webが古く、問い合わせ導線が弱い",
    desc: "目的に合わせて構成を再設計し、CTAを強化。もしくは新規WEBのフル制作。",
  },
  {
    title: "業務内で、IT導入したいが何から始めるべきか不明",
    desc: "現状整理→優先順位→実装の順で提案。同業種での事例も伏せて紹介いたします。",
  },
] as const;
