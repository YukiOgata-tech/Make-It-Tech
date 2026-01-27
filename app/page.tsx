import { Hero } from "@/components/sections/hero";
// import { PricingSection } from "@/components/pricing-section";
// import { ProcessSection } from "@/components/process-section";
import { FAQSection } from "@/components/sections/faq-section";
import { OfferSection } from "@/components/sections/offer-section";
import { DiagnosisSection } from "@/components/sections/diagnosis-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Make It Tech | 新潟のDX・IT支援",
  },
  description:
    "新潟の中小事業者向けに、DX・業務改善・Web制作・自動化を丁寧に支援。条件により無料の業務診断も実施します。",
  keywords: [
    "新潟", "DX", "IT", "業務改善", "安い", "低コスト", "丁寧", "信頼", "Web制作", "LP制作", "新潟県", "中小企業", "自動化", "無料診断", "業務効率化", "LINE公式", "Google Workspace", "Chatwork", "クラウドツール", "AI", "チャットボット", 
    "地域創生", "ベンチャー支援", "スタートアップ支援", "IT導入補助金", "ものづくり補助金", "ITコンサルティング", "SES", "システム開発", "ホームページ制作", "SEO対策", "コンテンツ制作", "DX支援サービス", "IT活用", "業務フロー改善", "RPA", 
  ],
};


export default function HomePage() {
  return (
    <>
      <Hero />
      <DiagnosisSection />
      <OfferSection />
      <FAQSection />
    </>
  );
}
