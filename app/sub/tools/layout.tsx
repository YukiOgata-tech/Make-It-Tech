import type { Metadata } from "next";

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

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/sub/tools" className="font-semibold text-lg tracking-tight">
            <span className="text-blue-400">Dev</span>Tools
          </a>
          <nav className="flex items-center gap-4 text-sm text-neutral-400">
            <a href="/sub/tools#compress" className="hover:text-neutral-100 transition-colors">圧縮</a>
            <a href="/sub/tools#convert" className="hover:text-neutral-100 transition-colors">変換</a>
            <a href="/sub/tools#resize" className="hover:text-neutral-100 transition-colors">リサイズ</a>
            <a href="/sub/tools#base64" className="hover:text-neutral-100 transition-colors">Base64</a>
            <a href="/sub/tools#favicon" className="hover:text-neutral-100 transition-colors">Favicon</a>
            <a href="/sub/tools#markdown" className="hover:text-neutral-100 transition-colors">Markdown</a>
            <a href="/sub/tools#extension" className="hover:text-neutral-100 transition-colors">拡張子</a>
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
