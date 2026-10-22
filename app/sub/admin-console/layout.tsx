import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([getAdminSession(), cookies()]);

  if (!session) {
    return <div className="admin-app min-h-dvh bg-background text-foreground">{children}</div>;
  }

  const defaultSidebarOpen = cookieStore.get("admin_sidebar_state")?.value !== "false";

  return (
    <AdminShell session={session} defaultSidebarOpen={defaultSidebarOpen}>
      {children}
    </AdminShell>
  );
}
