import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { MitSession } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prepareFinancialDocument } from "@/lib/financial-document-upload";
import { MAX_SALES_DOCUMENTS, MAX_SALES_FILE_SIZE, SALES_BUCKET, SALES_FILE_TYPES } from "@/lib/sales/constants";
import type { SaleDocumentKind } from "@/lib/sales/constants";
import { documentUrlSchema } from "@/lib/sales/schemas";
import type { PaymentInput, SaleInput } from "@/lib/sales/schemas";
import type { SaleDocument, SaleFilters, SalePayment, SaleRecord } from "@/lib/sales/types";

const saleSelect = "id, entity_id, sales_number, recognized_on, customer_name, title, amount_yen, tax_amount_yen, invoice_number, invoice_issued_on, invoice_due_on, notes, status, created_at, updated_at";

function toSaleRow(input: SaleInput, session: MitSession) {
  return {
    entity_id: session.entityId,
    recognized_on: input.recognizedOn ?? null,
    customer_name: input.customerName ?? null,
    title: input.title ?? null,
    amount_yen: input.amountYen ?? null,
    tax_amount_yen: input.taxAmountYen ?? null,
    invoice_number: input.invoiceNumber ?? null,
    invoice_issued_on: input.invoiceIssuedOn ?? null,
    invoice_due_on: input.invoiceDueOn ?? null,
    notes: input.notes ?? null,
    status: input.status,
    updated_by: session.uid,
    confirmed_by: input.status === "confirmed" ? session.uid : null,
    confirmed_at: input.status === "confirmed" ? new Date().toISOString() : null,
  };
}

