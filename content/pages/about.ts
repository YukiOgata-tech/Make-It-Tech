export const aboutOverviewItems = [
  { label: "屋号", value: "Make It Tech（メイクイットテック）" },
  { label: "開始", value: "2025/6" },
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
      "Make It Tech（メイクイットテック）は、Web制作やシステム開発、業務改善を中心に、現場に合わせたIT･DX支援を行う事業です。",
      "企業や事業所の「今ある業務･実際に困っていること」を起点に、過剰な仕組みやツール導入ではなく、必要な部分を整理･実装し、運用まで支援することを大切にしています。",
      "現在は、Web･LP制作、DX支援、LINEやWebを活用した業務効率化などを中心に、フロントエンドからバックエンドまで一貫した開発･支援を行っています。",
    ],
  },
  {
    title: "その他の活動",
    body: [
      "経営者同士の交流と地域でのつながりを深めるため、守成クラブに参加しています。",
      "学生として新潟大学工学部に所属し、学業と実務の両方に取り組んでいます。",
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
