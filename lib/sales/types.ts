import type { SaleDocumentKind, SalePaymentMethod, SaleStatus } from "@/lib/sales/constants";

export type SaleRecord = {
  id: string;
  entity_id: string;
  sales_number: number;
  recognized_on: string | null;
  customer_name: string | null;
  title: string | null;
  amount_yen: number | null;
  tax_amount_yen: number | null;
  invoice_number: string | null;
  invoice_issued_on: string | null;
  invoice_due_on: string | null;
  notes: string | null;
  status: SaleStatus;
  created_at: string;
  updated_at: string;
  payments?: SalePayment[];
  documents?: SaleDocument[];
  paid_yen?: number;
  document_count?: number;
};

export type SalePayment = {
  id: string;
  sale_id: string;
  paid_on: string;
  amount_yen: number;
  method: SalePaymentMethod;
  destination: string | null;
  notes: string | null;
  status: "recorded" | "voided";
  created_at: string;
};

export type SaleDocument = {
  id: string;
  sale_id: string;
  payment_id: string | null;
  kind: SaleDocumentKind;
  title: string;
  storage_bucket: string | null;
  storage_path: string | null;
  external_url: string | null;
  original_filename: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
  signed_url?: string;
};

export type SaleFilters = {
  q?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};
