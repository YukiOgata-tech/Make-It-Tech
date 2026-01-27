import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";

const footerLinks = [
  {
    title: "サービス",
    links: [
      { label: "サービス概要", href: "/services" },
      { label: "料金の目安", href: "/pricing" },
      { label: "事業所概要", href: "/about" },
      { label: "業務診断", href: "/#diagnosis" },
      { label: "LINEで相談", href: "/survey" },
    ],
  },
  {
    title: "お問い合わせ",
    links: [
      { label: "無料相談", href: "/contact" },
      { label: "対応の流れ", href: "/#process" }, // ※後でアンカー付けたいなら使える
    ],
  },
  {
    title: "法務・ポリシー",
    links: [
      { label: "注意事項（利用規約）", href: "/terms" },
      { label: "プライバシーポリシー", href: "/privacy" },
    ],
  },
  {
    title: "ナレッジ",
    links: [
      { label: "用語集", href: "/glossary" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const brand = site?.name ?? "DX Support";

  return (
    <footer className="mt-12 border-t border-primary/20 bg-background/70 backdrop-blur relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top area */}
        <div className="grid gap-6 py-4 md:grid-cols-3 md:gap-8 md:py-10">
          {/* Brand */}
          <div className="space-y-1.5 sm:space-y-3">
            <div className="flex items-center gap-1">
                <Image
                  src={site.logo}
                  alt={`${brand} logo`}
                  width={44}
                  height={44}
                  className="h-9 w-9 rounded-full sm:h-10 sm:w-10"
                />

              <p className="text-base font-semibold tracking-tight">{brand}</p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Web制作 / 業務改善 / 自動化 / DX支援など、IT領域全般を柔軟にサポートします。
              まずは最小構成で動かして検証し、成果に寄せます。
            </p>

            <div className="grid gap-2 pt-1 sm:flex sm:flex-wrap sm:gap-3">
              <Button asChild size="sm" className="rounded-xl">
                <Link href="/contact">
                  無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-xl">
                <Link href="/pricing">料金の目安</Link>
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:col-span-2">
            {footerLinks.map((group) => (
              <div key={group.title} className="space-y-2">
                <p className="text-sm font-medium">{group.title}</p>
                <ul className="grid gap-1.5 text-sm text-muted-foreground">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="hover:text-foreground hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Bottom area */}
        <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} {brand}. All rights reserved.
          </p>

          <div className="grid gap-2 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <Link href="/privacy" className="hover:text-foreground hover:underline">
                Privacy
              </Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-foreground hover:underline">
                Terms
              </Link>
            </div>

            <span className="hidden sm:inline">|</span>

            <div className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <Link href="/contact" className="hover:text-foreground hover:underline">
                お問い合わせフォーム
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
