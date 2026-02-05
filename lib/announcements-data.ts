import { unstable_cache } from "next/cache";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import type { AnnouncementCategory, AnnouncementStatus } from "@/lib/announcements";

export type AnnouncementCover = {
  url?: string;
  alt?: string;
  path?: string;
};

export type AnnouncementLink = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
};

export type AnnouncementRecord = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  coverImage?: AnnouncementCover;
  links?: AnnouncementLink[];
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
  return undefined;
}

export function normalizeAnnouncementDoc(
  doc: FirebaseFirestore.DocumentSnapshot
): AnnouncementRecord {
  const data = doc.data() ?? {};
  const coverImage = (data.coverImage ?? {}) as AnnouncementCover;
  const linksRaw = Array.isArray(data.links) ? data.links : [];
  const links = linksRaw
    .map((item) => ({
      url: String(item?.url ?? ""),
      title: typeof item?.title === "string" ? item.title : undefined,
      description: typeof item?.description === "string" ? item.description : undefined,
      image: typeof item?.image === "string" ? item.image : undefined,
    }))
    .filter((item) => item.url.length > 0);

  return {
    id: doc.id,
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    summary: typeof data.summary === "string" ? data.summary : undefined,
    content: typeof data.content === "string" ? data.content : undefined,
    category: (data.category ?? "news") as AnnouncementCategory,
    status: (data.status ?? "draft") as AnnouncementStatus,
    coverImage: coverImage?.url ? coverImage : undefined,
    links: links.length > 0 ? links : undefined,
    publishedAt: toDate(data.publishedAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

const getLatestAnnouncements = unstable_cache(
  async () => {
    const { firestore } = getFirebaseAdmin();
    const now = new Date();
    const snapshot = await firestore
      .collection("announcements")
      .where("publishedAt", "<=", now)
      .orderBy("publishedAt", "desc")
      .limit(3)
      .get();

    return snapshot.docs.map((doc) => normalizeAnnouncementDoc(doc));
  },
  ["public-announcements-latest"],
  { revalidate: false, tags: ["public-announcements"] }
);

const getAnnouncementList = unstable_cache(
  async () => {
    const { firestore } = getFirebaseAdmin();
    const now = new Date();
    const snapshot = await firestore
      .collection("announcements")
      .where("publishedAt", "<=", now)
      .orderBy("publishedAt", "desc")
      .limit(100)
      .get();

    return snapshot.docs.map((doc) => normalizeAnnouncementDoc(doc));
  },
  ["public-announcements-list"],
  { revalidate: false, tags: ["public-announcements"] }
);

export async function fetchLatestAnnouncements() {
  return getLatestAnnouncements();
}

export async function fetchAnnouncementList() {
  return getAnnouncementList();
}

export async function fetchAnnouncementBySlug(slug: string) {
  const getCached = unstable_cache(
    async () => {
      const { firestore } = getFirebaseAdmin();
      const snapshot = await firestore
        .collection("announcements")
        .where("slug", "==", slug)
        .limit(1)
        .get();

      const doc = snapshot.docs[0];
      if (!doc) return null;
      return normalizeAnnouncementDoc(doc);
    },
    ["public-announcement", slug],
    { revalidate: false, tags: ["public-announcements", `public-announcement:${slug}`] }
  );

  const record = await getCached();
  if (!record) return null;
  if (!record.publishedAt) return null;
  if (record.publishedAt.getTime() > Date.now()) return null;
  return record;
}
