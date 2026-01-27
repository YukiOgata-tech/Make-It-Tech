"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ChevronRight, Home } from "lucide-react";
import { site } from "@/lib/site";

// ラベルのマッピング定義
const labelMap: Record<string, string> = {
  services: "サービス",
  pricing: "料金",
  about: "事業所概要",
  contact: "お問い合わせ",
  survey: "LINE相談",
  privacy: "プライバシーポリシー",
  terms: "利用規約",
  glossary: "用語集",
  sub: "サブページ",
  lp: "LP",
  admin: "管理画面",
};

export function SiteBreadcrumbs() {
  const pathname = usePathname();

  // トップページでは表示しない
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  
  // パンくずリストのデータ構造を作成
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = labelMap[segment] || segment;
    return { href, label };
  });

  // JSON-LD (構造化データ) の生成
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: site.url,
      },
      ...breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: crumb.label,
        item: `${site.url}${crumb.href}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="w-full border-b border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="mx-auto flex h-10 max-w-6xl items-center px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 sm:gap-2">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                aria-label="ホーム"
              >
                <Home className="h-3.5 w-3.5" />
              </Link>
            </li>
            
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Fragment key={crumb.href}>
                  <li aria-hidden="true">
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  </li>
                  <li>
                    {isLast ? (
                      <span className="font-medium text-foreground" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
