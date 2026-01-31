"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CookieConsentBanner } from "./cookie-consent";

const navItems = [
  { href: "/sub/tools", label: "ホーム", icon: "🏠" },
  { href: "/sub/tools/compress", label: "圧縮", icon: "📦" },
  { href: "/sub/tools/convert", label: "変換", icon: "🔄" },
  { href: "/sub/tools/resize", label: "リサイズ", icon: "📐" },
  { href: "/sub/tools/base64", label: "Base64", icon: "🔣" },
  { href: "/sub/tools/favicon", label: "Favicon", icon: "⭐" },
  { href: "/sub/tools/markdown", label: "Markdown", icon: "📝" },
  { href: "/sub/tools/extension", label: "拡張子", icon: "📄" },
  { href: "/sub/tools/json", label: "JSON", icon: "📊" },
  { href: "/sub/tools/qr", label: "QR", icon: "📱" },
];

export function ToolsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/sub/tools") {
      return pathname === "/sub/tools" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/sub/tools"
                className="font-semibold text-lg tracking-tight shrink-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-blue-400">Dev</span>Tools
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/50 border border-green-700/50 rounded text-[10px] text-green-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                ローカル処理
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
              aria-label="メニュー"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-sm">
            <nav className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-3 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Privacy Notice */}
          <div className="flex items-center justify-center gap-2 mb-3 text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-medium">プライバシー保護</span>
          </div>
          <div className="text-center text-[11px] text-neutral-500 space-y-1">
            <p>すべての処理はブラウザ内で完結 - サーバーへのアップロードなし</p>
            <p>ファイルはお使いのデバイスから外部に送信されません</p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/50 text-center text-[10px] text-neutral-600">
            Dev Tools by Make It Tech
          </div>
        </div>
      </footer>

      {/* Cookie Consent */}
      <CookieConsentBanner />
    </div>
  );
}
