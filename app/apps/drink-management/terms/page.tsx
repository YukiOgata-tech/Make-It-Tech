import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { drinkManagementTermsMarkdown, drinkManagementApp } from "@/content/apps/drink-management";
import { remarkPlugins, rehypePlugins } from "@/lib/markdown";
import { MarkdownTable } from "@/components/content/markdown-table";
import { AppDocsH2 } from "@/components/content/app-docs-heading";

export const metadata: Metadata = {
  title: `${drinkManagementApp.name} | 利用規約`,
  description: `${drinkManagementApp.name} の利用規約`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function DrinkManagementTermsPage() {
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
        {drinkManagementTermsMarkdown}
      </ReactMarkdown>
    </div>
  );
}
