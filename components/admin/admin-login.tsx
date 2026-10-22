"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
    <div className="mx-auto flex min-h-[52vh] max-w-lg flex-col justify-center px-3 py-10 sm:min-h-[70vh] sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border/60 bg-background/70 p-5 shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          管理者ログイン
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Make It Tech の管理者アカウントでログインしてください。
        </p>

        <form onSubmit={handleEmailLogin} className="mt-5 grid gap-3 sm:gap-4">
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
            />
          </div>
          <Button type="submit" className="rounded-xl" disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                ログイン中...
              </span>
            ) : (
              "メールでログイン"
            )}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          <span>または</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl"
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

        {message ? <p className="mt-4 text-xs text-destructive">{message}</p> : null}
      </div>
    </div>
  );
}
