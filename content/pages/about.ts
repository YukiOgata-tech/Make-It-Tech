import type { LucideIcon } from "lucide-react";
import { CalendarCheck, ClipboardCheck, Video } from "lucide-react";

export const aboutOverviewItems = [
  { label: "屋号", value: "Make It Tech" },
  { label: "開始", value: "2025年" },
  { label: "代表取締役", value: "尾形友輝" },
  { label: "事業内容", value: "Web制作/業務改善/自動化/DX支援/マーケティング支援" },
  { label: "拠点", value: "新潟県(詳細は打合せ時に共有)" },
] as const;

export interface RichTextChunk {
  text: string;
  href?: string;
  emphasis?: boolean;
  tone?: "accent" | "muted";
}

export type AboutDetailLine = string | RichTextChunk[];

interface AboutDetailSection {
  title: string;
  body?: AboutDetailLine[];
  bullets?: string[];
  bodyAfter?: AboutDetailLine[];
}

export const aboutDetailSections: AboutDetailSection[] = [
  {
    title: "事業について",
    body: [
      "Make It Tech は、Web制作やシステム開発、業務改善を中心に、現場に合わせたIT･DX支援を行う事業です。",
      "企業や事業所の「今ある業務･実際に困っていること」を起点に、過剰な仕組みやツール導入ではなく、必要な部分を整理･実装し、運用まで支援することを大切にしています。",
      "現在は、Web･LP制作、業務管理システムの構築、LINEやWebを活用した業務効率化などを中心に、フロントエンドからバックエンドまで一貫した開発･支援を行っています。",
    ],
  },
  {
    title: "実務経験･対応内容",
    body: [
      "これまでに、以下のような案件に携わってきました。",
    ],
    bullets: [
      "飲食店Webサイトの企画･制作",
      "教育事業所向けQRコードを用いた席利用状況のリアルタイム管理システムの開発",
      "企業との業務委託契約によるWeb・システム開発支援",
      "Webサイト制作から簡易システム導入、運用改善までの一貫対応",
    ],
    bodyAfter: [
      "開発においては、Firebase/Supabase などを用いたバックエンド構築から、フロントエンド実装まで対応しています。",
    ],
  },
  {
    title: "経歴",
    body: [
      "新潟大学 工学部 在学。在学中に1年間休学し、カナダにてワーキングホリデーを経験(2024-25)。",
      "高校時代はバスケットボールに取り組み、インターハイ(2021)および国民体育大会(2019)に出場。",
      "現在は学業を続けながら、事業主として実務案件に携わっています。",
    ],
  },
  {
    title: "その他の活動",
    body: [
      [
        {
          text: "実務と並行して、自身のキャリアや取り組みについて発信する場として「",
        },
        {
          text: "就活NEO",
          href: "https://youtu.be/dcRFAXXeBoU",
          emphasis: true,
          tone: "accent",
        },
        {
          text: "」に出演しました。",
        },
      ],
    ],
  },
  {
    title: "大切にしていること",
    body: [
      "Make It Tech では、「作ること」よりも、使われ続けること、運用できることを重視しています。",
      "ご相談いただいた内容に対して、今本当に必要な支援は何かを整理し、実装･改善していくことを心がけています。",
    ],
  },
];

export interface AboutActivity {
  title: string;
  desc: string;
  icon: LucideIcon;
  kind?: "youtube";
  youtubeId?: string;
  youtubeUrl?: string;
}

export const aboutActivities: AboutActivity[] = [
  {
    title: "YouTube出演(2025)",
    desc: "就活NEO というYouTubeコンテンツに出演。内定を得る(現在、業務委託契約中)。",
    icon: Video,
    kind: "youtube",
    youtubeId: "dcRFAXXeBoU",
    youtubeUrl: "https://youtu.be/dcRFAXXeBoU",
  },
  {
    title: "現場ヒアリング",
    desc: "現状の困りごとを整理し、改善の優先順位を短時間で整理し可視化させます。",
    icon: CalendarCheck,
  },
  {
    title: "貪欲に支援するスタイル",
    desc: "一人でも自分の得意な領域で楽にできたり、頼んで良かったと思わせるのが目標です。最低コストで最大効果が目標です。無駄なオプション等は一切提案しません。断言します。",
    icon: ClipboardCheck,
  },
] as const;
