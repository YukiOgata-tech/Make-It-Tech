import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { normalizeLinkLabelItems } from "@/lib/link-labels";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  summary: z.string().max(800).optional(),
  content: z.string().max(20000).optional(),
  category: z.enum(["news", "media", "case", "other"]),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().nullable().optional(),
  linkLabels: z
    .array(
      z.object({
        url: z.string().url(),
        label: z.string().min(1).max(120),
      })
    )
    .optional(),
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
    .collection("announcements")
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
    category: payload.category,
    status: payload.status,
    linkLabels: normalizeLinkLabelItems(payload.linkLabels),
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
    ...(payload.links?.length
      ? {
          links: payload.links.map((link) => ({
            url: link.url,
            title: link.title ?? "",
            description: link.description ?? "",
            image: link.image ?? "",
          })),
        }
      : {}),
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await firestore.collection("announcements").add(doc);

  revalidateTag("public-announcements", { expire: 0 });
  revalidateTag("admin-announcements", { expire: 0 });

  return Response.json({ ok: true, id: docRef.id });
}
