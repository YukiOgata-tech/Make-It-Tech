import { AdminHeader } from "@/components/admin/admin-header";
import { AdminFooter } from "@/components/admin/admin-footer";

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AdminHeader />
      <main className="flex-1">{children}</main>
      <AdminFooter />
    </div>
  );
}
