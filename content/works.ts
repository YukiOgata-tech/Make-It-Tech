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
  previewType?: "mock" | "live" | "seat-map" | "chatbot-images" | "site-hero";
  previewUrl?: string;
  previewMobileImageUrl?: string;
  previewDesktopImageUrl?: string;
  previewImageAlt?: string;
  logoUrl?: string;
  linkLabel?: string;
  isPublic: boolean;
};

export const workStats = [
  { label: "導入・支援先", value: "5+", note: "飲食店4店舗以上 / 学童保育施設" },
  { label: "制作・改善案件", value: "22+", note: "サイト・LP・業務システム" },
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
    results: ["飲食店4店舗以上と学童保育施設で利用(2026/6時点)", "LINE・紙・Excelによる希望回収や転記作業を削減"],
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
    id: "ai-chatbot-site-support",
    companyName: "事業サイト向けAIチャット導入",
    title: "問い合わせ前の迷いを減らすAIチャットボット追加",
    category: "AIチャットボット導入",
    url: "/",
    summary: "既存サイトに、問い合わせ内容やサイト内の迷いを減らすためのパーソナライズされたAIチャットボットを追加。事業内容に合わせた案内導線を整えました。",
    scope: ["要件整理", "AIボット設計", "サイト組み込み", "案内文調整", "運用改善"],
    results: ["このサイトを含む4つの事業サイトで導入(2026/5時点)", "このサイト右下のチャットボタンでも同様の機能を運用中"],
    previewTone: "coral",
    previewType: "chatbot-images",
    previewDesktopImageUrl: "/images/works/ai-chatbot-desktop.webp",
    previewImageAlt: "AIチャットボット導入支援の画面イメージ",
    linkLabel: "このサイトでチャットを見る",
    isPublic: true,
  },
  {
    id: "hp-lp-production-support",
    companyName: "店舗・福祉事業向けHP/LP制作",
    title: "飲食店HP・福祉系人材LPなどの制作支援",
    category: "HP/LP制作",
    summary: "飲食店のホームページや、福祉系人材サービスのLPなど、事業の強みと問い合わせ導線が伝わるWebページを制作。公開できない案件も含め、用途に合わせた構成・コピー・実装を支援しています。",
    scope: ["構成設計", "コピー整理", "デザイン", "実装", "問い合わせ導線"],
    results: ["店舗・サービスの特徴を伝えるページを制作", "問い合わせや紹介時に共有しやすい導線を整備"],
    previewTone: "sun",
    previewType: "site-hero",
    isPublic: true,
  },

  {
    id: "drink-management-app",
    companyName: "ドリンKing iOS",
    title: "iOSドリンク管理アプリ「ドリンKing」",
    category: "モバイルアプリ制作",
    url: "https://apps.apple.com/app/id6758897415",
    summary: "飲酒管理機能を中心に、飲み会の幹事やお酒を楽しむ人向けのiOSアプリを開発。飲んだお酒の記録や、現状把握を手助け。",
    scope: ["モバイルアプリ", "ユーザー管理",  "外部API･公開データの活用"],
    results: ["日頃の飲酒管理の記録", "イベント時の飲酒量管理"],
    previewMobileImageUrl: "/images/works/drinking-mobile.webp",
    previewDesktopImageUrl: "/images/works/DK_pc.jpg",
    logoUrl: "/images/works/DMA-icon.png",
    previewImageAlt: "アプリ内UI画像",
    previewTone: "sun",
    linkLabel: "App Storeで見る",
    isPublic: true,
  },
];


export const publicWorks = works.filter((work) => work.isPublic);


