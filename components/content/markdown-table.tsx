import type { TableHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type MarkdownTableProps = TableHTMLAttributes<HTMLTableElement>;

/**
 * 記事本文の表。横に収まらない表はラッパー側でスクロールさせる。
 *
 * 外側の frame は、スクロールを示す右端のフェードを重ねるためだけの器。
 * スクロール領域そのものに重ねると中身と一緒に流れてしまうので分けている。
 *
 * ラッパーの tabIndex / role は、スクロール領域をキーボードだけで動かせる
 * ようにするため（WCAG 2.1.1）。ホイールやスワイプを持たない環境では、
 * フォーカスできないスクロール領域は中身を読み切れなくなる。
 */
export function MarkdownTable({ className, ...props }: MarkdownTableProps) {
  return (
    <div className="article-table-frame">
      <div
        className="article-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="表"
      >
        <table className={cn("article-table", className)} {...props} />
      </div>
    </div>
  );
}
