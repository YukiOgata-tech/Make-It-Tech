import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { archiveExpense } from "@/lib/expenses/server";

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
    await archiveExpense(session, id);
    revalidatePath("/sub/admin-console/expenses");
    revalidatePath("/sub/admin-console/expenses/stats");
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "経費をアーカイブできませんでした。" },
      { status: 400 }
    );
  }
}
