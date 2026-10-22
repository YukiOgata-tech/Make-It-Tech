import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { parseExpenseFormData } from "@/lib/expenses/schemas";
import { createExpense } from "@/lib/expenses/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAllowedSameOriginRequest(request)) {
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  }
  const session = await requireAdmin();
  const formData = await request.formData();
  const parsed = parseExpenseFormData(formData);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
      { status: 400 }
    );
  }
  const files = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  const hasManualData = Boolean(
    parsed.data.transactionDate || parsed.data.merchantName || parsed.data.amountYen || parsed.data.description
  );
  if (!files.length && !hasManualData) {
    return Response.json({ error: "領収書画像または経費情報を入力してください。" }, { status: 400 });
  }

  try {
    const result = await createExpense(session, parsed.data, files);
    revalidatePath("/sub/admin-console/expenses");
    revalidatePath("/sub/admin-console/expenses/stats");
    return Response.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "経費を登録できませんでした。" },
      { status: 400 }
    );
  }
}