export async function getSales(session: MitSession, filters: SaleFilters = {}, options: { all?: boolean } = {}) {
  const supabase = await createSupabaseServerClient();
  const sales: SaleRecord[] = [];
  for (let offset = 0; ; offset += 500) {
    let query = supabase.from("mit_sales_records").select(saleSelect)
      .eq("entity_id", session.entityId).order("created_at", { ascending: false }).order("id").range(offset, offset + 499);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.dateFrom) query = query.gte("recognized_on", filters.dateFrom);
    if (filters.dateTo) query = query.lte("recognized_on", filters.dateTo);
    if (filters.q?.trim()) query = query.ilike("customer_name", `%${filters.q.trim()}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    sales.push(...((data ?? []) as unknown as SaleRecord[]));
    if (!options.all || !data || data.length < 500) break;
  }
  if (!sales.length) return sales;
  const paid = new Map<string, number>();
  const documentCounts = new Map<string, number>();
  for (let offset = 0; offset < sales.length; offset += 100) {
    const ids = sales.slice(offset, offset + 100).map((sale) => sale.id);
    const [paymentResult, documentResult] = await Promise.all([
      supabase.from("mit_sales_payments").select("sale_id, amount_yen, status").in("sale_id", ids),
      supabase.from("mit_sales_documents").select("sale_id").in("sale_id", ids),
    ]);
    if (paymentResult.error) throw new Error(paymentResult.error.message);
    if (documentResult.error) throw new Error(documentResult.error.message);
    for (const payment of paymentResult.data ?? []) {
      if (payment.status === "recorded") paid.set(payment.sale_id, (paid.get(payment.sale_id) ?? 0) + payment.amount_yen);
    }
    for (const document of documentResult.data ?? []) documentCounts.set(document.sale_id, (documentCounts.get(document.sale_id) ?? 0) + 1);
  }
  return sales.map((sale) => ({ ...sale, paid_yen: paid.get(sale.id) ?? 0, document_count: documentCounts.get(sale.id) ?? 0 }));
}

export async function getSale(session: MitSession, id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("mit_sales_records").select(saleSelect)
    .eq("entity_id", session.entityId).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const [paymentResult, documentResult] = await Promise.all([
    supabase.from("mit_sales_payments").select("id, sale_id, paid_on, amount_yen, method, destination, notes, status, created_at")
      .eq("entity_id", session.entityId).eq("sale_id", id).order("paid_on", { ascending: false }),
    supabase.from("mit_sales_documents").select("id, sale_id, payment_id, kind, title, storage_bucket, storage_path, external_url, original_filename, mime_type, file_size_bytes, created_at")
      .eq("entity_id", session.entityId).eq("sale_id", id).order("created_at", { ascending: false }),
  ]);
  if (paymentResult.error) throw new Error(paymentResult.error.message);
  if (documentResult.error) throw new Error(documentResult.error.message);
  const documents = await Promise.all(((documentResult.data ?? []) as SaleDocument[]).map(async (document) => {
    if (!document.storage_path) return document;
    const { data: signed, error: signError } = await supabase.storage.from(SALES_BUCKET).createSignedUrl(document.storage_path, 600);
    if (signError) return document;
    return { ...document, signed_url: signed.signedUrl };
  }));
  const payments = (paymentResult.data ?? []) as SalePayment[];
  return {
    ...(data as unknown as SaleRecord),
    payments,
    documents,
    paid_yen: payments.reduce((sum, payment) => sum + (payment.status === "recorded" ? payment.amount_yen : 0), 0),
  };
}

export async function createSale(session: MitSession, input: SaleInput) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("mit_sales_records")
    .insert({ id: randomUUID(), ...toSaleRow(input, session), created_by: session.uid })
    .select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function updateSale(session: MitSession, id: string, input: SaleInput) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("mit_sales_records")
    .update(toSaleRow(input, session)).eq("entity_id", session.entityId).eq("id", id).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("売上記録が見つかりません。");
}

export async function recordPayment(session: MitSession, saleId: string, input: PaymentInput) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("mit_sales_payments").insert({
    id: randomUUID(), entity_id: session.entityId, sale_id: saleId, paid_on: input.paidOn,
    amount_yen: input.amountYen, method: input.method, destination: input.destination ?? null,
    notes: input.notes ?? null, created_by: session.uid,
  }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function voidPayment(session: MitSession, saleId: string, paymentId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("mit_sales_payments")
    .update({ status: "voided", voided_by: session.uid, voided_at: new Date().toISOString() })
    .eq("entity_id", session.entityId).eq("sale_id", saleId).eq("id", paymentId)
    .eq("status", "recorded").select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("対象の入金記録が見つかりません。");
}

export async function addSaleDocument(session: MitSession, saleId: string, input: {
  kind: SaleDocumentKind; title: string; paymentId?: string; url?: string; file?: File;
}) {
  const supabase = await createSupabaseServerClient();
  if (Boolean(input.url) === Boolean(input.file)) throw new Error("ファイルまたはURLを一つ選択してください。");
  const { count, error: countError } = await supabase.from("mit_sales_documents")
    .select("id", { head: true, count: "exact" }).eq("entity_id", session.entityId).eq("sale_id", saleId);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) >= MAX_SALES_DOCUMENTS) throw new Error(`資料は売上1件あたり${MAX_SALES_DOCUMENTS}件までです。`);
  if (input.kind === "payment_proof" && !input.paymentId) throw new Error("入金証明は入金記録に紐づけてください。");
  const base = {
    id: randomUUID(), entity_id: session.entityId, sale_id: saleId,
    payment_id: input.paymentId ?? null, kind: input.kind, title: input.title.trim().slice(0, 200),
    uploaded_by: session.uid,
  };
  if (!base.title) throw new Error("資料名を入力してください。");

  if (input.url) {
    const parsed = documentUrlSchema.safeParse(input.url.trim());
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "URLを確認してください。");
    const { error } = await supabase.from("mit_sales_documents").insert({ ...base, external_url: parsed.data });
    if (error) throw new Error(error.message);
    return;
  }

  const file = input.file!;
  if (!SALES_FILE_TYPES.includes(file.type as (typeof SALES_FILE_TYPES)[number])) throw new Error("JPEG、PNG、WebP、PDFを選択してください。");
  if (file.size <= 0 || file.size > MAX_SALES_FILE_SIZE) throw new Error("ファイルは15MB以下にしてください。");
  const prepared = await prepareFinancialDocument(file, MAX_SALES_FILE_SIZE);
  const storagePath = `${session.entityId}/${saleId}/${base.id}.${prepared.extension}`;
  const { error: uploadError } = await supabase.storage.from(SALES_BUCKET).upload(storagePath, prepared.bytes, { contentType: prepared.mimeType, upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  const { error: insertError } = await supabase.from("mit_sales_documents").insert({
    ...base, storage_bucket: SALES_BUCKET, storage_path: storagePath,
    original_filename: file.name.slice(0, 255), mime_type: prepared.mimeType, file_size_bytes: prepared.bytes.length,
    sha256: createHash("sha256").update(prepared.bytes).digest("hex"),
  });
  if (insertError) {
    await supabase.storage.from(SALES_BUCKET).remove([storagePath]);
    throw new Error(insertError.message);
  }
}

export async function getSalesStatistics(session: MitSession) {
  const supabase = await createSupabaseServerClient();
  const sales: Pick<SaleRecord, "id" | "recognized_on" | "amount_yen" | "customer_name">[] = [];
  const payments: Pick<SalePayment, "sale_id" | "paid_on" | "amount_yen" | "status">[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("mit_sales_records")
      .select("id, recognized_on, amount_yen, customer_name").eq("entity_id", session.entityId)
      .eq("status", "confirmed").order("id").range(offset, offset + 499);
    if (error) throw new Error(error.message);
    sales.push(...((data ?? []) as typeof sales));
    if (!data || data.length < 500) break;
  }
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("mit_sales_payments")
      .select("sale_id, paid_on, amount_yen, status").eq("entity_id", session.entityId)
      .eq("status", "recorded").order("id").range(offset, offset + 499);
    if (error) throw new Error(error.message);
    payments.push(...((data ?? []) as typeof payments));
    if (!data || data.length < 500) break;
  }
  const confirmedIds = new Set(sales.map((sale) => sale.id));
  return { sales, payments: payments.filter((payment) => confirmedIds.has(payment.sale_id)) };
}
