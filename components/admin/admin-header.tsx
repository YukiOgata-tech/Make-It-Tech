"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  BookOpenText,
  ChevronDown,
  ClipboardList,
  FileSignature,
  Heart,
  Home,
  Mail,
  Menu,
  Moon,
  Newspaper,
  RadioTower,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const menuGroups = [
  {
    label: "契約・顧客対応",
    items: [
      {
        href: "/sub/admin-console/contracts",
        label: "契約管理",
        description: "契約書作成・署名・証跡",
        icon: FileSignature,
        iconClassName: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
      },
      {
        href: "/sub/admin-console/results",
        label: "業務診断 回答一覧",
        description: "相談内容と対応状況",
        icon: ClipboardList,
        iconClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
      },
      {
        href: "/sub/admin-console/create-email",
        label: "メール送信",
        description: "問い合わせ返信・営業メール",
        icon: Mail,
        iconClassName: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
      },
    ],
  },
  {
    label: "コンテンツ・設定",
    items: [
      {
        href: "/sub/admin-console/news",
        label: "お知らせ",
        description: "企業情報・メディア・実績",
        icon: Newspaper,
        iconClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      },
      {
        href: "/sub/admin-console/blog",
        label: "ブログ",
        description: "記事とSEOコンテンツ",
        icon: BookOpenText,
        iconClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      },
      {
        href: "/sub/admin-console/nfc-links",
        label: "NFCリンク設定",
        description: "固定URLの遷移先",
        icon: RadioTower,
        iconClassName: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
      },
      {
        href: "/sub/admin-console/my-life",
        label: "My Life 設定",
        description: "メッセージと画像",
        icon: Heart,
        iconClassName: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      },
    ],
  },
] as const;

export function AdminHeader() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const ThemeIcon = isDark ? Sun : Moon;
  const themeLabel = mounted
    ? isDark
      ? "ライトモードに切り替え"
      : "ダークモードに切り替え"
    : "テーマを切り替え";

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
        <Link href="/sub/admin-console" className="min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="block truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
            Make It Tech
          </span>
          <span className="block truncate text-base font-semibold tracking-tight sm:text-lg">
            Admin Console
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-2" aria-label="管理メニュー">
          <Link
            href="/sub/admin-console"
            aria-label="管理トップ"
            className="hidden h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
          >
            <Home className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">管理トップ</span>
          </Link>

          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={themeLabel}
            title={themeLabel}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ThemeIcon className="size-4 transition-transform duration-300 motion-reduce:transition-none" aria-hidden="true" />
          </button>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="relative size-4" aria-hidden="true">
                  <Menu className={cn(
                    "absolute inset-0 size-4 transition-all duration-200 motion-reduce:transition-none",
                    menuOpen ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
                  )} />
                  <X className={cn(
                    "absolute inset-0 size-4 transition-all duration-200 motion-reduce:transition-none",
                    menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"
                  )} />
                </span>
                <span>メニュー</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
                    menuOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border-border/70 p-2 shadow-xl motion-reduce:animate-none"
            >
              {menuGroups.map((group, groupIndex) => (
                <React.Fragment key={group.label}>
                  {groupIndex > 0 ? <DropdownMenuSeparator className="my-2" /> : null}
                  <DropdownMenuLabel className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {group.label}
                  </DropdownMenuLabel>
                  <DropdownMenuGroup className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <DropdownMenuItem
                          key={item.href}
                          asChild
                          className={cn("rounded-xl p-0", active && "bg-accent")}
                        >
                          <Link href={item.href} className="flex w-full items-center gap-3 p-2.5">
                            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", item.iconClassName)}>
                              <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-foreground">{item.label}</span>
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                            </span>
                            {active ? (
                              <>
                                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                                <span className="sr-only">現在のページ</span>
                              </>
                            ) : null}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </React.Fragment>
              ))}

              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild className="rounded-xl p-0">
                <a href={site.url} className="flex w-full items-center gap-3 p-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Home className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">メインサイトへ</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">公開サイトを確認</span>
                  </span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
