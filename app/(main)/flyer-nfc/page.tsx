import type { Metadata } from "next";
import { NfcLineupFlyer } from "@/components/flyer/nfc-lineup-flyer";

export const metadata: Metadata = {
  title: "Make It Tech NFCスタンド・プレート 営業用フライヤー",
  description:
    "Make It Tech の NFCスタンド/プレート案内フライヤー。印刷やPDF保存に対応しています。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FlyerNfcPage() {
  return <NfcLineupFlyer />;
}
