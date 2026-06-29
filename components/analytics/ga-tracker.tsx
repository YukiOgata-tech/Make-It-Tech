"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

type ConsentState = "accepted" | "declined" | "unset";
type ToolsConsentState = "all" | "necessary" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const COOKIE_NAME = "mit_cookie_consent";
const CONSENT_EVENT = "mit-cookie-consent-updated";
const TOOLS_CONSENT_KEY = "devtools_cookie_consent";
const TOOLS_CONSENT_VERSION = "1.0";

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
}

function isToolsContext(pathname: string) {
  if (pathname.startsWith("/sub/tools")) return true;
  if (typeof window !== "undefined" && window.location.hostname.startsWith("tools.")) return true;
  return false;
}

function getToolsConsentState(): ConsentState {
  if (typeof window === "undefined") return "unset";
  const stored = window.localStorage.getItem(TOOLS_CONSENT_KEY);
  if (!stored) return "unset";
  try {
    const parsed = JSON.parse(stored) as {
      type?: ToolsConsentState;
      version?: string;
    };
    if (parsed.version !== TOOLS_CONSENT_VERSION) return "unset";
    if (parsed.type === "all") return "accepted";
    if (parsed.type === "necessary") return "declined";
  } catch {
    return "unset";
  }
  return "unset";
}

function getConsentState(pathname: string): ConsentState {
  if (isToolsContext(pathname)) return getToolsConsentState();
  const value = getCookieValue(COOKIE_NAME);
  if (value === "accepted" || value === "declined") return value;
  return "unset";
}

function shouldTrackPath(pathname: string) {
  if (pathname.startsWith("/sub/admin-console")) return false;
  if (pathname.startsWith("/sub/lp")) return false;
  return true;
}

export function GaTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<ConsentState>("unset");

  const measurementId = useMemo(() => {
    const defaultId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-VED2GRW1C8";
    const toolsId = process.env.NEXT_PUBLIC_TOOLS_GA_MEASUREMENT_ID ?? "G-R9QSFM08R7";
    if (pathname.startsWith("/sub/tools")) return toolsId;
    if (typeof window !== "undefined" && window.location.hostname.startsWith("tools.")) {
      return toolsId;
    }
    return defaultId;
  }, [pathname]);

  useEffect(() => {
    const syncConsent = () => setConsent(getConsentState(pathname));
    syncConsent();
    window.addEventListener(CONSENT_EVENT, syncConsent);
    return () => {
      window.removeEventListener(CONSENT_EVENT, syncConsent);
    };
  }, [pathname]);

  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (consent !== "accepted") return;
    if (!shouldTrackPath(pathname)) return;
    if (typeof window === "undefined") return;
    if (window.location.hostname.startsWith("admin-console.")) return;
    if (window.location.hostname.startsWith("lp.")) return;
    const sendPageView = () => {
      if (typeof window.gtag !== "function") return false;
      window.gtag("event", "page_view", {
        page_title: document.title,
        page_path: currentPath,
        page_location: window.location.href,
      });
      return true;
    };

    if (sendPageView()) return;
    const timer = window.setTimeout(() => {
      sendPageView();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [consent, pathname, currentPath, measurementId]);

  if (consent !== "accepted") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){window.dataLayer.push(arguments);};
          window.gtag('js', new Date());
          window.gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
