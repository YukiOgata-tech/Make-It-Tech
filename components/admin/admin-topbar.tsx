"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Menu, PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import type { MitSession } from "@/lib/admin-auth";
import { getAdminBreadcrumbs, getAdminPageMeta } from "@/lib/admin-navigation";
import { site } from "@/lib/site";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";

type AdminTopbarProps = {
  session: MitSession;
  onDesktopToggle: () => void;
  onMobileOpen: () => void;
};

export function AdminTopbar({ session, onDesktopToggle, onMobileOpen }: AdminTopbarProps) {
  const pathname = usePathname();
  const meta = getAdminPageMeta(pathname);
  const breadcrumbs = getAdminBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-border/75 bg-card/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMobileOpen}
        className="mr-3 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        aria-label="メニューを開く"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <Link href="/sub/admin-console" className="mr-3 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5 md:hidden" aria-label="Make It Tech 管理トップ">
        <Image src={site.logo} alt="" width={32} height={32} className="size-full object-contain" />
      </Link>
      <button
        type="button"
        onClick={onDesktopToggle}
        className="mr-4 hidden size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
        aria-label="サイドバーを切り替える"
      >
        <PanelLeft className="size-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <nav aria-label="パンくず" className="flex min-w-0 items-center">
          <ol className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
            {breadcrumbs.map((breadcrumb, index) => {
              const current = index === breadcrumbs.length - 1;
              return (
                <li key={`${breadcrumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
                  {index > 0 ? (
                    <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                  ) : null}
                  {breadcrumb.href && !current ? (
                    <Link
                      href={breadcrumb.href}
                      className="truncate rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span
                      className={current ? "truncate font-medium text-foreground/75" : "truncate"}
                      aria-current={current ? "page" : undefined}
                    >
                      {breadcrumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="flex min-w-0 items-baseline gap-3">
          <p className="truncate text-[15px] font-semibold tracking-tight sm:text-[17px]">{meta.title}</p>
          <p className="hidden truncate text-xs text-muted-foreground lg:block">{meta.description}</p>
        </div>
      </div>

      <AdminUserMenu session={session} />
    </header>
  );
}
