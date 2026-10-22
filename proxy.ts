import { NextResponse, type NextRequest } from "next/server";
import { nfcSite } from "@/content/nfc/site";
import { signSite } from "@/content/sign/site";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

const hostRouteMap: Record<string, string> = {
  "lp.make-it-tech.com": "/sub/lp",
  "tools.make-it-tech.com": "/sub/tools",
  [nfcSite.host]: nfcSite.basePath,
  [signSite.host]: signSite.basePath,
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
  [signSite.basePath]: new Set(["/robots.txt", "/sitemap.xml"]),
};

const siteFilePaths = new Set(["/robots.txt", "/sitemap.xml", "/ads.txt"]);
const sharedPublicPathPrefixes = ["/images/"];

function normalizeHost(host: string) {
  return host.toLowerCase().split(":")[0];
}

function applyCookieUpdates(
  response: NextResponse,
  cookieUpdates: Awaited<ReturnType<typeof refreshSupabaseSession>>
) {
  cookieUpdates.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const host = normalizeHost(request.headers.get("host") ?? "");
  const { pathname } = request.nextUrl;
  const isAdminConsole = host.startsWith(adminConsolePrefix);
  const cookieUpdates = isAdminConsole
    ? await refreshSupabaseSession(request)
    : [];

  const targetBase = isAdminConsole
    ? "/sub/admin-console"
    : hostRouteMap[host];

  if (!targetBase) {
    return applyCookieUpdates(NextResponse.next({ request }), cookieUpdates);
  }

  // `public/images` is shared by the main site and every subdomain. Rewriting
  // these requests would turn `/images/...` into `/sub/*/images/...` and 404.
  if (sharedPublicPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return applyCookieUpdates(NextResponse.next({ request }), cookieUpdates);
  }

  if (siteFilePaths.has(pathname) && !siteFileRoutes[targetBase]?.has(pathname)) {
    return applyCookieUpdates(NextResponse.next({ request }), cookieUpdates);
  }

  if (pathname.startsWith(targetBase)) {
    return applyCookieUpdates(NextResponse.next({ request }), cookieUpdates);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? targetBase : `${targetBase}${pathname}`;
  return applyCookieUpdates(NextResponse.rewrite(url, { request }), cookieUpdates);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
