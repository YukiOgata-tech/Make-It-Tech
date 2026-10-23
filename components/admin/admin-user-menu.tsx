"use client";

import * as React from "react";
import { Check, Laptop, LogOut, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { MitSession } from "@/lib/admin-auth";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleLabels = {
  owner: "オーナー",
  admin: "管理者",
  staff: "スタッフ",
  viewer: "閲覧者",
} as const;

type AdminUserMenuProps = {
  session: MitSession;
  compact?: boolean;
};

export function AdminUserMenu({ session, compact = false }: AdminUserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const [logoutError, setLogoutError] = React.useState("");
  const initial = session.email.slice(0, 1).toUpperCase();

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

  const themes = [
    { value: "light", label: "ライト", icon: Sun },
    { value: "dark", label: "ダーク", icon: Moon },
    { value: "system", label: "端末の設定", icon: Laptop },
  ] as const;

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex min-w-0 items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="アカウントメニューを開く"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm">
            {initial}
          </span>
          {!compact ? (
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-40 truncate text-xs font-semibold text-foreground">
                {session.email}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {roleLabels[session.role]}
              </span>
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="admin-app w-64 rounded-xl p-1.5">
        <DropdownMenuLabel className="px-2.5 py-2">
          <span className="block truncate text-xs font-semibold">{session.email}</span>
          <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
            {roleLabels[session.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2.5 pb-1 pt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          表示テーマ
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {themes.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.value}
                className="rounded-lg"
                onSelect={() => setTheme(item.value)}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
                {theme === item.value ? <Check className="ml-auto size-4" aria-hidden="true" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-lg text-destructive focus:text-destructive"
          disabled={loggingOut}
          onSelect={() => setLogoutConfirmOpen(true)}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {loggingOut ? "ログアウト中..." : "ログアウト"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
    </>
  );
}
