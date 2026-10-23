"use client";

import * as React from "react";
import type { MitSession } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminNavigationProgress } from "@/components/admin/admin-navigation-progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SIDEBAR_COOKIE_NAME = "admin_sidebar_state";

type AdminShellProps = {
  session: MitSession;
  defaultSidebarOpen: boolean;
  children: React.ReactNode;
};

export function AdminShell({ session, defaultSidebarOpen, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(defaultSidebarOpen);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen((current) => {
      const next = !current;
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="admin-app flex min-h-dvh bg-background text-foreground">
      <React.Suspense fallback={null}>
        <AdminNavigationProgress />
      </React.Suspense>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border transition-[width] duration-200 md:block",
          sidebarOpen ? "w-64" : "w-[72px]"
        )}
      >
        <AdminSidebar session={session} collapsed={!sidebarOpen} onToggle={toggleSidebar} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="admin-app w-[min(19rem,86vw)] gap-0 border-sidebar-border p-0 [&>button]:hidden">
          <SheetTitle className="sr-only">管理画面メニュー</SheetTitle>
          <SheetDescription className="sr-only">管理画面の各機能へ移動します。</SheetDescription>
          <AdminSidebar session={session} mobile onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-h-dvh min-w-0 flex-1 flex-col transition-[padding] duration-200",
          sidebarOpen ? "md:pl-64" : "md:pl-[72px]"
        )}
      >
        <AdminTopbar
          session={session}
          onDesktopToggle={toggleSidebar}
          onMobileOpen={() => setMobileOpen(true)}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
