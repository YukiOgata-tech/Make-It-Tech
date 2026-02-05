import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  summary: z.string().max(800).optional(),
  content: z.string().max(20000).optional(),
  category: z.enum(["news", "media", "case", "other"]),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().nullable().optional(),
  coverImage: z
    .object({
      url: z.string().url(),
      alt: z.string().max(120).optional().nullable(),
      path: z.string().max(300).optional().nullable(),
    })
    .nullable()
    .optional(),
  links: z
    .array(
      z.object({
        url: z.string().url(),
        title: z.string().max(200).optional(),
        description: z.string().max(600).optional(),
        image: z.union([z.string().url(), z.literal("")]).optional(),
      })
    )
    .optional(),
});

type Payload = z.infer<typeof schema>;

function normalizeSlug(value: string) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base.length > 0) return base;
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6);
  return `news-${stamp}-${random}`;
}

function stripMarkdown(value: string) {
  return value
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSummary(summary: string | undefined, content: string | undefined) {
  const trimmed = summary?.trim();
  if (trimmed) return trimmed;
  if (!content) return "";
  const plain = stripMarkdown(content);
  return plain.slice(0, 160);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const resolvedParams = await params;
  const id = resolvedParams?.id ?? "";
  if (!id) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  let payload: Payload;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return Response.json(
      { error: "Invalid payload.", details: error instanceof Error ? error.message : undefined },
      { status: 400 }
    );
  }

  const { firestore } = getFirebaseAdmin();
  const docRef = firestore.collection("announcements").doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const slug = normalizeSlug(payload.slug);
  const existing = await firestore
    .collection("announcements")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (!existing.empty && existing.docs[0].id !== id) {
    return Response.json({ error: "同じスラッグが既に存在します。" }, { status: 400 });
  }

  const summary = buildSummary(payload.summary, payload.content);
  const update: Record<string, unknown> = {
    title: payload.title.trim(),
    slug,
    summary,
    content: payload.content?.trim() ?? "",
    category: payload.category,
    status: payload.status,
    updatedAt: Timestamp.now(),
  };

  if (payload.status === "published") {
    const publishedAt = new Date(payload.publishedAt ?? new Date().toISOString());
    if (Number.isNaN(publishedAt.getTime())) {
      return Response.json({ error: "公開日時が不正です。" }, { status: 400 });
    }
    update.publishedAt = Timestamp.fromDate(publishedAt);
  } else {
    update.publishedAt = FieldValue.delete();
  }

  if (payload.coverImage?.url) {
    update.coverImage = {
      url: payload.coverImage.url,
      alt: payload.coverImage.alt ?? "",
      path: payload.coverImage.path ?? "",
    };
  } else {
    update.coverImage = FieldValue.delete();
  }

  if (payload.links?.length) {
    update.links = payload.links.map((link) => ({
      url: link.url,
      title: link.title ?? "",
      description: link.description ?? "",
      image: link.image ?? "",
    }));
  } else {
    update.links = FieldValue.delete();
  }

  await docRef.set(update, { merge: true });

  revalidateTag("public-announcements", { expire: 0 });
  revalidateTag("admin-announcements", { expire: 0 });

  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const resolvedParams = await params;
  const id = resolvedParams?.id ?? "";
  if (!id) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const { firestore } = getFirebaseAdmin();
  const docRef = firestore.collection("announcements").doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  await docRef.delete();

  revalidateTag("public-announcements", { expire: 0 });
  revalidateTag("admin-announcements", { expire: 0 });

  return Response.json({ ok: true });
}
