"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const ADMIN_ROLES = new Set(["owner", "admin"]);

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const verifyAdminAccess = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .rpc("get_mit_admin_access")
      .maybeSingle();

    const access = data as { role?: string } | null;
    if (error || !access?.role || !ADMIN_ROLES.has(access.role)) {
      await supabase.auth.signOut();
      throw new Error("この管理画面を利用する権限がありません。");
    }
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      await verifyAdminAccess();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ログインに失敗しました。");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.9fr)_minmax(32rem,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(226,103,61,0.28),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(42,157,145,0.2),transparent_40%)]" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-xs font-bold text-slate-950">MIT</span>
          <div>
            <p className="text-sm font-semibold">Make It Tech</p>
            <p className="text-[10px] uppercase tracking-[0.17em] text-slate-400">Business Console</p>
          </div>
        </div>
        <div className="relative max-w-lg">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-orange-300 ring-1 ring-white/10">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight">
            事業の情報と日々の業務を、ひとつの場所に。
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            問い合わせ、契約、メール、コンテンツを安全に管理するためのMake It Tech専用コンソールです。
          </p>
        </div>
        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Make It Tech</p>
      </section>

      <main className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">MIT</span>
            <div>
              <p className="text-sm font-semibold">Make It Tech</p>
              <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground">Business Console</p>
            </div>
          </div>

          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">管理者ログイン</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            管理権限のあるアカウントでログインしてください。
          </p>

        <form onSubmit={handleEmailLogin} className="mt-8 grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
              className="h-11 bg-card"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
              className="h-11 bg-card"
            />
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                ログイン中...
              </span>
            ) : (
              <>
                メールでログイン
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          <span>または</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl bg-card"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              認証中...
            </span>
          ) : (
            "Googleでログイン"
          )}
        </Button>

        {message ? (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {message}
          </p>
        ) : null}
        <p className="mt-7 text-center text-[11px] leading-5 text-muted-foreground">
          この画面はMake It Techの許可されたメンバー専用です。
        </p>
      </div>
      </main>
    </div>
  );
}
