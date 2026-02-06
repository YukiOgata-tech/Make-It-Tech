export const blogCategories = [
  { value: "improvement", label: "業務改善" },
  { value: "automation", label: "自動化" },
  { value: "web", label: "Web/LP" },
  { value: "subsidy", label: "補助金" },
  { value: "case", label: "事例" },
  { value: "other", label: "その他" },
] as const;

export type BlogCategory = (typeof blogCategories)[number]["value"];

export const blogStatuses = [
  { value: "draft", label: "下書き" },
  { value: "published", label: "公開" },
] as const;

export type BlogStatus = (typeof blogStatuses)[number]["value"];

export const blogCategoryLabelMap: Record<BlogCategory, string> = {
  improvement: "業務改善",
  automation: "自動化",
  web: "Web/LP",
  subsidy: "補助金",
  case: "事例",
  other: "その他",
};
