import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminPage } from "@/components/admin/admin-page";
import { TaskWorkspace } from "@/components/admin/task-workspace";
import { getTaskWorkspace } from "@/lib/tasks/server";

export const metadata: Metadata = { title:"タスク管理",robots:{index:false,follow:false} };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function TasksPage() {
  const session = await requireAdmin();
  const workspace = await getTaskWorkspace(session);
  return <AdminPage><TaskWorkspace {...workspace} /></AdminPage>;
}
