import { QRGenerator } from "../components/qr-generator";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "qr",
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
});

export default function QRPage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="qr" />
      <QRGenerator />
    </div>
  );
}
