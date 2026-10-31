export const EXPENSE_STATUSES = ["draft", "confirmed", "archived"] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: "未整理",
  confirmed: "確定済み",
  archived: "アーカイブ",
};

export const PAYMENT_METHODS = [
  "cash",
  "credit_card",
  "bank_transfer",
  "e_money",
  "other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "現金",
  credit_card: "クレジットカード",
  bank_transfer: "銀行振込",
  e_money: "電子マネー",
  other: "その他",
};

export const DOCUMENT_SOURCES = ["paper_scan", "electronic", "other"] as const;
export type DocumentSource = (typeof DOCUMENT_SOURCES)[number];

export const DOCUMENT_SOURCE_LABELS: Record<DocumentSource, string> = {
  paper_scan: "紙の領収書を撮影",
  electronic: "電子データ",
  other: "その他",
};

export const EXPENSE_BUCKET = "mit-expense-receipts";
export const MAX_EXPENSE_FILE_SIZE = 15 * 1024 * 1024;
export const MAX_EXPENSE_FILES = 5;
export const EXPENSE_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

const registrationYearFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
});

export function formatExpenseNumber(value: number | string, createdAt: string) {
  const registrationYear = registrationYearFormatter.format(new Date(createdAt));
  return `R-${registrationYear}-${String(value).padStart(6, "0")}`;
}

export function formatYen(value: number | null | undefined) {
  if (value == null) return "-";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getRecentExpenseMonths(count = 12, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const monthIndex = Number(parts.find((part) => part.type === "month")?.value) - 1;

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, monthIndex - (count - 1 - index), 1));
    const month = date.getUTCMonth() + 1;
    return {
      key: `${date.getUTCFullYear()}-${String(month).padStart(2, "0")}`,
      label: `${month}月`,
    };
  });
}
