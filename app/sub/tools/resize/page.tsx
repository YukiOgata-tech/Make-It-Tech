import type { Metadata } from "next";
import { ImageResizer } from "../components/image-resizer";

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
};

export default function ResizePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ImageResizer />
    </div>
  );
}
