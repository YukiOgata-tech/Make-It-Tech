import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { site } from "@/lib/site";

export function AdminHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:flex-nowrap sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
              Make It Tech
            </p>
            <p className="text-base font-semibold tracking-tight sm:text-lg">
              Admin Console
            </p>
          </div>
          <Badge variant="secondary" className="rounded-xl">
            運用管理
          </Badge>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
          <Link
            href="/sub/admin-console"
            className="rounded-xl border border-border/60 bg-background/80 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:px-3 sm:py-2 sm:text-xs"
          >
            管理トップ
          </Link>
          <Link
            href="/sub/admin-console/news"
            className="rounded-xl border border-border/60 bg-background/80 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:px-3 sm:py-2 sm:text-xs"
          >
            お知らせ
          </Link>
          <Link
            href="/sub/admin-console/blog"
            className="rounded-xl border border-border/60 bg-background/80 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:px-3 sm:py-2 sm:text-xs"
          >
            ブログ
          </Link>
          <Link
            href="/sub/admin-console/results"
            className="rounded-xl border border-border/60 bg-background/80 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:px-3 sm:py-2 sm:text-xs"
          >
            回答一覧
          </Link>
          <a
            href={site.url}
            className="rounded-xl border border-border/60 bg-background/80 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:px-3 sm:py-2 sm:text-xs"
          >
            メインサイトへ
          </a>
        </nav>
      </div>
    </header>
  );
}
