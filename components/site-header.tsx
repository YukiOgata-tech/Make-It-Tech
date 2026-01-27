"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, ArrowRight, ChevronDown, ChevronRight, Moon, Sun } from "lucide-react";

type NavItem = { label: string; href: string };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function useScrollShadow(threshold = 8) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

const primaryNav: NavItem[] = [
  { label: "サービス", href: "/services" },
  { label: "料金", href: "/pricing" },
  { label: "事業所概要", href: "/about" },
];

const secondaryNav: NavItem[] = [
  { label: "お問い合わせ", href: "/contact" },
  { label: "LINEで相談", href: "/survey" },
  { label: "業務診断", href: "/#diagnosis" },
  { label: "用語集", href: "/glossary" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrollShadow();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

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

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent relative",
        "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        "after:pointer-events-none after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-primary/50 after:via-accent/40 after:to-secondary/50",
        scrolled ? "shadow-sm" : "shadow-none"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center">
            <Image
              src={site.logo}
              alt={`${site.name} logo`}
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">{site.name}</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {/* More dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "rounded-xl px-3 text-sm",
                  secondaryNav.some((n) => isActive(pathname, n.href)) && "bg-primary/10"
                )}
              >
                もっと <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              {secondaryNav.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>

          <Button asChild className="ml-2 rounded-xl">
            <Link href="/contact">
              無料相談 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-primary/20 bg-background/80 shadow-sm hover:bg-primary/10"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-primary/20 bg-background/80 shadow-sm hover:bg-primary/10"
                aria-label="メニューを開く"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[320px] rounded-l-3xl bg-background/95 px-5 py-6 backdrop-blur"
            >
              <SheetHeader className="gap-1 p-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center">
                    <Image
                      src={site.logo}
                      alt={`${site.name} logo`}
                      width={36}
                      height={36}
                      className="h-9 w-9 object-contain"
                    />
                  </span>
                  <SheetTitle className="text-sm font-semibold">{site.name}</SheetTitle>
                </div>
                <SheetDescription className="text-xs text-muted-foreground">
                  {site.tagline}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 grid gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">メイン</p>
                  <div className="mt-2 overflow-hidden rounded-2xl border border-border/60 bg-background/70">
                    {primaryNav.map((item, index) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between px-4 py-2.5 text-sm transition",
                            index !== primaryNav.length - 1 && "border-b border-border/60",
                            active
                              ? "bg-primary/10 text-foreground"
                              : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                          )}
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground">その他</p>
                  <div className="mt-2 overflow-hidden rounded-2xl border border-border/60 bg-background/70">
                    {secondaryNav.map((item, index) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between px-4 py-2.5 text-sm transition",
                            index !== secondaryNav.length - 1 && "border-b border-border/60",
                            active
                              ? "bg-primary/10 text-foreground"
                              : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                          )}
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Button asChild size="sm" className="w-full rounded-2xl">
                  <Link href="/contact">
                    無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <p className="mt-3 text-xs text-muted-foreground">
                  {site.contact?.responseHours ?? "平日 10:00 - 19:00（目安）"}
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
