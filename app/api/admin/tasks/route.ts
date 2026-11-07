import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedSameOriginRequest } from "@/lib/contracts/origin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { taskInputSchema } from "@/lib/tasks/validation";

export const runtime = "nodejs";
const path = "/sub/admin-console/tasks";
export async function POST(request: Request) {
  if (!isAllowedSameOriginRequest(request)) return Response.json({error:"不正な送信元です。"},{status:403});
  const session = await requireAdmin();
  let payload: unknown;
  try { payload = await request.json(); }
  catch { return Response.json({error:"JSON形式の入力が必要です。"},{status:400}); }
  const parsed = taskInputSchema.safeParse(payload);
  if (!parsed.success) return Response.json({error:parsed.error.issues[0]?.message ?? "入力を確認してください。"},{status:400});
  const x = parsed.data;
  const db = await createSupabaseServerClient();
  const { data, error } = await db.rpc("mit_save_task",{
    p_entity_id:session.entityId, p_task_id:x.id, p_title:x.title,
    p_description:x.description, p_business_id:x.businessId,
    p_department_id:x.departmentId, p_assignee_id:x.assigneeId,
    p_status:x.status, p_priority:x.priority, p_due_date:x.dueDate,
    p_due_time:x.dueTime, p_category_ids:x.categoryIds,
  });
  if (error) return Response.json({error:error.message},{status:400});
  revalidatePath(path);
  return Response.json({id:data},{status:x.id ? 200 : 201});
}
