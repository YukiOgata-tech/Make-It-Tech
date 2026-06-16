import { createToolMetadata, ToolStructuredData } from "../_data/seo";
import { LottiePreview } from "../components/lottie-preview";

export const metadata = createToolMetadata({
  id: "lottie",
  title: "無料Lottieプレビュー - JSON / .lottie対応",
  description:
    "Lottie JSONやdotLottie（.lottie）ファイルをブラウザ上で再生確認できます。アップロードなしでループ、速度、再生方向、サイズを確認できます。",
  keywords: [
    "Lottie",
    "Lottieプレビュー",
    "dotLottie",
    ".lottie",
    "lottie.json",
    "JSON",
    "アニメーション確認",
    "無料",
  ],
});

export default function LottiePage() {
  return (
    <div className="tools-page-container">
      <ToolStructuredData id="lottie" />
      <LottiePreview />
    </div>
  );
}
