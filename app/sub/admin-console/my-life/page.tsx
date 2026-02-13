import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { MyLifeEditor } from "@/components/admin/my-life-editor";
import { fetchMyLifeConfig } from "@/lib/my-life-data";

export const metadata: Metadata = {
  title: "マンションのやつ 設定",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminMyLifePage() {
  await requireAdmin();
  const config = await fetchMyLifeConfig({ bypassCache: true });

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <MyLifeEditor
        initial={{
          message: config.message,
          imageUrl: config.imageUrl,
          imagePath: config.imagePath,
        }}
      />
    </div>
  );
}
