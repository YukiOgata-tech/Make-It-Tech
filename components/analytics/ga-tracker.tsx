"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

type ConsentState = "accepted" | "declined" | "unset";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const COOKIE_NAME = "mit_cookie_consent";
const CONSENT_EVENT = "mit-cookie-consent-updated";

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
}

function getConsentState(): ConsentState {
  const value = getCookieValue(COOKIE_NAME);
  if (value === "accepted" || value === "declined") return value;
  return "unset";
}

function shouldTrackPath(pathname: string) {
  if (pathname.startsWith("/sub/admin-console")) return false;
  if (pathname.startsWith("/sub/tools")) return false;
  return true;
}

export function GaTracker() {
  const measurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-VED2GRW1C8";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<ConsentState>("unset");

  useEffect(() => {
    const syncConsent = () => setConsent(getConsentState());
    syncConsent();
    window.addEventListener(CONSENT_EVENT, syncConsent);
    return () => {
      window.removeEventListener(CONSENT_EVENT, syncConsent);
    };
  }, []);

  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (consent !== "accepted") return;
    if (!shouldTrackPath(pathname)) return;
    if (typeof window === "undefined") return;
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
  }, [consent, pathname, currentPath]);

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
