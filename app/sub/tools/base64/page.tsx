import { Base64Converter } from "../components/base64-converter";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "base64",
  title: "無料Base64変換ツール - 画像↔Base64",
  description:
    "画像をBase64文字列やData URI形式へ変換し、Base64データから画像へ復元できる無料オンラインツールです。HTMLやCSSへの画像埋め込み、開発時のデータ確認に利用でき、処理はブラウザ内で完結します。",
  keywords: [
    "Base64変換",
    "Base64エンコード",
    "Base64デコード",
    "Data URI",
    "画像埋め込み",
    "オンライン変換",
    "無料",
  ],
});

export default function Base64Page() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="base64" />
      <Base64Converter />
    </div>
  );
}
