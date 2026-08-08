import { NextResponse, type NextRequest } from "next/server";
import { nfcSite } from "@/content/nfc/site";

const hostRouteMap: Record<string, string> = {
  "lp.make-it-tech.com": "/sub/lp",
  "tools.make-it-tech.com": "/sub/tools",
  [nfcSite.host]: nfcSite.basePath,
};
const adminConsolePrefix = "admin-console.";

/**
 * サブドメインが自前で持つサイトファイル。
 *
 * ここに登録したパスだけをサブドメイン配下へリライトし、それ以外は本体
 * （make-it-tech.com）のルートハンドラに素通しする。サブドメインが持っていない
 * ファイルまでリライトすると 404 になるため、ファイル単位で管理する。
 */
const siteFileRoutes: Record<string, ReadonlySet<string>> = {
  "/sub/tools": new Set(["/robots.txt", "/sitemap.xml", "/ads.txt"]),
  [nfcSite.basePath]: new Set(["/robots.txt", "/sitemap.xml"]),
};

const siteFilePaths = new Set(["/robots.txt", "/sitemap.xml", "/ads.txt"]);

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

  if (siteFilePaths.has(pathname) && !siteFileRoutes[targetBase]?.has(pathname)) {
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
