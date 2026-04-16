import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { EmailComposer } from "@/components/admin/email-composer";

export const metadata: Metadata = {
  title: "メール送信",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminCreateEmailPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <EmailComposer />
    </div>
  );
}
