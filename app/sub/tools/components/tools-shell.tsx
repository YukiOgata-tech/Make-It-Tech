"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Braces, ChevronDown, FileText, Grid3X3, Home, ImageIcon, PlaySquare, ShieldCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getToolHref,
  getPublicToolHref,
  toolCategories,
  tools,
} from "../_data/tools";
// import { AdsenseAdSlot } from "./adsense-ad-slot";
import { CookieConsentBanner } from "./cookie-consent";

export function ToolsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const homeHref = "/";

  const categoryIcons = useMemo(
    () => ({
      image: ImageIcon,
      pdf: FileText,
      text: Braces,
      animation: PlaySquare,
    }),
    []
  );

  const getShellHref = (id: string) => getPublicToolHref(id);
  const getCategoryMeta = (categoryId: string) =>
    toolCategories.find((category) => category.id === categoryId);
  const primaryTools = useMemo(
    () =>
      tools
        .filter((tool) => typeof tool.navPriority === "number")
        .sort((a, b) => (a.navPriority ?? 999) - (b.navPriority ?? 999))
        .slice(0, 5),
    []
  );

  const isHomeActive = pathname === "/sub/tools" || pathname === "/";
  const isToolActive = (id: string) => {
    return pathname === getToolHref(id) || pathname === getPublicToolHref(id);
  };

  return (
    <div className="min-h-dvh bg-neutral-950 text-sm text-neutral-100 sm:text-base">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 text-neutral-950 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="flex min-h-16 flex-col gap-2 py-2 sm:py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Link
                href={homeHref}
                className="group flex min-w-0 items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center">
                  <Image
                    src="https://make-it-tech.com/images/logo-02_MIT.png"
                    alt="Make It Tech logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                    priority
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-bold tracking-tight text-[#211f1d] sm:text-lg">
                    DevTools
                  </span>
                  <span className="hidden text-[11px] font-medium text-[#756f67] sm:block">
                    Make It Tech
                  </span>
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 sm:inline-flex">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ローカル処理
                </span>
                <Link
                  href={homeHref}
                  onClick={() => setMenuOpen(false)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
                    isHomeActive
                      ? "bg-[#e84d3d] text-white shadow-sm"
                      : "text-[#6e6860] hover:bg-[#f4eee5] hover:text-[#211f1d]"
                  }`}
                >
                  <Home className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">ホーム</span>
                </Link>
              </div>
            </div>

            <div className="min-w-0 flex-1 lg:max-w-4xl">
              <nav
                className="tools-nav-scroll flex items-center gap-1.5 overflow-x-auto"
                aria-label="Main tools navigation"
              >
                {primaryTools.map((item) => {
                  const href = getShellHref(item.id);
                  return (
                    <Link
                      key={item.id}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors sm:px-3.5 sm:text-sm ${
                        isToolActive(item.id)
                          ? "bg-[#e84d3d] text-white shadow-sm"
                          : "text-[#5f5a53] hover:bg-[#f7f0e8] hover:text-[#211f1d]"
                      }`}
                    >
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                          isToolActive(item.id)
                            ? "bg-white/20 text-white"
                            : "bg-[#f3e7db] text-[#a33a2f]"
                        }`}
                      >
                        {getCategoryMeta(item.category)?.shortLabel ?? item.category}
                      </span>
                      <span>{item.navLabel}</span>
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors sm:px-3.5 sm:text-sm ${
                    menuOpen
                      ? "bg-[#211f1d] text-white"
                      : "text-[#5f5a53] hover:bg-[#f7f0e8] hover:text-[#211f1d]"
                  }`}
                  aria-expanded={menuOpen}
                  aria-controls="tools-menu-panel"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  <span>すべてのツール</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>
              </nav>
            </div>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-[#eadfd4] bg-[#fffaf4] shadow-lg" id="tools-menu-panel">
            <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#211f1d]">すべてのツール</p>
                  <p className="mt-0.5 text-xs text-[#756f67]">
                    よく使う機能は上部に固定し、追加機能はここから選べます。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#6e6860] hover:bg-[#f1e7dc] hover:text-[#211f1d]"
                  aria-label="ツールメニューを閉じる"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {toolCategories.map((category) => {
                  const CategoryIcon = categoryIcons[category.id];
                  const categoryTools = tools.filter((tool) => tool.category === category.id);
                  return (
                    <section key={category.id} className="rounded-2xl border border-[#eadfd4] bg-white p-3">
                      <div className="mb-2 flex items-center gap-2 px-1">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f7f0e8] text-[#e84d3d]">
                          <CategoryIcon className="h-4 w-4" />
                        </span>
                        <h2 className="text-sm font-bold text-[#211f1d]">{category.label}</h2>
                      </div>
                      <div className="grid gap-1">
                        {categoryTools.map((tool) => {
                          const isPrimary = primaryTools.some((item) => item.id === tool.id);
                          return (
                            <Link
                              key={tool.id}
                              href={getShellHref(tool.id)}
                              onClick={() => setMenuOpen(false)}
                              className={`group flex items-start gap-2 rounded-xl px-2 py-2 transition-colors ${
                                isToolActive(tool.id)
                                  ? "bg-[#fff1ee] text-[#b53024]"
                                  : "text-[#4d4842] hover:bg-[#fff6ef] hover:text-[#211f1d]"
                              }`}
                            >
                              <span className="mt-0.5 rounded-md bg-[#f7f0e8] px-1.5 py-1 text-[10px] font-bold leading-none text-[#a33a2f]">
                                {category.shortLabel}
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-center gap-1.5 text-sm font-semibold">
                                  {tool.name}
                                  {isPrimary ? (
                                    <span className="rounded-full bg-[#fff1ee] px-1.5 py-0.5 text-[10px] font-bold text-[#d84434]">
                                      主要
                                    </span>
                                  ) : null}
                                </span>
                                <span className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[#756f67]">
                                  {tool.description}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
        {pathname === "/sub/tools" || pathname === "/" ? null : (
          <div className="tools-page-container pt-0">
            {/* <AdsenseAdSlot minHeight={100} /> */}
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
