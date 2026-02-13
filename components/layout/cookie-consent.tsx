"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Easing } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COOKIE_NAME = "mit_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days
const easeOut: Easing = [0.22, 1, 0.36, 1];

type ConsentState = "accepted" | "declined" | "unset";
const CONSENT_EVENT = "mit-cookie-consent-updated";

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

export function CookieConsent({ className }: { className?: string }) {
  const [consent, setConsent] = React.useState<ConsentState>("unset");
  const pathname = usePathname();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const isToolsHost = hostname.startsWith("tools.");
  const isToolsPath = pathname.startsWith("/sub/tools");
  const isMyLifePath = pathname === "/this-is-my-life";

  React.useEffect(() => {
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

  const isOpen = consent === "unset";

  if (isToolsHost || isToolsPath || isMyLifePath) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={cn(
            "pointer-events-none fixed inset-0 z-[60] flex items-end justify-center px-4 pb-6 sm:items-end sm:justify-end sm:px-6",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Cookieの利用について"
            className="pointer-events-auto w-full max-w-lg rounded-3xl border border-border/70 bg-background/90 p-5 shadow-2xl backdrop-blur"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Cookieの利用について</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  当サイトでは、利便性向上と利用状況の把握のためにCookieを使用する場合があります。
                  詳しくはプライバシーポリシーをご確認ください。
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                プライバシーポリシーを見る
              </Link>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => updateConsent("declined")}
                >
                  同意しない
                </Button>
                <Button
                  type="button"
                  className="rounded-xl"
                  onClick={() => updateConsent("accepted")}
                >
                  同意する
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
