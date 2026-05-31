"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  getToolCategory,
  getToolHref,
  type ToolCategory,
  toolCategories,
  tools,
} from "../_data/tools";
import { AdsenseAdSlot } from "./adsense-ad-slot";
import { CookieConsentBanner } from "./cookie-consent";

export function ToolsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTool = tools.find((tool) => pathname === getToolHref(tool.id));
  const activeCategory = activeTool?.category ?? getToolCategory(pathname.replace("/sub/tools/", ""));
  const [selectedCategory, setSelectedCategory] =
    useState<ToolCategory["id"]>(activeCategory);
  const visibleCategory = activeTool ? activeTool.category : selectedCategory;
  const visibleTools = tools.filter((tool) => tool.category === visibleCategory);

  const isActive = (href: string) => {
    if (href === "/sub/tools") {
      return pathname === "/sub/tools" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-dvh bg-neutral-950 text-sm text-neutral-100 sm:text-base">
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="flex h-12 items-center justify-between sm:h-14">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/sub/tools"
                className="shrink-0 text-base font-semibold tracking-tight sm:text-lg"
                onClick={() => setSelectedCategory(activeCategory)}
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
            <Link
              href="/sub/tools"
              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                isActive("/sub/tools")
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              ホーム
            </Link>
          </div>
        </div>

        <div className="border-t border-neutral-800/80">
          <div className="tools-nav-scroll mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-2 py-1.5 sm:px-4">
            {toolCategories.map((category) => {
              const isSelected = category.id === visibleCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors sm:h-9 sm:px-3.5 sm:text-sm ${
                    isSelected
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-[11px] leading-none sm:text-xs">{category.icon}</span>
                  <span>{category.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-neutral-800/60 bg-neutral-950/55">
          <nav
            className="tools-nav-scroll mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-2 py-1.5 sm:px-4 sm:py-2"
            aria-label="Tools category navigation"
          >
            {visibleTools.map((item) => {
              const href = getToolHref(item.id);
              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={() => setSelectedCategory(item.category)}
                  className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs transition-colors sm:h-10 sm:px-3 sm:text-sm ${
                    isActive(href)
                      ? "bg-blue-600 text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <span className="text-sm leading-none sm:text-base">{item.icon}</span>
                  <span>{item.navLabel}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
        {pathname === "/sub/tools" || pathname === "/" ? null : (
          <div className="tools-page-container pt-0">
            <AdsenseAdSlot minHeight={100} />
          </div>
        )}
      </main>

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
