import type { Metadata } from "next";
import { GoogleReviewFlyer } from "@/components/flyer/google-review-flyer";

export const metadata: Metadata = {
  title: "Make It Tech Googleレビュー導線フライヤー",
  description:
    "Make It Tech の Googleレビュー導線（NFC / QRスタンド）案内フライヤー。印刷やPDF保存に対応しています。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FlyerGoogleReviewPage() {
  return <GoogleReviewFlyer />;
}
