export type ToolCategory = {
  id: "image" | "pdf" | "text";
  label: string;
  shortLabel: string;
  icon: string;
};

export type ToolItem = {
  id: string;
  name: string;
  navLabel: string;
  description: string;
  seoDescription: string;
  icon: string;
  category: ToolCategory["id"];
  navPriority?: number;
};

export const toolsBaseUrl = "https://tools.make-it-tech.com";

export const toolCategories: ToolCategory[] = [
  { id: "image", label: "画像", shortLabel: "画像", icon: "🖼️" },
  { id: "pdf", label: "PDF", shortLabel: "PDF", icon: "PDF" },
  { id: "text", label: "テキスト・データ", shortLabel: "データ", icon: "{}" },
];

export const tools: ToolItem[] = [
  {
    id: "compress",
    name: "画像圧縮",
    navLabel: "画像圧縮",
    description: "JPG/PNG/WebP/GIFを圧縮してファイルサイズを削減",
    seoDescription:
      "JPG、PNG、WebP、GIF画像をブラウザ上で圧縮できます。元のファイル形式を保ったまま、画像サイズを軽くしたいWeb制作や資料作成に使えます。",
    icon: "📦",
    category: "image",
    navPriority: 1,
  },
  {
    id: "convert",
    name: "フォーマット変換",
    navLabel: "画像変換",
    description: "画像をJPEG/PNG/WebPに変換",
    seoDescription:
      "画像をJPEG、PNG、WebP形式へ変換できます。Web掲載用の画像形式変更や、互換性を優先した画像変換をローカル処理で行えます。",
    icon: "🔄",
    category: "image",
    navPriority: 3,
  },
  {
    id: "resize",
    name: "リサイズ",
    navLabel: "画像リサイズ",
    description: "画像を指定サイズにリサイズ",
    seoDescription:
      "画像の幅・高さを指定してリサイズできます。SNS、OGP、Webサイト掲載、資料添付向けの画像サイズ調整に便利です。",
    icon: "📐",
    category: "image",
    navPriority: 2,
  },
  {
    id: "favicon",
    name: "Favicon生成",
    navLabel: "Favicon",
    description: "画像から各種サイズのfaviconを一括生成",
    seoDescription:
      "画像からfavicon、Apple Touch Icon、Android用アイコンなどをまとめて生成できます。Webサイト公開前のアイコン準備に使えます。",
    icon: "⭐",
    category: "image",
  },
  {
    id: "pdf-compress",
    name: "PDF圧縮",
    navLabel: "PDF圧縮",
    description: "PDFの再保存圧縮とスキャンPDFの画像軽量化",
    seoDescription:
      "PDFをブラウザ上で再保存し、必要に応じて読みやすさを保つ範囲でページ画像化も試します。資料送付やアップロード前のPDF軽量化に使えます。",
    icon: "📉",
    category: "pdf",
    navPriority: 4,
  },
  {
    id: "pdf-merge",
    name: "PDF合成",
    navLabel: "PDF合成",
    description: "複数PDFを順番指定して1つに結合",
    seoDescription:
      "複数のPDFを指定した順番で1つのPDFに結合できます。分かれた資料や請求書、申請書類をまとめる用途に便利です。",
    icon: "🧩",
    category: "pdf",
    navPriority: 5,
  },
  {
    id: "pdf-image",
    name: "画像 ↔ PDF",
    navLabel: "画像PDF",
    description: "画像をPDF化 / PDFページを画像化",
    seoDescription:
      "画像をPDFにまとめたり、PDFの各ページをPNG画像として書き出したりできます。画像資料のPDF化やPDFページの画像化に対応します。",
    icon: "🖼️",
    category: "pdf",
  },
  {
    id: "pdf-reorder",
    name: "PDF並び替え",
    navLabel: "PDF並び替え",
    description: "PDF内のページ順変更とページ削除",
    seoDescription:
      "PDF内のページ順を変更し、不要なページを削除して新しいPDFとして保存できます。資料提出前のページ整理に使えます。",
    icon: "↕️",
    category: "pdf",
  },
  {
    id: "pdf-split",
    name: "PDF分割",
    navLabel: "PDF分割",
    description: "ページごと・範囲指定でPDFを分割",
    seoDescription:
      "PDFを1ページずつ、または指定したページ範囲ごとに分割できます。必要なページだけを抽出したい場合に便利です。",
    icon: "✂️",
    category: "pdf",
  },
  {
    id: "base64",
    name: "Base64 変換",
    navLabel: "Base64",
    description: "画像 ↔ Base64文字列の相互変換",
    seoDescription:
      "画像をBase64文字列へ変換し、Base64から画像へ復元できます。HTML埋め込みや開発時のデータ確認に使えます。",
    icon: "🔣",
    category: "text",
  },
  {
    id: "markdown",
    name: "Markdown プレビュー",
    navLabel: "Markdown",
    description: "Markdownをリアルタイムでプレビュー(GFM対応)",
    seoDescription:
      "Markdownを入力しながらリアルタイムでプレビューできます。README、記事下書き、仕様メモの確認に便利です。",
    icon: "📝",
    category: "text",
  },
  {
    id: "extension",
    name: "拡張子変換",
    navLabel: "拡張子",
    description: "HTML/JS/TS などのテキストファイルの拡張子を変換",
    seoDescription:
      "HTML、JavaScript、TypeScript、CSS、JSON、Markdownなどのテキストファイル拡張子を変換できます。",
    icon: "📄",
    category: "text",
  },
  {
    id: "json",
    name: "JSON ↔ CSV/Excel",
    navLabel: "JSON",
    description: "JSON⇔CSV/Excelの相互変換",
    seoDescription:
      "JSON、CSV、Excelを相互変換できます。データ整形、表形式への変換、簡易的な分析前処理に使えます。",
    icon: "📊",
    category: "text",
  },
  {
    id: "qr",
    name: "QRコード生成",
    navLabel: "QR",
    description: "URLやテキストからQRコードを生成",
    seoDescription:
      "URLや任意のテキストからQRコードを生成できます。PNG、SVG形式で保存でき、チラシや名刺、Webページの導線作成に使えます。",
    icon: "📱",
    category: "text",
    navPriority: 6,
  },
];

export function getToolHref(id: string) {
  return `/sub/tools/${id}`;
}

export function getPublicToolHref(id: string) {
  return `/${id}`;
}

export function getToolCategory(toolId: string) {
  return tools.find((tool) => tool.id === toolId)?.category ?? "image";
}
