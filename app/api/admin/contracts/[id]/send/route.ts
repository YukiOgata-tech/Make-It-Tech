import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { sendContractSchema } from "@/lib/contracts/schemas";
import { sendContract } from "@/lib/contracts/server";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAllowedSameOriginRequest(request)) {
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  }
  const session = await requireAdmin();
  const { id } = await params;
  const parsed = sendContractSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json({ error: "署名期限を確認してください。" }, { status: 400 });
  }
  try {
    const result = await sendContract(id, parsed.data.expiresInDays, {
      uid: session.uid,
      email: session.email,
    });
    revalidatePath("/sub/admin-console/contracts");
    revalidatePath(`/sub/admin-console/contracts/${id}`);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "署名依頼を送信できませんでした。" },
      { status: 502 }
    );
  }
}
