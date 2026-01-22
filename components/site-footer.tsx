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
      { label: "事前アンケート", href: "/survey" },
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
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const brand = site?.name ?? "DX Support";

  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top area */}
        <div className="grid gap-8 py-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <p className="text-base font-semibold tracking-tight">{brand}</p>
            <p className="text-sm text-muted-foreground">
              Web制作 / 業務改善 / 自動化 / DX支援など、IT領域全般を柔軟にサポートします。
              まずは最小構成で動かして検証し、成果に寄せます。
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="rounded-xl">
                <Link href="/contact">
                  無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/pricing">料金の目安</Link>
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-8 sm:grid-cols-3 md:col-span-2">
            {footerLinks.map((group) => (
              <div key={group.title} className="space-y-3">
                <p className="text-sm font-medium">{group.title}</p>
                <ul className="grid gap-2 text-sm text-muted-foreground">
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
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} {brand}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
              <span>
                {site?.contact?.email ?? "hello@example.com"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
