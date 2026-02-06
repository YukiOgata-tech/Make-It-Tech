import { unstable_cache } from "next/cache";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import type { BlogCategory, BlogStatus } from "@/lib/blog";

export type BlogCover = {
  url?: string;
  alt?: string;
  path?: string;
};

export type BlogRecord = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  category?: BlogCategory;
  status: BlogStatus;
  tags?: string[];
  coverImage?: BlogCover;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

function toDate(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) {
    return value;
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
      return new Date(seconds * 1000);
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return undefined;
}

export function normalizeBlogDoc(
  doc: FirebaseFirestore.DocumentSnapshot
): BlogRecord {
  const data = doc.data() ?? {};
  const coverRaw = data.coverImage ?? data.coverImageUrl;
  const cover =
    typeof coverRaw === "string"
      ? { url: coverRaw }
      : (coverRaw ?? {}) as BlogCover;
  const coverUrl = typeof cover.url === "string" ? cover.url : "";
  const coverAlt = typeof cover.alt === "string" ? cover.alt : undefined;
  const coverPath = typeof cover.path === "string" ? cover.path : undefined;
  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag: unknown) => String(tag)).filter(Boolean)
    : [];

  return {
    id: doc.id,
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    summary: typeof data.summary === "string" ? data.summary : undefined,
    content: typeof data.content === "string" ? data.content : undefined,
    category: typeof data.category === "string" ? (data.category as BlogCategory) : undefined,
    status: (data.status ?? "draft") as BlogStatus,
    tags: tags.length ? tags : undefined,
    coverImage: coverUrl
      ? {
          url: coverUrl,
          alt: coverAlt,
          path: coverPath,
        }
      : undefined,
    publishedAt: toDate(data.publishedAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

const getBlogList = unstable_cache(
  async () => {
    const { firestore } = getFirebaseAdmin();
    const now = new Date();
    const snapshot = await firestore
      .collection("blogPosts")
      .where("publishedAt", "<=", now)
      .orderBy("publishedAt", "desc")
      .limit(200)
      .get();

    return snapshot.docs.map((doc) => normalizeBlogDoc(doc));
  },
  ["public-blog-list"],
  { revalidate: false, tags: ["public-blog"] }
);

const getBlogBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      const { firestore } = getFirebaseAdmin();
      const snapshot = await firestore
        .collection("blogPosts")
        .where("slug", "==", slug)
        .limit(1)
        .get();
      const doc = snapshot.docs[0];
      if (!doc) return null;
      return normalizeBlogDoc(doc);
    },
    ["public-blog", slug],
    { revalidate: false, tags: ["public-blog", `public-blog:${slug}`] }
  )();

export async function fetchBlogList() {
  if (process.env.NODE_ENV !== "production") {
    const { firestore } = getFirebaseAdmin();
    const snapshot = await firestore
      .collection("blogPosts")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    return snapshot.docs.map((doc) => normalizeBlogDoc(doc));
  }
  return getBlogList();
}

export async function fetchBlogBySlug(slug: string) {
  if (!slug) return null;
  const record =
    process.env.NODE_ENV !== "production"
      ? await (async () => {
          const { firestore } = getFirebaseAdmin();
          const snapshot = await firestore
            .collection("blogPosts")
            .where("slug", "==", slug)
            .limit(1)
            .get();
          const doc = snapshot.docs[0];
          if (!doc) return null;
          return normalizeBlogDoc(doc);
        })()
      : await getBlogBySlug(slug);
  if (!record) return null;
  if (process.env.NODE_ENV === "production") {
    if (!record.publishedAt) return null;
    if (record.publishedAt.getTime() > Date.now()) return null;
  }
  return record;
}

export async function fetchBlogSlugs() {
  const { firestore } = getFirebaseAdmin();
  const now = new Date();
  const snapshot = await firestore
    .collection("blogPosts")
    .where("publishedAt", "<=", now)
    .orderBy("publishedAt", "desc")
    .limit(500)
    .get();
  return snapshot.docs.map((doc) => String(doc.data().slug ?? "")).filter(Boolean);
}
