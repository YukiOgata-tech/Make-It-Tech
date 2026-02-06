import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { blogCategories, blogStatuses } from "@/lib/blog";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(160),
  summary: z.string().max(1200).optional(),
  content: z.string().max(60000).optional(),
  category: z.enum(blogCategories.map((c) => c.value) as [string, ...string[]]).optional(),
  tags: z.array(z.string().max(30)).optional(),
  status: z.enum(blogStatuses.map((s) => s.value) as [string, ...string[]]),
  publishedAt: z.string().nullable().optional(),
  coverImage: z
    .object({
      url: z.string().url(),
      alt: z.string().max(140).optional().nullable(),
      path: z.string().max(300).optional().nullable(),
    })
    .nullable()
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
  return `blog-${stamp}-${random}`;
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
  return plain.slice(0, 200);
}

export async function POST(request: Request) {
  await requireAdmin();

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
  const slug = normalizeSlug(payload.slug);

  const existing = await firestore
    .collection("blogPosts")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (!existing.empty) {
    return Response.json({ error: "同じスラッグが既に存在します。" }, { status: 400 });
  }

  const now = Timestamp.now();
  const summary = buildSummary(payload.summary, payload.content);
  let publishedAt: Timestamp | undefined;
  if (payload.status === "published") {
    const date = new Date(payload.publishedAt ?? new Date().toISOString());
    if (Number.isNaN(date.getTime())) {
      return Response.json({ error: "公開日時が不正です。" }, { status: 400 });
    }
    publishedAt = Timestamp.fromDate(date);
  }

  const doc = {
    title: payload.title.trim(),
    slug,
    summary,
    content: payload.content?.trim() ?? "",
    category: payload.category ?? null,
    tags: payload.tags?.length ? payload.tags : [],
    status: payload.status,
    ...(publishedAt ? { publishedAt } : {}),
    ...(payload.coverImage?.url
      ? {
          coverImage: {
            url: payload.coverImage.url,
            alt: payload.coverImage.alt ?? "",
            path: payload.coverImage.path ?? "",
          },
        }
      : {}),
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await firestore.collection("blogPosts").add(doc);

  revalidateTag("public-blog", { expire: 0 });
  revalidateTag("admin-blog", { expire: 0 });

  return Response.json({ ok: true, id: docRef.id });
}
