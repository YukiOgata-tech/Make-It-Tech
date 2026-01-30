"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteBreadcrumbs } from "@/components/navigation/site-breadcrumbs";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // /sub/tools では独自レイアウトを使用するため、メインのヘッダー/フッターを非表示
  const isToolsPage = pathname.startsWith("/sub/tools");

  if (isToolsPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="fixed inset-x-0 top-0 z-50">
        <SiteHeader />
        <SiteBreadcrumbs />
      </div>
      <main className="flex-1 pt-[var(--header-offset)]">{children}</main>
      <SiteFooter />
    </div>
  );
}
