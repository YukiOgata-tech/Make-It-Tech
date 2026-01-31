export type ExperienceTheme = {
  surface: string;
  accent: string;
  badge: string;
  halo: string;
};

export type Experience = {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
  mark: string;
  theme: ExperienceTheme;
};

export const experiences: Experience[] = [
  {
    id: "welfare",
    title: "福祉系企業の業務支援",
    category: "福祉",
    summary: "社内ツール開発と運用改善で、現場の負担を削減。",
    details: [
      "社内システム･業務ツールの開発支援",
      "既存システムの改修･保守",
      "業務効率化を目的としたIT活用支援",
      "運用改善提案",
    ],
    mark: "CARE",
    theme: {
      surface:
        "bg-gradient-to-br from-[#FBE6A6] via-[#F6D27F] to-[#F3B874] dark:from-[#2C3E44] dark:via-[#23343A] dark:to-[#1B262B]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
  {
    id: "education",
    title: "教育系事業所のDX支援",
    category: "教育",
    summary: "運営と利用者の両方が使いやすい設計を重視。",
    details: [
      "リアルタイム座席状況の可視化システム構築･フルスタック開発",
      "運営管理者･利用者双方のUI設計",
      "公式サイトの企画･設計･開発",
      "公開後の運用設計",
    ],
    mark: "システム",
    theme: {
      surface:
        "bg-gradient-to-br from-[#BFEADB] via-[#A5E0D0] to-[#7ED1C2] dark:from-[#2A3E3C] dark:via-[#213433] dark:to-[#1A2625]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
  {
    id: "restaurant",
    title: "飲食店のWeb活用",
    category: "飲食",
    summary: "小規模でも続けやすいWeb施策を設計。",
    details: [
      "ホームページの企画･提案",
      "フルスタックでのWebサイト開発",
      "店舗の強みが伝わる構成設計",
      "保守・軽微修正の継続対応",
    ],
    mark: "WEB･LP",
    theme: {
      surface:
        "bg-gradient-to-br from-[#F6B9B0] via-[#F1A6A7] to-[#E7898E] dark:from-[#3D2C2D] dark:via-[#312425] dark:to-[#241A1B]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
  {
    id: "サービス運用",
    title: "公式LINEの構築･運用補助",
    category: "LINE",
    summary: "問い合わせ導線を整え、運用負荷を軽減。",
    details: [
      "公式LINEアカウントの設計･初期設定",
      "自動応答メッセージの設計",
      "問い合わせ導線の整備",
      "運用補助",
    ],
    mark: "LINE･google",
    theme: {
      surface:
        "bg-gradient-to-br from-[#BFD7FF] via-[#A6C4FF] to-[#96B0F0] dark:from-[#2A3443] dark:via-[#212A37] dark:to-[#191F2A]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
  {
    id: "common",
    title: "共通して対応している周辺業務",
    category: "共通",
    summary: "事業全体を見据えた支援のため、以下にも対応。",
    details: [
      "標準的なSEOを意識した構成･実装",
      "検索エンジンを考慮したページ設計",
      "運用を前提とした情報設計",
      "目的に応じた改善提案",
    ],
    mark: "OPS",
    theme: {
      surface:
        "bg-gradient-to-br from-[#E0D3FF] via-[#CEBFFF] to-[#B7A7FF] dark:from-[#302B3E] dark:via-[#262032] dark:to-[#1D1828]",
      accent:
        "bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15",
      badge:
        "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
      halo:
        "from-white/70 via-white/20 to-transparent dark:from-white/10 dark:via-white/5",
    },
  },
];
