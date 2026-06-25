import { ImageResizer } from "../components/image-resizer";
import { createToolMetadata, ToolStructuredData } from "../_data/seo";

export const metadata = createToolMetadata({
  id: "resize",
  title: "無料画像リサイズツール - サイズ変更・縮小",
  description:
    "画像の幅と高さを指定して無料でリサイズできるオンラインツールです。縦横比を維持した縮小やカスタムサイズ、複数ファイルの一括処理に対応します。画像はブラウザ内で処理され、サーバーへ送信されません。",
  keywords: [
    "画像リサイズ",
    "画像サイズ変更",
    "画像縮小",
    "サイズ調整",
    "オンラインリサイズ",
    "無料",
  ],
});

export default function ResizePage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="resize" />
      <ImageResizer />
    </div>
  );
}
