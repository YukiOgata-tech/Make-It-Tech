export const SALE_STATUSES = ["draft", "confirmed"] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];
export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  draft: "下書き",
  confirmed: "計上済み",
};

export const SALE_PAYMENT_METHODS = ["bank_transfer", "cash", "card", "other"] as const;
export type SalePaymentMethod = (typeof SALE_PAYMENT_METHODS)[number];
export const SALE_PAYMENT_METHOD_LABELS: Record<SalePaymentMethod, string> = {
  bank_transfer: "銀行振込",
  cash: "現金",
  card: "カード",
  other: "その他",
};

export const SALE_DOCUMENT_KINDS = ["invoice", "payment_proof", "other"] as const;
export type SaleDocumentKind = (typeof SALE_DOCUMENT_KINDS)[number];
export const SALE_DOCUMENT_KIND_LABELS: Record<SaleDocumentKind, string> = {
  invoice: "請求書",
  payment_proof: "入金証明",
  other: "その他",
};

export const SALES_BUCKET = "mit-sales-documents";
export const MAX_SALES_FILE_SIZE = 15 * 1024 * 1024;
export const SALES_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const MAX_SALES_DOCUMENTS = 20;

const yearFormatter = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", year: "numeric" });

export function formatSaleNumber(value: number | string, createdAt: string) {
  return `S-${yearFormatter.format(new Date(createdAt))}-${String(value).padStart(6, "0")}`;
}
