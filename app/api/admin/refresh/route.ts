import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionCookie,
} from "@/lib/admin-auth";

/**
 * 管理画面を開かずに再検証を叩けるようにするためのトークン認証。
 *
 * Firestore を直接書き換えたときは revalidate が走らないので、CLI から
 * この経路で再検証する。ADMIN_REVALIDATE_TOKEN が未設定なら無効のままで、
 * 従来どおり管理者セッションだけが通る。
 */
function hasValidRevalidateToken(request: Request) {
  const expected = process.env.ADMIN_REVALIDATE_TOKEN ?? "";
  if (!expected) return false;
  const provided = request.headers.get("x-revalidate-token") ?? "";
  if (provided.length !== expected.length) return false;
  // 長さが同じときだけ突き合わせる（早期 return でのタイミング差を減らす）。
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: Request) {
  if (!hasValidRevalidateToken(request)) {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
    const session = await verifyAdminSessionCookie(cookie);
    if (!session) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const payload = await request.json().catch(() => ({}));
  const id = typeof payload?.id === "string" ? payload.id : "";

  revalidateTag("admin-intake-list", { expire: 0 });
  revalidateTag("admin-intake-detail", { expire: 0 });
  if (id) {
    revalidateTag(`admin-intake-detail:${id}`, { expire: 0 });
  }
  revalidateTag("admin-announcements", { expire: 0 });
  revalidateTag("public-announcements", { expire: 0 });
  revalidateTag("admin-blog", { expire: 0 });
  revalidateTag("public-blog", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/news/[slug]", "page");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
  revalidatePath("/atom.xml");

  return Response.json({ ok: true });
}
