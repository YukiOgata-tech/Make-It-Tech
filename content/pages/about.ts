import { CalendarCheck, ClipboardCheck, Video } from "lucide-react";

export const aboutOverviewItems = [
  { label: "屋号", value: "Make It Tech" },
  { label: "開始", value: "2025年" },
  { label: "代表取締役", value: "尾形友輝" },
  { label: "事業内容", value: "Web制作/業務改善/自動化/DX支援/マーケティング支援" },
  { label: "拠点", value: "新潟県(詳細は打合せ時に共有)" },
] as const;

interface AboutDetailSection {
  title: string;
  body?: string[];
  bullets?: string[];
  bodyAfter?: string[];
}

export const aboutDetailSections: AboutDetailSection[] = [
  {
    title: "事業について",
    body: [
      "Make It Tech は、Web制作や小規模システム開発、業務改善を中心に、現場に合わせたIT・DX支援を行う個人事業です。",
      "企業や事業所の「今ある業務･実際に困っていること」を起点に、過剰な仕組みやツール導入ではなく、必要な部分だけを整理・実装し、運用まで支援することを大切にしています。",
      "現在は、Webサイト制作、業務管理システムの構築、LINEやWebを活用した業務効率化などを中心に、フロントエンドからバックエンドまで一貫した開発・支援を行っています。",
    ],
  },
  {
    title: "実務経験・対応内容",
    body: [
      "これまでに、以下のような案件に携わってきました。",
    ],
    bullets: [
      "飲食店向けWebサイトの企画・制作",
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
      "新潟大学 工学部 在学。大学在学中に1年間休学し、カナダにてワーキングホリデーを経験しました。",
      "異なる環境の中で生活・就労を行った経験は、状況に応じて柔軟に考え、行動する姿勢につながっています。",
      "高校時代はバスケットボールに取り組み、インターハイおよび国民体育大会に出場しました。",
      "現在は大学3年生（2026年1月時点）として学業を続けながら、個人事業主として実務案件に携わっています。",
    ],
  },
  {
    title: "その他の活動",
    body: [
      "実務と並行して、自身のキャリアや取り組みについて発信する場として「就活ネオ」に出演しました。",
    ],
  },
  {
    title: "大切にしていること",
    body: [
      "Make It Tech では、「作ること」そのものよりも、使われ続けること、運用できることを重視しています。",
      "ご相談いただいた内容に対して、今本当に必要な支援は何かを整理し、無理のない形で実装・改善していくことを心がけています。",
    ],
  },
];

export const aboutActivities = [
  {
    title: "YouTube出演(2025)",
    desc: "就活neo というYouTubeコンテンツに出演。内定を得る。",
    icon: Video,
  },
  {
    title: "現場ヒアリング",
    desc: "現状の困りごとを整理し、改善の優先順位を短時間で可視化。",
    icon: CalendarCheck,
  },
  {
    title: "貪欲に生きる支援スタイル",
    desc: "お金を稼ぎではなく、最低コストで最大利益を生み出すことが目標です。無駄なオプションなどは一切提案しません。断言します。",
    icon: ClipboardCheck,
  },
] as const;
