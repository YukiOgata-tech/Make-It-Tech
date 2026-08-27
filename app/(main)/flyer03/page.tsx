import type { Metadata } from "next";
import { MarketingFlyer } from "@/components/flyer/marketing-flyer";

export const metadata: Metadata = {
  title: "Make It Tech 総合マーケティング フライヤー",
  description:
    "Make It Tech のリアル×Web総合マーケティング案内フライヤー。印刷やPDF保存に対応しています。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Flyer03Page() {
  return <MarketingFlyer />;
}
