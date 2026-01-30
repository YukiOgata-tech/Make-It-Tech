import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

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
    <html lang="ja" suppressHydrationWarning>
      <body className={`${outfit.variable} min-h-dvh bg-neutral-950 text-neutral-100 font-sans antialiased`}>
        <ThemeProvider>
          <div className="min-h-dvh flex flex-col">
            <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-50">
              <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                <a href="/sub/tools" className="font-semibold text-lg tracking-tight">
                  <span className="text-blue-400">Dev</span>Tools
                </a>
                <nav className="flex items-center gap-6 text-sm text-neutral-400">
                  <a href="/sub/tools#compress" className="hover:text-neutral-100 transition-colors">圧縮</a>
                  <a href="/sub/tools#convert" className="hover:text-neutral-100 transition-colors">変換</a>
                  <a href="/sub/tools#resize" className="hover:text-neutral-100 transition-colors">リサイズ</a>
                  <a href="/sub/tools#base64" className="hover:text-neutral-100 transition-colors">Base64</a>
                  <a href="/sub/tools#favicon" className="hover:text-neutral-100 transition-colors">Favicon</a>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
