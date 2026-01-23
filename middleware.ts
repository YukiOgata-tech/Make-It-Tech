import { NextResponse, type NextRequest } from "next/server";

const hostRouteMap: Record<string, string> = {
  "lp.make-it-tech.com": "/sub/lp",
  "admin.make-it-tech.com": "/sub/admin",
};

function normalizeHost(host: string) {
  return host.toLowerCase().split(":")[0];
}

export function middleware(request: NextRequest) {
  const host = normalizeHost(request.headers.get("host") ?? "");
  const targetBase = hostRouteMap[host];

  if (!targetBase) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith(targetBase)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? targetBase : `${targetBase}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
