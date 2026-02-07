import type { TableHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type MarkdownTableProps = TableHTMLAttributes<HTMLTableElement>;

export function MarkdownTable({ className, ...props }: MarkdownTableProps) {
  return (
    <div className="article-table-wrap">
      <table className={cn("article-table", className)} {...props} />
    </div>
  );
}
