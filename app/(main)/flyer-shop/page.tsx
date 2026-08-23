import type { Metadata } from "next";
import { ShopFlyer } from "@/components/flyer/shop-flyer";

export const metadata: Metadata = {
  title: "Make It Tech 店舗向けNFC 営業用フライヤー",
  description:
    "Make It Tech の店舗向けNFCスタンド/プレート案内フライヤー。印刷やPDF保存に対応しています。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FlyerShopPage() {
  return <ShopFlyer />;
}
