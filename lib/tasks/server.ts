import "server-only";

import type { MitSession } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TaskBusiness = { id: string; name: string; color: string; sort_order: number; is_active: boolean };
export type TaskDepartment = { id: string; business_id: string; name: string; sort_order: number; is_active: boolean };
export type TaskCategory = { id: string; name: string; color: string; sort_order: number; is_active: boolean };
export type TaskMember = { user_id: string; display_name: string; email: string; role: string };
export type TaskRecord = {
  id: string; title: string; description: string;
  business_id: string | null; department_id: string | null; assignee_id: string | null;
  status: "todo" | "in_progress" | "waiting" | "done" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  due_date: string | null; due_time: string | null; due_timezone: string;
  completed_at: string | null; created_at: string; updated_at: string;
  category_ids: string[];
};

const taskSelect = "id,title,description,business_id,department_id,assignee_id,status,priority,due_date,due_time,due_timezone,completed_at,created_at,updated_at";

export async function getTaskWorkspace(session: MitSession) {
  const db = await createSupabaseServerClient();
  const [businesses, departments, categories, tasks, members] = await Promise.all([
    db.from("mit_task_businesses").select("id,name,color,sort_order,is_active").eq("entity_id",session.entityId).order("sort_order").order("name"),
    db.from("mit_task_departments").select("id,business_id,name,sort_order,is_active").eq("entity_id",session.entityId).order("sort_order").order("name"),
    db.from("mit_task_categories").select("id,name,color,sort_order,is_active").eq("entity_id",session.entityId).order("sort_order").order("name"),
    db.from("mit_tasks").select(taskSelect).eq("entity_id",session.entityId).order("created_at",{ascending:false}).limit(1000),
    db.rpc("get_mit_task_members"),
  ]);
  for (const result of [businesses, departments, categories, tasks, members]) {
    if (result.error) throw new Error(result.error.message);
  }
  const records = (tasks.data ?? []) as unknown as TaskRecord[];
  const links: { task_id: string; category_id: string }[] = [];
  for (let offset = 0; offset < records.length; offset += 100) {
    const ids = records.slice(offset, offset + 100).map(t => t.id);
    const { data, error } = await db.from("mit_task_category_links")
      .select("task_id,category_id").eq("entity_id",session.entityId).in("task_id",ids);
    if (error) throw new Error(error.message);
    links.push(...(data ?? []));
  }
  const byTask = new Map<string,string[]>();
  for (const link of links) byTask.set(link.task_id,[...(byTask.get(link.task_id) ?? []),link.category_id]);
  return {
    businesses:(businesses.data ?? []) as TaskBusiness[],
    departments:(departments.data ?? []) as TaskDepartment[],
    categories:(categories.data ?? []) as TaskCategory[],
    members:(members.data ?? []) as TaskMember[],
    tasks:records.map(task => ({...task,category_ids:byTask.get(task.id) ?? []})),
  };
}
