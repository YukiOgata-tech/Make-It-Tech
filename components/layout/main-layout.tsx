"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteBreadcrumbs } from "@/components/navigation/site-breadcrumbs";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isToolsPath = pathname.startsWith("/sub/tools");
  const isAdminConsolePath = pathname.startsWith("/sub/admin-console");
  const isAppsPath = pathname === "/apps" || pathname.startsWith("/apps/");
  const isToolsHost = hostname.startsWith("tools.");
  const isAdminConsoleHost = hostname.startsWith("admin-console.");

  // ツール/管理画面は独自レイアウトを使用
  if (isToolsPath || isAdminConsolePath || isAppsPath || isToolsHost || isAdminConsoleHost) {
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
