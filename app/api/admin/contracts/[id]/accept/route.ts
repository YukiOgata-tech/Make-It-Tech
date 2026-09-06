import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { acceptContractForMit } from "@/lib/contracts/server";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";

export const runtime = "nodejs";

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
    await acceptContractForMit(id, { uid: session.uid, email: session.email });
    revalidatePath("/sub/admin-console/contracts");
    revalidatePath(`/sub/admin-console/contracts/${id}`);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "契約を確定できませんでした。" },
      { status: 409 }
    );
  }
}
