import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { BlogEditor } from "@/components/admin/blog-editor";

export const metadata: Metadata = {
  title: "ブログ 編集",
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
  if (value && typeof value === "object") {
    const maybeSeconds = (value as { seconds?: unknown; _seconds?: unknown }).seconds;
    const maybeAltSeconds = (value as { _seconds?: unknown })._seconds;
    const seconds =
      typeof maybeSeconds === "number"
        ? maybeSeconds
        : typeof maybeAltSeconds === "number"
          ? maybeAltSeconds
          : null;
    if (seconds !== null) {
      return new Date(seconds * 1000).toISOString();
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return undefined;
}

export default async function AdminBlogDetailPage({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const resolvedParams = await params;
  const id = resolvedParams?.id ?? "";
  if (!id) return notFound();

  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore.collection("blogPosts").doc(id).get();
  if (!snapshot.exists) return notFound();

  const data = snapshot.data() ?? {};
  const coverImage = (data.coverImage ?? {}) as {
    url?: string;
    alt?: string;
    path?: string;
  };
  const linkLabels = Array.isArray(data.linkLabels)
    ? data.linkLabels.map((item: { url?: unknown; label?: unknown }) => ({
        url: String(item?.url ?? ""),
        label: String(item?.label ?? ""),
      }))
    : [];

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <BlogEditor
        id={snapshot.id}
        initial={{
          title: String(data.title ?? ""),
          slug: String(data.slug ?? ""),
          summary: String(data.summary ?? ""),
          content: String(data.content ?? ""),
          category: data.category ?? "",
          status: data.status ?? "draft",
          tags: Array.isArray(data.tags)
            ? data.tags.map((tag: unknown) => String(tag)).filter(Boolean)
            : [],
          linkLabels,
          publishedAt: toIso(data.publishedAt),
          coverImageUrl: coverImage.url ?? "",
          coverImageAlt: coverImage.alt ?? "",
          coverImagePath: coverImage.path ?? "",
        }}
      />
    </div>
  );
}
