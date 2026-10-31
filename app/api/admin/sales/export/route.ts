import { requireAdmin } from "@/lib/admin-auth";
import { formatSaleNumber, SALE_STATUS_LABELS } from "@/lib/sales/constants";
import { getSales } from "@/lib/sales/server";
import type { SaleFilters } from "@/lib/sales/types";

export const runtime = "nodejs";

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  const params = new URL(request.url).searchParams;
  const filters: SaleFilters = {
    q: params.get("q") ?? undefined,
    status: params.get("status") ?? undefined,
    dateFrom: params.get("dateFrom") ?? undefined,
    dateTo: params.get("dateTo") ?? undefined,
  };
  const sales = await getSales(session, filters, { all: true });
  const headers = ["管理番号", "状態", "計上日", "取引先", "内容", "計上額", "消費税額", "入金済額", "未入金残高", "請求書番号", "請求書発行日", "支払期限", "資料数", "メモ", "登録日時"];
  const rows = sales.map((sale) => [
    formatSaleNumber(sale.sales_number, sale.created_at), SALE_STATUS_LABELS[sale.status], sale.recognized_on,
    sale.customer_name, sale.title, sale.amount_yen, sale.tax_amount_yen, sale.paid_yen,
    sale.status === "confirmed" ? Math.max((sale.amount_yen ?? 0) - (sale.paid_yen ?? 0), 0) : "",
    sale.invoice_number, sale.invoice_issued_on, sale.invoice_due_on, sale.document_count, sale.notes, sale.created_at,
  ]);
  const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
  return new Response(csv, { headers: {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="sales-${stamp}.csv"`,
    "Cache-Control": "private, no-store",
  } });
}
