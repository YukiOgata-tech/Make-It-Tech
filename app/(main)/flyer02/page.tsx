import type { Metadata } from "next";
import { WebServiceFlyer } from "@/components/flyer/web-service-flyer";

export const metadata: Metadata = {
  title: "Make It Tech Web制作・継続Webマーケティング フライヤー",
  description:
    "Make It Tech のWeb制作・継続Webマーケティング案内フライヤー。印刷やPDF保存に対応しています。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Flyer02Page() {
  return <WebServiceFlyer />;
}
