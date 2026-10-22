import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  ClipboardList,
  FileSignature,
  Gauge,
  Heart,
  Mail,
  Newspaper,
  RadioTower,
  ReceiptText,
  BarChart3,
} from "lucide-react";

export type AdminNavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type AdminNavigationSection = {
  label: string;
  items: readonly AdminNavigationItem[];
};

export const adminNavigation: readonly AdminNavigationSection[] = [
  {
    label: "概要",
    items: [
      {
        href: "/sub/admin-console",
        label: "ダッシュボード",
        description: "業務全体を確認",
        icon: Gauge,
      },
    ],
  },
  {
    label: "顧客対応",
    items: [
      {
        href: "/sub/admin-console/results",
        label: "問い合わせ",
        description: "相談内容と対応状況",
        icon: ClipboardList,
      },
      {
        href: "/sub/admin-console/contracts",
        label: "契約管理",
        description: "契約書と署名状況",
        icon: FileSignature,
      },
      {
        href: "/sub/admin-console/create-email",
        label: "メール送信",
        description: "公式メールを個別送信",
        icon: Mail,
      },
    ],
  },
  {
    label: "経理",
    items: [
      {
        href: "/sub/admin-console/expenses",
        label: "経費・領収書",
        description: "領収書画像と経費情報",
        icon: ReceiptText,
      },
      {
        href: "/sub/admin-console/expenses/stats",
        label: "経費統計",
        description: "月別・分類別の集計",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "コンテンツ",
    items: [
      {
        href: "/sub/admin-console/news",
        label: "お知らせ",
        description: "公開情報を管理",
        icon: Newspaper,
      },
      {
        href: "/sub/admin-console/blog",
        label: "ブログ",
        description: "記事を作成・編集",
        icon: BookOpenText,
      },
    ],
  },
  {
    label: "サービス設定",
    items: [
      {
        href: "/sub/admin-console/nfc-links",
        label: "NFCリンク",
        description: "固定URLの遷移先",
        icon: RadioTower,
      },
      {
        href: "/sub/admin-console/my-life",
        label: "My Life",
        description: "メッセージと画像",
        icon: Heart,
      },
    ],
  },
];

export const adminNavigationItems = adminNavigation.flatMap(
  (section) => section.items
);

export function normalizeAdminPathname(pathname: string) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (normalized === "/sub/admin-console") return "/";
  if (normalized.startsWith("/sub/admin-console/")) {
    return normalized.slice("/sub/admin-console".length);
  }
  return normalized;
}

function normalizeNavigationHref(href: string) {
  return normalizeAdminPathname(href);
}

export function isAdminNavigationItemActive(
  pathname: string,
  item: AdminNavigationItem
) {
  const currentPath = normalizeAdminPathname(pathname);
  const itemPath = normalizeNavigationHref(item.href);

  if (itemPath === "/") return currentPath === "/";
  if (itemPath === "/results") {
    if (currentPath === "/results") return true;
    const matchesInquiryDetail = /^\/[A-Za-z0-9_-]+$/.test(currentPath);
    const matchesKnownRoute = adminNavigationItems.some(
      (candidate) => normalizeNavigationHref(candidate.href) === currentPath
    );
    return matchesInquiryDetail && !matchesKnownRoute;
  }
  if (itemPath === "/expenses") {
    return (
      (currentPath === "/expenses" || currentPath.startsWith("/expenses/")) &&
      !currentPath.startsWith("/expenses/stats")
    );
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function getAdminPageMeta(pathname: string) {
  const currentPath = normalizeAdminPathname(pathname);
  const item = adminNavigationItems.find((candidate) =>
    isAdminNavigationItemActive(pathname, candidate)
  );
  const section = adminNavigation.find((candidate) =>
    candidate.items.some((navigationItem) => navigationItem === item)
  );

  if (currentPath === "/login") {
    return {
      title: "管理者ログイン",
      description: "管理画面へログイン",
      section: "Admin Console",
    };
  }

  return {
    title: item?.label ?? "Admin Console",
    description: item?.description ?? "Make It Tech 業務管理",
    section: section?.label ?? "管理画面",
  };
}

export type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

export function getAdminBreadcrumbs(pathname: string): AdminBreadcrumbItem[] {
  const currentPath = normalizeAdminPathname(pathname);
  const meta = getAdminPageMeta(pathname);
  const item = adminNavigationItems.find((candidate) =>
    isAdminNavigationItemActive(pathname, candidate)
  );

  if (currentPath === "/") {
    return [{ label: "ダッシュボード" }];
  }

  const breadcrumbs: AdminBreadcrumbItem[] = [
    { label: "ダッシュボード", href: "/sub/admin-console" },
  ];

  if (meta.section !== "管理画面" && meta.section !== "Admin Console") {
    breadcrumbs.push({ label: meta.section });
  }

  if (!item) {
    breadcrumbs.push({ label: meta.title });
    return breadcrumbs;
  }

  const itemPath = normalizeNavigationHref(item.href);
  if (currentPath === itemPath || currentPath === "/results") {
    breadcrumbs.push({ label: item.label });
    return breadcrumbs;
  }

  breadcrumbs.push({ label: item.label, href: item.href });

  if (currentPath.endsWith("/new")) {
    breadcrumbs.push({ label: "新規作成" });
  } else if (currentPath.includes("/input-requests/")) {
    breadcrumbs.push({ label: "入力依頼" });
  } else if (itemPath === "/results") {
    breadcrumbs.push({ label: "問い合わせ詳細" });
  } else {
    breadcrumbs.push({ label: "詳細・編集" });
  }

  return breadcrumbs;
}
