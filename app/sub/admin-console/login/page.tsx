import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin/admin-login";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "管理者ログイン",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/");

  return <AdminLogin />;
}
