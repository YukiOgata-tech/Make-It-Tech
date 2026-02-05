import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { AnnouncementEditor } from "@/components/admin/announcement-editor";

export const metadata: Metadata = {
  title: "お知らせ 新規作成",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminNewsNewPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <AnnouncementEditor />
    </div>
  );
}
