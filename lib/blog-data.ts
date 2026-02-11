import { unstable_cache } from "next/cache";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import type { BlogCategory, BlogStatus } from "@/lib/blog";
import { normalizeLinkLabelItems, type LinkLabel } from "@/lib/link-labels";

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
  linkLabels?: LinkLabel[];
  coverImage?: BlogCover;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const mockBlogPosts: BlogRecord[] = [
  {
    id: "mock-blog-ui-guide",
    title: "ブログUI見本（H1/見出し/表/コード/画像の表示確認）",
    slug: "mock-blog-ui-guide",
    summary:
      "このダミー記事は、見出し・表・コード・画像サイズ・内部/外部リンクなどの表示確認用です。",
    content: `# H1: ここがH1見出し\n\nこの段落は**H1の下**に配置された本文です。ページタイトルは別に表示されるので、\nH1を使う場合は「本文内の大見出し」として使ってください。\n\n## H2: ここがH2見出し\n\n- 箇条書きの例\n- \`inline code\` の例\n- :sparkles: 絵文字の例\n\n### H3: ここがH3見出し\n\n1. 番号付きリスト\n2. 数値の流れ\n3. 小さな手順\n\n#### H4: ここがH4見出し\n\n> これは引用（blockquote）の見え方です。\n> 複数行でも読みやすく表示されます。\n\n---\n\n## H2: リンクの見え方\n\n- 内部リンク（同サイト）: [/services](/services)\n- 外部リンク: [https://example.com](https://example.com)\n\n## H2: 画像サイズ/配置の見え方\n\n![全幅中央のサンプル](/images/bg-design-01.png "preset:full-center")\n\n![中サイズ右寄せのサンプル](/images/bg-design-02.png "preset:md-right")\n\n![小サイズ左寄せのサンプル](/images/bg-3-light.png "preset:sm-left")\n\n## H2: 表（table）の見え方\n\n| 項目 | 内容 | メモ |\n| --- | --- | --- |\n| 目的 | UI確認 | 見やすさ重視 |\n| 対象 | ブログ本文 | 見出し/表/画像 |\n| 期限 | 任意 | いつでも更新 |\n\n## H2: コードブロックの見え方\n\n\`\`\`ts\nconst task = {\n  title: \"UIチェック\",\n  status: \"published\",\n  tags: [\"見出し\", \"表\", \"画像\"],\n};\n\nconsole.log(task);\n\`\`\`\n`,
    category: "improvement",
    status: "published",
    tags: ["UI確認", "ブログ", "Markdown"],
    coverImage: {
      url: "/images/bg-design-01.png",
      alt: "ブログUIのサンプル",
    },
    publishedAt: new Date("2026-02-07T09:00:00+09:00"),
    createdAt: new Date("2026-02-07T09:00:00+09:00"),
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
  const rawLinkLabels = Array.isArray(data.linkLabels)
    ? data.linkLabels.map((item: { url?: unknown; label?: unknown }) => ({
        url: String(item?.url ?? ""),
        label: String(item?.label ?? ""),
      }))
    : [];
  const linkLabels = normalizeLinkLabelItems(rawLinkLabels);

  return {
    id: doc.id,
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    summary: typeof data.summary === "string" ? data.summary : undefined,
    content: typeof data.content === "string" ? data.content : undefined,
    category: typeof data.category === "string" ? (data.category as BlogCategory) : undefined,
    status: (data.status ?? "draft") as BlogStatus,
    tags: tags.length ? tags : undefined,
    linkLabels: linkLabels.length ? linkLabels : undefined,
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
  const publishedAt = toDate(record.publishedAt);
  const updatedAt = toDate(record.updatedAt);
  const createdAt = toDate(record.createdAt);

  if (process.env.NODE_ENV === "production") {
    if (!publishedAt) return null;
    if (publishedAt.getTime() > Date.now()) return null;
  }

  if (record.publishedAt !== publishedAt) {
    record.publishedAt = publishedAt;
  }
  if (record.updatedAt !== updatedAt) {
    record.updatedAt = updatedAt;
  }
  if (record.createdAt !== createdAt) {
    record.createdAt = createdAt;
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
