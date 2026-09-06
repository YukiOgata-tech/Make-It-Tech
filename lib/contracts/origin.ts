export function isAllowedSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const requestUrl = new URL(request.url);
  try {
    const originUrl = new URL(origin);
    if (originUrl.origin === requestUrl.origin) return true;
    if (process.env.NODE_ENV !== "production" && originUrl.hostname === "localhost") return true;
  } catch {
    return false;
  }
  return false;
}
