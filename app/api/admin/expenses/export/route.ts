import { requireAdmin } from "@/lib/admin-auth";
import {
  DOCUMENT_SOURCE_LABELS,
  EXPENSE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  formatExpenseNumber,
} from "@/lib/expenses/constants";
import { getExpenses } from "@/lib/expenses/server";
import type { ExpenseFilters } from "@/lib/expenses/types";

export const runtime = "nodejs";

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  const params = new URL(request.url).searchParams;
  const filters: ExpenseFilters = {
    q: params.get("q") ?? undefined,
    status: params.get("status") ?? undefined,
    category: params.get("category") ?? undefined,
    dateFrom: params.get("dateFrom") ?? undefined,
    dateTo: params.get("dateTo") ?? undefined,
    amountMin: params.get("amountMin") ?? undefined,
    amountMax: params.get("amountMax") ?? undefined,
    hasFile: params.get("hasFile") ?? undefined,
  };
  const expenses = await getExpenses(session, filters);
  const headers = [
    "管理番号", "取引日", "支払先", "税込金額", "消費税額", "経費分類",
    "支払方法", "用途", "メモ", "画像数", "書類種別", "状態", "登録日時",
  ];
  const rows = expenses.map((expense) => [
    formatExpenseNumber(expense.receipt_number),
    expense.transaction_date,
    expense.merchant_name,
    expense.amount_yen,
    expense.tax_amount_yen,
    expense.category?.name,
    expense.payment_method ? PAYMENT_METHOD_LABELS[expense.payment_method] : "",
    expense.description,
    expense.memo,
    expense.files?.length ?? 0,
    DOCUMENT_SOURCE_LABELS[expense.document_source],
    EXPENSE_STATUS_LABELS[expense.status],
    expense.created_at,
  ]);
  const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="expenses-${stamp}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
