import { CalendarCheck, ClipboardCheck, Video } from "lucide-react";

export const aboutOverviewItems = [
  { label: "屋号", value: "Make It Tech" },
  { label: "開始", value: "2025年" },
  { label: "代表取締役", value: "尾形友輝" },
  { label: "事業内容", value: "Web制作/業務改善/自動化/DX支援/マーケティング支援" },
  { label: "拠点", value: "新潟県(詳細は打合せ時に共有)" },
] as const;

export const aboutHighlights = [
  {
    title: "現場起点のDX支援",
    desc: "課題整理から運用まで、現場で“回る形”を最短で作ります。",
  },
  {
    title: "地方創生･地域への想い",
    desc: "新潟の事業者がITを武器にできるよう、地方創生の一翼を担う支援を目指します。",
  },
  {
    title: "学生･若手の活動応援",
    desc: "ITを志す学生や若手への機会提供など、次世代の育成にも協力しています。",
  },
  {
    title: "地域密着･相談重視",
    desc: "新潟県内の中小事業者に寄り添った支援を前提に設計します。",
  },
] as const;

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
