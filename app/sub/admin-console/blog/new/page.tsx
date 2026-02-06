import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { BlogEditor } from "@/components/admin/blog-editor";

export const metadata: Metadata = {
  title: "ブログ 新規作成",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminBlogNewPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <BlogEditor />
    </div>
  );
}
