import { Bot, Building2, Globe2, LineChart, Settings2, Smartphone } from "lucide-react";

export type WorkItem = {
  id: string;
  companyName: string;
  title: string;
  category: string;
  url?: string;
  summary: string;
  scope: string[];
  results: string[];
  previewTone: "coral" | "teal" | "sun" | "ink";
  previewType?: "mock" | "live" | "seat-map";
  previewUrl?: string;
  logoUrl?: string;
  isPublic: boolean;
};

export const workStats = [
  { label: "導入・支援先", value: "5+", note: "飲食店4店舗以上 / 学童保育施設" },
  { label: "制作・改善案件", value: "18+", note: "サイト・LP・業務システム" },
];

export const workCapabilities = [
  { label: "Web制作", icon: Globe2 },
  { label: "LP制作", icon: Smartphone },
  { label: "業務改善", icon: Settings2 },
  { label: "AI導入", icon: Bot },
  { label: "導線設計", icon: LineChart },
  { label: "地域事業支援", icon: Building2 },
];

export const works: WorkItem[] = [
  {
    id: "digishift",
    companyName: "Dミセ",
    title: "店舗・施設向けシフト管理Webシステム",
    category: "Webシステム開発",
    url: "https://d-mise.make-it-tech.com",
    summary: "希望シフト提出、シフト作成、共有、打刻管理、CSV・画像出力、給与計算サポートまでを一元化するWebシフト管理システムを開発。",
    scope: ["要件整理", "UI設計", "Webアプリ開発", "勤怠管理", "出力機能", "運用支援"],
    results: ["飲食店4店舗以上と学童保育施設で活用", "LINE・紙・Excelによる希望回収や転記作業を削減"],
    previewTone: "teal",
    previewType: "live",
    previewUrl: "https://d-mise.make-it-tech.com",
    logoUrl: "https://d-mise.make-it-tech.com/images/dmise-logo-trans.png",
    isPublic: true,
  },
  {
    id: "study-room-occupancy",
    companyName: "自習スペース運営事業",
    title: "リアルタイム利用状況管理システム",
    category: "業務システム開発",
    summary: "QRコードで入退室を記録し、会員と管理側が席の利用状況をリアルタイムに確認できる仕組みを構築。",
    scope: ["要件整理", "管理画面", "会員向け画面", "QR入退室", "座席状況表示", "機器連携支援"],
    results: ["席の空き状況をスマートフォンから確認可能に", "自動ロック機材の接続と運用設計を支援"],
    previewTone: "ink",
    previewType: "seat-map",
    isPublic: true,
  },
  {
    id: "service-lp",
    companyName: "サービス業 C社",
    title: "新サービス紹介LP",
    category: "LP制作",
    url: "https://example.com",
    summary: "サービスの強み、導入メリット、問い合わせまでの流れを1ページに集約。",
    scope: ["LP構成", "コピー整理", "実装", "CTA設計"],
    results: ["説明資料代わりに使える導線", "紹介営業で共有しやすいページへ"],
    previewTone: "sun",
    isPublic: false,
  },
  {
    id: "ai-support",
    companyName: "小規模事業 D社",
    title: "AIチャット導入の初期設計",
    category: "AI活用",
    url: "https://example.com",
    summary: "よくある質問と案内文を整理し、問い合わせ前の情報提供を自動化する設計を実施。",
    scope: ["FAQ整理", "プロンプト設計", "導入支援", "改善提案"],
    results: ["一次対応の負担を軽減", "案内品質を揃える準備を実施"],
    previewTone: "ink",
    isPublic: false,
  },
];


export const publicWorks = works.filter((work) => work.isPublic);


