"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Sparkles, ArrowRight, ChevronDown } from "lucide-react";

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
];

const secondaryNav: NavItem[] = [
  { label: "お問い合わせ", href: "/contact" },
  { label: "アンケート", href: "/survey" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrollShadow();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b",
        "bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        scrolled ? "shadow-sm" : "shadow-none"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background shadow-sm transition group-hover:shadow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-tight">{site.name}</span>
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
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
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
                  secondaryNav.some((n) => isActive(pathname, n.href)) && "bg-muted"
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

          <Button asChild className="ml-2 rounded-xl">
            <Link href="/contact">
              無料相談 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[340px] rounded-l-3xl">
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{site.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {site.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-2">
                {[...primaryNav, ...secondaryNav].map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm transition",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6">
                <Button asChild className="w-full rounded-2xl">
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
