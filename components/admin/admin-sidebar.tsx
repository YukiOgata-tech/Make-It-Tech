"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { MitSession } from "@/lib/admin-auth";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  adminNavigation,
  isAdminNavigationItemActive,
} from "@/lib/admin-navigation";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  session: MitSession;
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
};

export function AdminSidebar({
  session,
  collapsed = false,
  onToggle,
  onNavigate,
  mobile = false,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const [logoutError, setLogoutError] = React.useState("");
  const [openSections, setOpenSections] = React.useState<Set<string>>(
    () => new Set(adminNavigation.map((section) => section.label))
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("ログアウトできませんでした。もう一度お試しください。");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "ログアウトできませんでした。");
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleSection = (label: string) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex h-16 shrink-0 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-4")}>
        <Link
          href="/sub/admin-console"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-white p-1 shadow-sm ring-1 ring-black/5">
            <Image src={site.logo} alt="Make It Tech" width={36} height={36} className="size-full object-contain" />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold tracking-tight">Make It Tech</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Business Console
              </span>
            </span>
          ) : null}
        </Link>
      </div>

      <nav className={cn("min-h-0 flex-1 overflow-y-auto py-5", collapsed ? "px-2" : "px-3")} aria-label="管理画面ナビゲーション">
        <div className="space-y-6">
          {adminNavigation.map((section) => {
            const isOpen = collapsed || openSections.has(section.label);
            return (
              <div key={section.label}>
                {!collapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.label)}
                    className="mb-2 flex w-full items-center justify-between rounded-md px-3 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    aria-expanded={isOpen}
                  >
                    {section.label}
                    <ChevronDown className={cn("size-3.5 transition-transform", !isOpen && "-rotate-90")} aria-hidden="true" />
                  </button>
                ) : null}

                {isOpen ? (
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isAdminNavigationItemActive(pathname, item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          title={collapsed ? item.label : undefined}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative flex h-10 items-center gap-3 rounded-xl text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                            collapsed ? "justify-center px-2" : "px-3",
                            active
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                          {!collapsed ? <span className="truncate">{item.label}</span> : null}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>

      <div className={cn("shrink-0 border-t border-sidebar-border py-3", collapsed ? "px-2" : "px-3")}>
        <a
          href={site.url}
          className={cn(
            "flex h-10 items-center gap-3 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed ? "justify-center px-2" : "px-3"
          )}
          title={collapsed ? "公開サイト" : undefined}
        >
          <ExternalLink className="size-[18px] shrink-0" aria-hidden="true" />
          {!collapsed ? <span>公開サイト</span> : null}
        </a>
        <button
          type="button"
          onClick={() => setLogoutConfirmOpen(true)}
          disabled={loggingOut}
          className={cn(
            "flex h-10 w-full items-center gap-3 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:opacity-50",
            collapsed ? "justify-center px-2" : "px-3"
          )}
          title={collapsed ? "ログアウト" : undefined}
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
          {!collapsed ? <span>{loggingOut ? "ログアウト中..." : "ログアウト"}</span> : null}
        </button>
        <AdminConfirmDialog
          open={logoutConfirmOpen}
          onOpenChange={(open) => { setLogoutConfirmOpen(open); if (!open) setLogoutError(""); }}
          onConfirm={() => void handleLogout()}
          title="ログアウトしますか？"
          description="管理画面からサインアウトします。再度利用するにはログインが必要です。"
          confirmLabel="ログアウト"
          icon="logout"
          tone="caution"
          busy={loggingOut}
          error={logoutError}
        />
        {!mobile && onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "mt-1 flex h-9 w-full items-center gap-3 rounded-lg text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              collapsed ? "justify-center px-2" : "px-3"
            )}
            aria-label={collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
            title={collapsed ? "サイドバーを展開" : undefined}
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" aria-hidden="true" /> : <PanelLeftClose className="size-[18px]" aria-hidden="true" />}
            {!collapsed ? <span>折りたたむ</span> : null}
            {!collapsed ? <kbd className="ml-auto rounded border border-sidebar-border px-1.5 py-0.5 text-[9px]">Ctrl B</kbd> : null}
          </button>
        ) : null}
        {!collapsed ? (
          <p className="mt-3 truncate px-3 text-[10px] text-muted-foreground/75" title={session.email}>
            {session.email}
          </p>
        ) : null}
      </div>
    </div>
  );
}
