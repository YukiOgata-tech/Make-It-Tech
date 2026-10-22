import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { parseExpenseFormData } from "@/lib/expenses/schemas";
import { updateExpense } from "@/lib/expenses/server";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAllowedSameOriginRequest(request)) {
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  }
  const session = await requireAdmin();
  const { id } = await params;
  const formData = await request.formData();
  const parsed = parseExpenseFormData(formData);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
      { status: 400 }
    );
  }
  const files = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  try {
    const result = await updateExpense(session, id, parsed.data, files);
    revalidatePath("/sub/admin-console/expenses");
    revalidatePath(`/sub/admin-console/expenses/${id}`);
    revalidatePath("/sub/admin-console/expenses/stats");
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "経費を更新できませんでした。" },
      { status: 400 }
    );
  }
}
