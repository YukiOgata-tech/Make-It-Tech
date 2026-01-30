"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteBreadcrumbs } from "@/components/navigation/site-breadcrumbs";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isToolsPage, setIsToolsPage] = useState(false);

  useEffect(() => {
    // パスまたはホスト名でツールページを判定
    const isToolsPath = pathname.startsWith("/sub/tools");
    const isToolsHost = window.location.hostname.startsWith("tools.");
    setIsToolsPage(isToolsPath || isToolsHost);
  }, [pathname]);

  // ツールページの場合は独自レイアウトを使用
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
