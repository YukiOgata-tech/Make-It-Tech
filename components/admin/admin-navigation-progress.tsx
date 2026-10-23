"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

export function AdminNavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentRoute = `${pathname}${search ? `?${search}` : ""}`;
  const [pending, setPending] = React.useState<{ from: string } | null>(null);
  const active = pending?.from === currentRoute;

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("download") || (link.getAttribute("target") && link.getAttribute("target") !== "_self")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname.startsWith("/api/")) return;
      if (`${destination.pathname}${destination.search}` === `${window.location.pathname}${window.location.search}`) return;

      setPending({ from: currentRoute });
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (form instanceof HTMLFormElement && form.matches("[data-admin-navigation-form]")) {
        setPending({ from: currentRoute });
      }
    };

    const handlePopState = () => {
      setPending({ from: currentRoute });
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentRoute]);

  React.useEffect(() => {
    if (!pending) return;
    // Failed or cancelled navigation must not leave the indicator visible.
    const timeout = window.setTimeout(() => setPending(null), 15000);
    return () => window.clearTimeout(timeout);
  }, [pending]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60]" role="status" aria-live="polite">
      <div className="admin-navigation-progress h-0.5 overflow-hidden bg-primary/15" aria-hidden="true" />
      <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-lg sm:bottom-6 sm:right-6">
        <Loader2 className="size-3.5 text-primary motion-safe:animate-spin" aria-hidden="true" />
        ページを読み込み中…
      </div>
    </div>
  );
}
