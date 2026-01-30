import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Dev Tools | Make It Tech",
    template: "%s | Dev Tools",
  },
  description: "開発者向け画像変換・圧縮ツール",
  robots: {
    index: false,
    follow: false,
  },
};

const navItems = [
  { href: "/sub/tools", label: "ホーム" },
  { href: "/sub/tools/compress", label: "圧縮" },
  { href: "/sub/tools/convert", label: "変換" },
  { href: "/sub/tools/resize", label: "リサイズ" },
  { href: "/sub/tools/base64", label: "Base64" },
  { href: "/sub/tools/favicon", label: "Favicon" },
  { href: "/sub/tools/markdown", label: "Markdown" },
  { href: "/sub/tools/extension", label: "拡張子" },
  { href: "/sub/tools/json", label: "JSON" },
  { href: "/sub/tools/qr", label: "QR" },
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/sub/tools" className="font-semibold text-lg tracking-tight">
            <span className="text-blue-400">Dev</span>Tools
          </Link>
          <nav className="flex items-center gap-3 text-sm text-neutral-400 overflow-x-auto">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-neutral-100 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-neutral-800 py-6 text-center text-sm text-neutral-500">
        <p>Dev Tools by Make It Tech — すべての処理はブラウザ内で完結します</p>
      </footer>
    </div>
  );
}
