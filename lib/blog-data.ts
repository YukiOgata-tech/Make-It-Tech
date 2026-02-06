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

const mockBlogPosts: BlogRecord[] = [
  {
    id: "mock-blog-1",
    title: "業務改善の最初の一歩は“現状整理”から",
    slug: "mock-business-improvement",
    summary:
      "担当者の頭の中にある業務フローを見える化すると、改善余地が一気に分かります。",
    content: `## まずは現状を見える化する\n\n業務改善は「何を直すか」を決める前に、\n**いまの流れを整理すること**から始めると失敗しにくくなります。\n\n- どの作業に時間がかかっているか\n- どこで情報が止まっているか\n- 誰がどの判断をしているか\n\nこの3点だけでも書き出してみると、改善ポイントが自然に見えてきます。\n\n## 小さく改善して成果を作る\n\nいきなり全体最適を狙うより、\n「1つの作業を30%短縮する」など、\n**小さな成果**を先に作ると社内の理解も得やすいです。`,
    category: "improvement",
    status: "published",
    tags: ["業務改善", "現状整理", "BPR"],
    coverImage: {
      url: "/images/bg-design-01.png",
      alt: "業務改善のイメージ",
    },
    publishedAt: new Date("2026-02-01T09:00:00+09:00"),
    createdAt: new Date("2026-02-01T09:00:00+09:00"),
  },
  {
    id: "mock-blog-2",
    title: "自動化は“毎日10分”の削減から始める",
    slug: "mock-automation-start",
    summary:
      "繰り返し作業を見つけて、簡単な自動化から取り組むと成果が早く出ます。",
    content: `## 自動化の第一歩\n\nRPAやAPI連携など大きな施策より、\n「毎日やっている小さな作業」を見つけるのが先です。\n\n**例**\n- CSVの整形\n- 定型メールの送信\n- 日報の集計\n\n## まずは“10分短縮”を目標に\n\n短縮のインパクトを数字で示せると、\n次の改善提案が通りやすくなります。`,
    category: "automation",
    status: "published",
    tags: ["自動化", "RPA", "効率化"],
    coverImage: {
      url: "/images/bg-design-02.png",
      alt: "自動化のイメージ",
    },
    publishedAt: new Date("2026-01-28T10:30:00+09:00"),
    createdAt: new Date("2026-01-28T10:30:00+09:00"),
  },
  {
    id: "mock-blog-3",
    title: "補助金を使う前に整理すべき3つのこと",
    slug: "mock-subsidy-checklist",
    summary:
      "補助金は申請書より“目的の整理”が重要。失敗しないためのポイントを紹介します。",
    content: `## 補助金で失敗しないために\n\n申請書の書き方より、\n**何を実現したいか**を明確にすることが大切です。\n\n1. 目的（何を改善したいか）\n2. 対象（どの業務や部署か）\n3. 成果（何がどう良くなるか）\n\nこの3つが整理できれば、\n採択後の運用もスムーズになります。`,
    category: "subsidy",
    status: "published",
    tags: ["補助金", "DX", "申請準備"],
    coverImage: {
      url: "/images/bg-3-light.png",
      alt: "補助金のイメージ",
    },
    publishedAt: new Date("2026-01-24T15:00:00+09:00"),
    createdAt: new Date("2026-01-24T15:00:00+09:00"),
  },
];

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
    const records = snapshot.docs.map((doc) => normalizeBlogDoc(doc));
    return records.length > 0 ? records : mockBlogPosts;
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
  if (!record && process.env.NODE_ENV !== "production") {
    return mockBlogPosts.find((post) => post.slug === slug) ?? null;
  }
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
