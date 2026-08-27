import Image from "next/image";
import Link from "next/link";
import type { BlogRecord } from "@/lib/blog-data";
import { blogCategoryLabelMap } from "@/lib/blog";

type RelatedPostsProps = {
  posts: BlogRecord[];
};

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section
      aria-labelledby="related-posts-heading"
      className="mt-10 border-t border-border/60 pt-6 sm:mt-14 sm:pt-8"
    >
      <h2
        id="related-posts-heading"
        className="text-sm font-semibold tracking-tight sm:text-base"
      >
        あわせて読みたい
      </h2>

      <ul className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 transition hover:border-primary/40 sm:flex-col sm:gap-2.5"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-secondary/30 sm:h-28 sm:w-full sm:rounded-2xl">
                {post.coverImage?.url ? (
                  <Image
                    src={post.coverImage.url}
                    alt={post.coverImage.alt ?? post.title}
                    fill
                    sizes="(max-width: 640px) 80px, 260px"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    // 一覧・詳細と同じく、変換済みの WebP をそのまま配信する。
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full bg-linear-to-br from-primary/10 via-background/60 to-secondary/40" />
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-1">
                {post.category ? (
                  <span className="w-fit rounded-full border border-primary/30 px-2 py-0.5 text-[10px] text-primary sm:text-[11px]">
                    {blogCategoryLabelMap[post.category] ?? "ブログ"}
                  </span>
                ) : null}
                <p className="text-xs font-semibold leading-snug line-clamp-3 sm:text-sm">
                  {post.title}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
