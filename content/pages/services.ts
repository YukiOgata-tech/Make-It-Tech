import {
  Bot,
  ClipboardList,
  Globe,
  Hammer,
  LineChart,
  Sparkles,
  Wrench,
} from "lucide-react";

export const serviceAreas = [
  {
    title: "Web制作･導線設計",
    desc: "新潟の店舗サイト/採用ページなど、目的から逆算して構成を作ります。",
    icon: Globe,
    items: ["構成とデザイン考案･実装", "CTA設計･改善", "管理･運用しやすい設計"],
  },
  {
    title: "ITによる業務改善･見える化",
    desc: "属人化や非効率を整理し、引き継げる運用に。",
    icon: ClipboardList,
    items: ["業務フロー整理", "入力ルール整備", "運用の型づくり"],
  },
  {
    title: "ツール導入支援･運用",
    desc: "LINE/フォーム/シート/通知連携で、最小コストの仕組み化。",
    icon: Bot,
    items: ["問い合わせ一元化", "通知･集計の集約と自動化", "運用負担の削減"],
  },
  {
    title: "小規模システム",
    desc: "必要最小限の機能から。管理画面や簡易DBも対応します。",
    icon: Wrench,
    items: ["要件整理･画面設計", "権限設計", "運用導線の整備"],
  },
  {
    title: "改善伴走･運用支援",
    desc: "導入して終わりにせず、数字と現場の声で改善します。",
    icon: LineChart,
    items: ["KPI/導線の改善", "追加修正/改善の継続対応", "優先順位の見直し"],
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
    icon: ClipboardList,
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
