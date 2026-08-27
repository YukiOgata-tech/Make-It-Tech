import type { BlogRecord } from "@/lib/blog-data";

// タグ一致を最優先、次にカテゴリ一致で並べる。
// 数字は「タグ1本の一致 > カテゴリ一致」だけが保証されればよく、絶対値に意味はない。
const TAG_SCORE = 3;
const CATEGORY_SCORE = 2;

const DEFAULT_LIMIT = 3;

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

function isPubliclyVisible(post: BlogRecord) {
  if (!post.slug) return false;
  if (post.status !== "published") return false;
  if (!post.publishedAt) return false;
  return post.publishedAt.getTime() <= Date.now();
}

/**
 * 本文中の `/blog/<slug>` リンクを記事タイトルに置き換えるためのマップ。
 *
 * 本文に裸で書かれたパスは remark プラグインが自動でリンク化するが、
 * そのままだとアンカーテキストが `/blog/xxx` という生のURLになる。
 * 下書きは載せない（未公開のタイトルを外に出さないため）。
 */
export function buildBlogTitleMap(
  posts: BlogRecord[]
): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const post of posts) {
    if (!isPubliclyVisible(post) || !post.title) continue;
    map.set(`/blog/${post.slug}`, post.title);
  }
  return map;
}

/**
 * 記事詳細の下に出す関連記事を選ぶ。
 *
 * スコアが 0（タグもカテゴリも重ならない）候補も新着順で埋める。
 * 関連度より「どの記事からも必ず他記事へ内部リンクが伸びている」ことを優先するため。
 * 記事が増えるほど上位はタグ一致で埋まり、埋め合わせは自然に消える。
 */
export function selectRelatedPosts(
  current: BlogRecord,
  all: BlogRecord[],
  limit: number = DEFAULT_LIMIT
): BlogRecord[] {
  const currentTags = new Set((current.tags ?? []).map(normalizeTag));

  return all
    .filter((post) => post.slug !== current.slug && isPubliclyVisible(post))
    .map((post) => {
      const sharedTags = (post.tags ?? []).filter((tag) =>
        currentTags.has(normalizeTag(tag))
      ).length;
      const sameCategory = Boolean(
        current.category && post.category === current.category
      );

      return {
        post,
        score: sharedTags * TAG_SCORE + (sameCategory ? CATEGORY_SCORE : 0),
        publishedAt: post.publishedAt?.getTime() ?? 0,
      };
    })
    .sort((a, b) => b.score - a.score || b.publishedAt - a.publishedAt)
    .slice(0, limit)
    .map((entry) => entry.post);
}
