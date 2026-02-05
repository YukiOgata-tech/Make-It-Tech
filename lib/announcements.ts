export const announcementCategories = [
  { value: "news", label: "お知らせ" },
  { value: "media", label: "メディア" },
  { value: "case", label: "実績" },
  { value: "other", label: "その他" },
] as const;

export type AnnouncementCategory = (typeof announcementCategories)[number]["value"];

export const announcementStatuses = [
  { value: "draft", label: "下書き" },
  { value: "published", label: "公開" },
] as const;

export type AnnouncementStatus = (typeof announcementStatuses)[number]["value"];

export const categoryLabelMap: Record<AnnouncementCategory, string> = {
  news: "お知らせ",
  media: "メディア",
  case: "実績",
  other: "その他",
};
