import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { appCatalog } from "@/content/apps/catalog";

export const metadata: Metadata = {
  title: "アプリ一覧",
  description: "Make It Tech が公開しているアプリのサポート・規約ページ一覧です。",
};

export default function AppsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">APPS</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">アプリ一覧</h1>
          <p className="text-sm text-muted-foreground">
            ここでは、Make It Tech が制作したアプリのサポート・規約情報をまとめています。
          </p>
        </div>

        <Separator className="my-6 sm:my-8" />

        <div className="grid gap-4 sm:grid-cols-2">
          {appCatalog.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-border/60 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{app.name}</p>
                  <p className="text-xs text-muted-foreground">{app.tagline}</p>
                </div>
                <Badge variant="secondary" className="rounded-xl text-[10px]">
                  {app.statusLabel}
                </Badge>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{app.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          今後、追加したアプリの情報もこちらに順次掲載します。
        </p>
      </div>
    </div>
  );
}
