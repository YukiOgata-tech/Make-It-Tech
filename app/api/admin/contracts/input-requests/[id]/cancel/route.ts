import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { cancelContractInputRequest } from "@/lib/contracts/input-requests.server";

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
  try {
    await cancelContractInputRequest(id, {
      uid: session.uid,
      email: session.email,
    });
    revalidatePath("/sub/admin-console/contracts");
    revalidatePath(`/sub/admin-console/contracts/input-requests/${id}`);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "入力依頼を取り消せませんでした。" },
      { status: 409 }
    );
  }
}
