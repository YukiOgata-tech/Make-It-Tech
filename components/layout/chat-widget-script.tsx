"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ChatWidgetScript() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const hostname =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  const isMakeItTechSubdomain =
    hostname.endsWith(".make-it-tech.com") && hostname !== "make-it-tech.com";
  const isSubRoute = pathname.startsWith("/sub/");

  if (isMakeItTechSubdomain || isSubRoute) {
    return null;
  }

  return (
    <Script
      src="https://knotic.make-it-tech.com/widget.js"
      data-bot-id="bot_f3d4b0cc1387"
      data-widget-token="knotic_wgt_Uxx07R5paLS_46Qyiig4T5OK"
      strategy="lazyOnload"
    />
  );
}
