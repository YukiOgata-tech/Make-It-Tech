import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { AnnouncementEditor } from "@/components/admin/announcement-editor";

export const metadata: Metadata = {
  title: "お知らせ 編集",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toIso(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return undefined;
}

export default async function AdminNewsDetailPage({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const resolvedParams = await params;
  const id = resolvedParams?.id ?? "";
  if (!id) return notFound();

  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore.collection("announcements").doc(id).get();
  if (!snapshot.exists) return notFound();

  const data = snapshot.data() ?? {};
  const coverImage = (data.coverImage ?? {}) as {
    url?: string;
    alt?: string;
    path?: string;
  };
  const links = Array.isArray(data.links)
    ? data.links.map((item: any) => ({
        url: String(item?.url ?? ""),
        title: typeof item?.title === "string" ? item.title : "",
        description: typeof item?.description === "string" ? item.description : "",
        image: typeof item?.image === "string" ? item.image : "",
      }))
    : [];

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <AnnouncementEditor
        id={snapshot.id}
        initial={{
          title: String(data.title ?? ""),
          slug: String(data.slug ?? ""),
          summary: String(data.summary ?? ""),
          content: String(data.content ?? ""),
          category: data.category ?? "news",
          status: data.status ?? "draft",
          publishedAt: toIso(data.publishedAt),
          coverImageUrl: coverImage.url ?? "",
          coverImageAlt: coverImage.alt ?? "",
          coverImagePath: coverImage.path ?? "",
          links,
        }}
      />
    </div>
  );
}
