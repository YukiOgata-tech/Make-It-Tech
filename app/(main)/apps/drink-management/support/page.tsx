import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { drinkManagementSupportMarkdown, drinkManagementApp } from "@/content/apps/drink-management";
import { remarkPlugins, rehypePlugins } from "@/lib/markdown";
import { MarkdownTable } from "@/components/content/markdown-table";
import { AppDocsH2 } from "@/components/content/app-docs-heading";

export const metadata: Metadata = {
  title: `${drinkManagementApp.name} | サポート`,
  description: `${drinkManagementApp.name} のサポート・お問い合わせ`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function DrinkManagementSupportPage() {
  return (
    <div className="app-docs text-sm text-foreground">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          a({ href = "", children, ...props }) {
            return (
              <a href={href} className="app-docs-link" {...props}>
                {children}
              </a>
            );
          },
          h2: AppDocsH2,
          table: MarkdownTable,
        }}
      >
        {drinkManagementSupportMarkdown}
      </ReactMarkdown>
    </div>
  );
}
