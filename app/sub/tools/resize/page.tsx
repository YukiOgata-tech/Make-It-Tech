import type { Metadata } from "next";
import { ImageResizer } from "../components/image-resizer";
import { toolsBaseUrl } from "../_data/tools";

export const metadata: Metadata = {
  title: "無料画像リサイズツール - サイズ変更・縮小",
  description:
    "画像を指定サイズにリサイズ。アスペクト比維持、カスタムサイズ対応。ブラウザ上で処理、サーバー送信なし。複数ファイル一括リサイズ可能。",
  keywords: [
    "画像リサイズ",
    "画像サイズ変更",
    "画像縮小",
    "サイズ調整",
    "オンラインリサイズ",
    "無料",
  ],
  alternates: {
    canonical: `${toolsBaseUrl}/resize`,
  },
};

export default function ResizePage() {
  return (
    <div className="tools-page-container">
      <ImageResizer />
    </div>
  );
}
