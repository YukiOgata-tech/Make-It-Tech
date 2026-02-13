"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_NAME = "mit_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const CONSENT_EVENT = "mit-cookie-consent-updated";

type ConsentState = "accepted" | "declined" | "unset";

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
}

function setCookieValue(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function MinimalConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>("unset");

  useEffect(() => {
    const stored = getCookieValue(COOKIE_NAME);
    if (stored === "accepted" || stored === "declined") {
      setConsent(stored);
    }
  }, []);

  const updateConsent = (next: Exclude<ConsentState, "unset">) => {
    setConsent(next);
    setCookieValue(COOKIE_NAME, next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(CONSENT_EVENT));
    }
  };

  if (consent !== "unset") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border/70 bg-background/95 p-3 shadow-xl backdrop-blur sm:p-4">
        <p className="text-xs text-muted-foreground sm:text-sm">
          このページではアクセス解析のためCookieを利用します。
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <Link href="/privacy" className="text-xs text-muted-foreground underline underline-offset-2">
            プライバシーポリシー
          </Link>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => updateConsent("declined")}
            >
              同意しない
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-xl"
              onClick={() => updateConsent("accepted")}
            >
              同意する
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
