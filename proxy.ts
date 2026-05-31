import { NextResponse, type NextRequest } from "next/server";

const hostRouteMap: Record<string, string> = {
  "lp.make-it-tech.com": "/sub/lp",
  "tools.make-it-tech.com": "/sub/tools",
};
const adminConsolePrefix = "admin-console.";

function normalizeHost(host: string) {
  return host.toLowerCase().split(":")[0];
}

export function proxy(request: NextRequest) {
  const host = normalizeHost(request.headers.get("host") ?? "");
  const { pathname } = request.nextUrl;

  const targetBase = host.startsWith(adminConsolePrefix)
    ? "/sub/admin-console"
    : hostRouteMap[host];

  if (!targetBase) {
    return NextResponse.next();
  }

  if (
    (pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      pathname === "/ads.txt") &&
    targetBase !== "/sub/tools"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith(targetBase)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? targetBase : `${targetBase}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
