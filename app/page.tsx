import { Hero } from "@/components/sections/hero";
import { FAQSection } from "@/components/sections/faq-section";
import { FloatingContactCta } from "@/components/sections/floating-contact-cta";
import { HomeCtaSection } from "@/components/sections/home-cta-section";
import { AnnouncementsSection } from "@/components/sections/announcements-section";
import { WorksPreviewSection } from "@/components/sections/works-preview-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "新潟のIT・DX支援とWeb制作なら Make It Tech",
  },
  description:
    "新潟の中小事業者・個人事業主向けに、Web/LP制作、業務改善、ITツール導入、自動化、簡易システム構築まで一気通貫で支援します。現場で使える仕組みを低コストで丁寧に整えます。",
  keywords: [
    "新潟", "DX", "IT", "業務改善", "安い", "低コスト", "丁寧", "信頼", "Web制作", "LP制作", "新潟県", "中小企業", "自動化", "無料診断", "業務効率化", "LINE公式", "Google Workspace", "Chatwork", "クラウドツール", "AI", "チャットボット", 
    "地域創生", "ベンチャー支援", "IT導入補助金", "補助金", "ITコンサル", "SES", "システム開発", "ホームページ制作", "SEO対策", "コンテンツ制作", "DX支援サービス", "IT活用", "業務フロー改善", "RPA", 
  ],
};


export default function HomePage() {
  return (
    <>
      <FloatingContactCta />
      <Hero />
      <WorksPreviewSection />
      <HomeCtaSection />
      <AnnouncementsSection />
      <FAQSection />
    </>
  );
}
