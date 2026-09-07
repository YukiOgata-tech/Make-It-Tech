import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createContractInputRequest } from "@/lib/contracts/input-requests.server";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { createContractInputRequestSchema } from "@/lib/contracts/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAllowedSameOriginRequest(request)) {
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  }
  const session = await requireAdmin();
  const parsed = createContractInputRequestSchema.safeParse(
    await request.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return Response.json({ error: "入力内容を確認してください。" }, { status: 400 });
  }
  try {
    const result = await createContractInputRequest(parsed.data, {
      uid: session.uid,
      email: session.email,
    });
    revalidatePath("/sub/admin-console/contracts");
    return Response.json(
      { ok: true, ...result },
      {
        status: 201,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "入力依頼を送信できませんでした。" },
      { status: 502 }
    );
  }
}
