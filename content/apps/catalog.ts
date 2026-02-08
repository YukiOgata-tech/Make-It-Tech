type AppLink = {
  label: string;
  href: string;
};

export type AppCatalogItem = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  statusLabel: string;
  links: AppLink[];
};

export const appCatalog: AppCatalogItem[] = [
  {
    id: "drink-management",
    name: "ドリンKing",
    tagline: "飲酒記録・振り返りアプリ",
    description:
      "飲酒量の可視化、イベント参加、振り返りまでをまとめて記録できるシンプルなアプリです。",
    statusLabel: "公開中",
    links: [
      { label: "プライバシーポリシー", href: "/apps/drink-management/privacy" },
      { label: "利用規約", href: "/apps/drink-management/terms" },
      { label: "サポート", href: "/apps/drink-management/support" },
    ],
  },
];
