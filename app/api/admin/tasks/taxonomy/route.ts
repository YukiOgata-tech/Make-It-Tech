import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/origin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { taxonomyInputSchema } from "@/lib/tasks/validation";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!isAllowedSameOriginRequest(request)) return Response.json({error:"不正な送信元です。"},{status:403});
  const session = await requireAdmin();
  let payload: unknown;
  try { payload = await request.json(); }
  catch { return Response.json({error:"JSON形式の入力が必要です。"},{status:400}); }
  const parsed = taxonomyInputSchema.safeParse(payload);
  if (!parsed.success) return Response.json({error:parsed.error.issues[0]?.message ?? "入力を確認してください。"},{status:400});
  const x = parsed.data;
  const db = await createSupabaseServerClient();
  const result = x.kind === "business"
    ? await db.from("mit_task_businesses")
        .insert({ entity_id:session.entityId, name:x.name, color:x.color }).select("id").single()
    : x.kind === "department"
    ? await db.from("mit_task_departments")
        .insert({ entity_id:session.entityId, business_id:x.businessId, name:x.name }).select("id").single()
    : await db.from("mit_task_categories")
        .insert({ entity_id:session.entityId, name:x.name, color:x.color }).select("id").single();
  const { data,error } = result;
  if (error) return Response.json({error:error.code === "23505" ? "同じ名称がすでに登録されています。" : error.message},{status:400});
  revalidatePath("/sub/admin-console/tasks");
  return Response.json({id:data.id},{status:201});
}
