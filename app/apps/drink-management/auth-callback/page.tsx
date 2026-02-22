"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Status = "loading" | "success" | "error";

const APP_DEEP_LINK_BASE = "drinkmanagement://auth/callback";

function buildDeepLinkFromLocation() {
  if (typeof window === "undefined") return APP_DEEP_LINK_BASE;

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);
  const merged = new URLSearchParams();

  // Supabase callback uses hash in implicit flow.
  // Keep query params too so PKCE/code flow can also be forwarded.
  for (const [key, value] of queryParams.entries()) {
    if (value) merged.set(key, value);
  }
  for (const [key, value] of hashParams.entries()) {
    if (value) merged.set(key, value);
  }

  const hasAuthToken =
    merged.has("access_token") ||
    merged.has("refresh_token") ||
    merged.has("code") ||
    merged.has("token_hash");

  if (!hasAuthToken) {
    return null;
  }

  const query = merged.toString();
  return query ? `${APP_DEEP_LINK_BASE}?${query}` : APP_DEEP_LINK_BASE;
}

export default function DrinkManagementAuthCallbackPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [deepLink, setDeepLink] = useState(APP_DEEP_LINK_BASE);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const generated = buildDeepLinkFromLocation();
    if (!generated) {
      setStatus("error");
      setErrorMessage("認証情報を確認できませんでした。メールのリンクを再度開いてください。");
      return;
    }

    setDeepLink(generated);
    setStatus("success");

    const timer = window.setTimeout(() => {
      window.location.href = generated;
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  const title = useMemo(() => {
    if (status === "loading") return "認証確認中";
    if (status === "success") return "認証が完了しました";
    return "認証を完了できませんでした";
  }, [status]);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-4 py-10 sm:px-6">
        <section className="w-full rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            DrinkManagement
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>

          {status === "loading" ? (
            <p className="mt-3 text-sm text-muted-foreground">
              トークンを確認しています。しばらくお待ちください。
            </p>
          ) : null}

          {status === "success" ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                このあと自動でアプリへ戻ります。開かない場合は下のボタンを押してください。
              </p>
              <a
                href={deepLink}
                className="mt-5 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                アプリを開く
              </a>
            </>
          ) : null}

          {status === "error" ? (
            <>
              <p className="mt-3 text-sm text-destructive">{errorMessage}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                メールアプリに戻り、最新の認証メールのリンクを再度開いてください。
              </p>
            </>
          ) : null}

          <div className="mt-6 border-t border-border/60 pt-4">
            <Link href="/apps/drink-management/support" className="text-xs text-muted-foreground underline underline-offset-2">
              サポートページ
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
