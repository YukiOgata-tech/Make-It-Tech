import { QRGenerator } from "../components/qr-generator";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "qr",
  title: "無料QRコード生成ツール - URL/テキスト対応",
  description:
    "URLや任意のテキストからQRコードを無料で作成できるオンラインツールです。高解像度PNGやSVG形式で保存でき、名刺、チラシ、店頭案内、Webサイトの導線作成に利用できます。生成処理はブラウザ内で完結します。",
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
