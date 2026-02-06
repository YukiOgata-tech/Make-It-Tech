import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionCookie,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  const session = await verifyAdminSessionCookie(cookie);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
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

  return Response.json({ ok: true });
}
