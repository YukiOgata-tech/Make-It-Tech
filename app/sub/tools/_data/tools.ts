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
  icon: string;
  category: ToolCategory["id"];
};

export const toolCategories: ToolCategory[] = [
  { id: "image", label: "画像", shortLabel: "画像", icon: "🖼️" },
  { id: "pdf", label: "PDF", shortLabel: "PDF", icon: "PDF" },
  { id: "text", label: "テキスト・データ", shortLabel: "データ", icon: "{}" },
];

export const tools: ToolItem[] = [
  {
    id: "compress",
    name: "画像圧縮",
    navLabel: "圧縮",
    description: "JPG/PNG/WebP/GIFを圧縮してファイルサイズを削減",
    icon: "📦",
    category: "image",
  },
  {
    id: "convert",
    name: "フォーマット変換",
    navLabel: "変換",
    description: "画像をJPEG/PNG/WebPに変換",
    icon: "🔄",
    category: "image",
  },
  {
    id: "resize",
    name: "リサイズ",
    navLabel: "リサイズ",
    description: "画像を指定サイズにリサイズ",
    icon: "📐",
    category: "image",
  },
  {
    id: "favicon",
    name: "Favicon生成",
    navLabel: "Favicon",
    description: "画像から各種サイズのfaviconを一括生成",
    icon: "⭐",
    category: "image",
  },
  {
    id: "pdf-compress",
    name: "PDF圧縮",
    navLabel: "圧縮",
    description: "PDFを安全〜できる限り圧縮までローカル処理",
    icon: "📉",
    category: "pdf",
  },
  {
    id: "pdf-merge",
    name: "PDF合成",
    navLabel: "合成",
    description: "複数PDFを順番指定して1つに結合",
    icon: "🧩",
    category: "pdf",
  },
  {
    id: "pdf-image",
    name: "画像 ↔ PDF",
    navLabel: "画像PDF",
    description: "画像をPDF化 / PDFページを画像化",
    icon: "🖼️",
    category: "pdf",
  },
  {
    id: "pdf-reorder",
    name: "PDF並び替え",
    navLabel: "並替",
    description: "PDF内のページ順変更とページ削除",
    icon: "↕️",
    category: "pdf",
  },
  {
    id: "pdf-split",
    name: "PDF分割",
    navLabel: "分割",
    description: "ページごと・範囲指定でPDFを分割",
    icon: "✂️",
    category: "pdf",
  },
  {
    id: "base64",
    name: "Base64 変換",
    navLabel: "Base64",
    description: "画像 ↔ Base64文字列の相互変換",
    icon: "🔣",
    category: "text",
  },
  {
    id: "markdown",
    name: "Markdown プレビュー",
    navLabel: "Markdown",
    description: "Markdownをリアルタイムでプレビュー(GFM対応)",
    icon: "📝",
    category: "text",
  },
  {
    id: "extension",
    name: "拡張子変換",
    navLabel: "拡張子",
    description: "HTML/JS/TS などのテキストファイルの拡張子を変換",
    icon: "📄",
    category: "text",
  },
  {
    id: "json",
    name: "JSON ↔ CSV/Excel",
    navLabel: "JSON",
    description: "JSON⇔CSV/Excelの相互変換",
    icon: "📊",
    category: "text",
  },
  {
    id: "qr",
    name: "QRコード生成",
    navLabel: "QR",
    description: "URLやテキストからQRコードを生成",
    icon: "📱",
    category: "text",
  },
];

export function getToolHref(id: string) {
  return `/sub/tools/${id}`;
}

export function getToolCategory(toolId: string) {
  return tools.find((tool) => tool.id === toolId)?.category ?? "image";
}
