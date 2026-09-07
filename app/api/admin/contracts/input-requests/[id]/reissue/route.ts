import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { reissueContractInputRequest } from "@/lib/contracts/input-requests.server";

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
    const result = await reissueContractInputRequest(id, {
      uid: session.uid,
      email: session.email,
    });
    revalidatePath(`/sub/admin-console/contracts/input-requests/${id}`);
    return Response.json(
      { ok: true, ...result },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "入力URLを再発行できませんでした。" },
      { status: 409 }
    );
  }
}
