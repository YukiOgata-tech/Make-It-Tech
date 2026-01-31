import type { Metadata } from "next";
import { QRGenerator } from "../components/qr-generator";

export const metadata: Metadata = {
  title: "無料QRコード生成ツール - URL/テキスト対応",
  description:
    "URLやテキストからQRコードを無料生成。高解像度PNG出力対応。ブラウザ上で完結、サーバー送信なし。名刺・チラシ・Webサイト用に最適。",
  keywords: [
    "QRコード生成",
    "QRコード作成",
    "QRコードメーカー",
    "URL QRコード",
    "オンライン生成",
    "無料",
  ],
};

export default function QRPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <QRGenerator />
    </div>
  );
}
