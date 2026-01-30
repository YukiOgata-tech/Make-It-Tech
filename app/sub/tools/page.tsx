import Link from "next/link";

const tools = [
  {
    id: "compress",
    name: "画像圧縮",
    description: "JPG/PNG/WebP/GIFを圧縮してファイルサイズを削減",
    icon: "📦",
  },
  {
    id: "convert",
    name: "フォーマット変換",
    description: "画像をJPEG/PNG/WebPに変換",
    icon: "🔄",
  },
  {
    id: "resize",
    name: "リサイズ",
    description: "画像を指定サイズにリサイズ",
    icon: "📐",
  },
  {
    id: "base64",
    name: "Base64 変換",
    description: "画像 ↔ Base64文字列の相互変換",
    icon: "🔣",
  },
  {
    id: "favicon",
    name: "Favicon生成",
    description: "画像から各種サイズのfaviconを一括生成",
    icon: "⭐",
  },
  {
    id: "markdown",
    name: "Markdown プレビュー",
    description: "Markdownをリアルタイムでプレビュー(GFM対応)",
    icon: "📝",
  },
  {
    id: "extension",
    name: "拡張子変換",
    description: "HTML/JS/TS などのテキストファイルの拡張子を変換",
    icon: "📄",
  },
  {
    id: "json",
    name: "JSON → CSV/Excel",
    description: "JSONデータをCSVまたはExcel形式に変換",
    icon: "📊",
  },
  {
    id: "qr",
    name: "QRコード生成",
    description: "URLやテキストからQRコードを生成",
    icon: "📱",
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center py-8 mb-8">
        <h1 className="text-3xl font-bold mb-3">Dev Tools</h1>
        <p className="text-neutral-400">
          開発に必要な各種ツールをブラウザ上で実行
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          ※ すべての処理はローカルで行われます。サーバーへのアップロードはありません。
        </p>
      </section>

      {/* Tool Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/sub/tools/${tool.id}`}
            className="block bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-blue-500 hover:bg-neutral-800/50 transition-all group"
          >
            <div className="text-3xl mb-3">{tool.icon}</div>
            <h2 className="font-semibold mb-1 group-hover:text-blue-400 transition-colors">
              {tool.name}
            </h2>
            <p className="text-sm text-neutral-400">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
