import type { Metadata } from "next";
import { MakeItTechFlyer } from "@/components/flyer/make-it-tech-flyer";

export const metadata: Metadata = {
  title: "Make It Tech フライヤー",
  description:
    "Make It TechのWeb制作・運用サポート案内フライヤー。印刷やPDF保存に対応しています。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FlyerPage() {
  return (
    <MakeItTechFlyer
      siteQr="/qr/top-page.svg"
      worksQr="/qr/works-page.svg"
    />
  );
}
