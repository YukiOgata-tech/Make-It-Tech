import type {
  DocumentSource,
  ExpenseStatus,
  PaymentMethod,
} from "@/lib/expenses/constants";

export type ExpenseCategory = {
  id: string;
  name: string;
  color: string;
  sort_order: number;
};

export type ExpenseFile = {
  id: string;
  storage_bucket: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  is_primary: boolean;
  created_at: string;
  signed_url?: string;
};

export type ExpenseRecord = {
  id: string;
  entity_id: string;
  receipt_number: number;
  transaction_date: string | null;
  merchant_name: string | null;
  amount_yen: number | null;
  tax_amount_yen: number | null;
  category_id: string | null;
  payment_method: PaymentMethod | null;
  description: string | null;
  memo: string | null;
  document_source: DocumentSource;
  status: ExpenseStatus;
  created_by: string;
  updated_by: string;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  category?: { name: string; color: string } | null;
  files?: ExpenseFile[];
};

export type ExpenseFilters = {
  q?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
  hasFile?: string;
};
