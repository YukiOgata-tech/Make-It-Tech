import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { MitSession } from "@/lib/admin-auth";
import {
  EXPENSE_BUCKET,
  EXPENSE_FILE_TYPES,
  getRecentExpenseMonths,
  MAX_EXPENSE_FILE_SIZE,
  MAX_EXPENSE_FILES,
} from "@/lib/expenses/constants";
import type { ExpenseFilters, ExpenseRecord, ExpenseCategory, ExpenseFile } from "@/lib/expenses/types";
import type { ExpenseRecordInput } from "@/lib/expenses/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const expenseRecordSelect = `
  id, entity_id, receipt_number, transaction_date, merchant_name,
  amount_yen, tax_amount_yen, category_id, payment_method,
  description, memo, document_source, status, created_by, updated_by,
  confirmed_by, confirmed_at, created_at, updated_at
`;

function toDatabaseRecord(input: ExpenseRecordInput, session: MitSession) {
  const confirmed = input.status === "confirmed";
  return {
    entity_id: session.entityId,
    transaction_date: input.transactionDate ?? null,
    merchant_name: input.merchantName ?? null,
    amount_yen: input.amountYen ?? null,
    tax_amount_yen: input.taxAmountYen ?? null,
    category_id: input.categoryId ?? null,
    payment_method: input.paymentMethod ?? null,
    description: input.description ?? null,
    memo: input.memo ?? null,
    document_source: input.documentSource,
    status: input.status,
    updated_by: session.uid,
    confirmed_by: confirmed ? session.uid : null,
    confirmed_at: confirmed ? new Date().toISOString() : null,
  };
}

export async function getExpenseCategories(entityId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("mit_expense_categories")
    .select("id, name, color, sort_order")
    .eq("entity_id", entityId)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as ExpenseCategory[];
}

export async function getExpenses(session: MitSession, filters: ExpenseFilters = {}) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("mit_expense_records")
    .select(expenseRecordSelect)
    .eq("entity_id", session.entityId)
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters.status) query = query.eq("status", filters.status);
  else query = query.neq("status", "archived");
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.dateFrom) query = query.gte("transaction_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("transaction_date", filters.dateTo);
  if (filters.amountMin && /^\d+$/.test(filters.amountMin)) query = query.gte("amount_yen", Number(filters.amountMin));
  if (filters.amountMax && /^\d+$/.test(filters.amountMax)) query = query.lte("amount_yen", Number(filters.amountMax));
  if (filters.q?.trim()) query = query.ilike("merchant_name", `%${filters.q.trim()}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const baseExpenses = (data ?? []) as unknown as ExpenseRecord[];
  const expenseIds = baseExpenses.map((item) => item.id);
  const categoryIds = [...new Set(baseExpenses.map((item) => item.category_id).filter((id): id is string => Boolean(id)))];
  const [categoryResult, fileResult] = await Promise.all([
    categoryIds.length
      ? supabase.from("mit_expense_categories").select("id, name, color").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    expenseIds.length
      ? supabase.from("mit_expense_receipt_files").select("id, expense_id, storage_bucket, storage_path, original_filename, mime_type, file_size_bytes, is_primary, created_at").in("expense_id", expenseIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (categoryResult.error) throw new Error(categoryResult.error.message);
  if (fileResult.error) throw new Error(fileResult.error.message);
  const categoryMap = new Map((categoryResult.data ?? []).map((item) => [item.id as string, { name: item.name as string, color: item.color as string }]));
  const filesByExpense = new Map<string, ExpenseFile[]>();
  for (const row of fileResult.data ?? []) {
    const expenseId = row.expense_id as string;
    const files = filesByExpense.get(expenseId) ?? [];
    files.push(row as unknown as ExpenseFile);
    filesByExpense.set(expenseId, files);
  }
  let expenses = baseExpenses.map((item) => ({
    ...item,
    category: item.category_id ? categoryMap.get(item.category_id) ?? null : null,
    files: filesByExpense.get(item.id) ?? [],
  }));
  if (filters.hasFile === "yes") expenses = expenses.filter((item) => (item.files?.length ?? 0) > 0);
  if (filters.hasFile === "no") expenses = expenses.filter((item) => (item.files?.length ?? 0) === 0);
  return expenses;
}

export async function getExpense(session: MitSession, id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("mit_expense_records")
    .select(expenseRecordSelect)
    .eq("entity_id", session.entityId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const expense = data as unknown as ExpenseRecord;
  const [categoryResult, fileResult] = await Promise.all([
    expense.category_id
      ? supabase.from("mit_expense_categories").select("name, color").eq("id", expense.category_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("mit_expense_receipt_files").select("id, storage_bucket, storage_path, original_filename, mime_type, file_size_bytes, is_primary, created_at").eq("expense_id", expense.id).order("created_at"),
  ]);
  if (categoryResult.error) throw new Error(categoryResult.error.message);
  if (fileResult.error) throw new Error(fileResult.error.message);
  expense.category = categoryResult.data as { name: string; color: string } | null;
  expense.files = (fileResult.data ?? []) as ExpenseFile[];
  expense.files = await Promise.all(
    (expense.files ?? []).map(async (file) => {
      const { data: signed } = await supabase.storage
        .from(file.storage_bucket)
        .createSignedUrl(file.storage_path, 60 * 10);
      return { ...file, signed_url: signed?.signedUrl };
    })
  );
  return expense;
}

export async function createExpense(session: MitSession, input: ExpenseRecordInput, files: File[]) {
  validateFiles(files);
  const supabase = await createSupabaseServerClient();
  const id = randomUUID();
  const { data, error } = await supabase
    .from("mit_expense_records")
    .insert({
      id,
      ...toDatabaseRecord(input, session),
      created_by: session.uid,
    })
    .select("id, receipt_number")
    .single();
  if (error) throw new Error(error.message);

  const warnings = await uploadExpenseFiles(session, id, files);
  return { id: data.id as string, receiptNumber: data.receipt_number as number, warnings };
}

export async function updateExpense(session: MitSession, id: string, input: ExpenseRecordInput, files: File[]) {
  validateFiles(files);
  const supabase = await createSupabaseServerClient();
  const { count: existingFileCount, error: fileCountError } = await supabase
    .from("mit_expense_receipt_files")
    .select("id", { head: true, count: "exact" })
    .eq("entity_id", session.entityId)
    .eq("expense_id", id);
  if (fileCountError) throw new Error(fileCountError.message);
  if ((existingFileCount ?? 0) + files.length > MAX_EXPENSE_FILES) {
    throw new Error(`登録済みファイルを含めて${MAX_EXPENSE_FILES}件までです。`);
  }
  const { data, error } = await supabase
    .from("mit_expense_records")
    .update(toDatabaseRecord(input, session))
    .eq("entity_id", session.entityId)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("経費データが見つかりません。");
  const warnings = await uploadExpenseFiles(session, id, files);
  return { id, warnings };
}

export async function archiveExpense(session: MitSession, id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("mit_expense_records")
    .update({ status: "archived", updated_by: session.uid })
    .eq("entity_id", session.entityId)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("経費データが見つかりません。");
}

function validateFiles(files: File[]) {
  if (files.length > MAX_EXPENSE_FILES) throw new Error(`ファイルは${MAX_EXPENSE_FILES}件までです。`);
  for (const file of files) {
    if (!EXPENSE_FILE_TYPES.includes(file.type as (typeof EXPENSE_FILE_TYPES)[number])) {
      throw new Error(`${file.name}は対応していない形式です。`);
    }
    if (file.size <= 0 || file.size > MAX_EXPENSE_FILE_SIZE) {
      throw new Error(`${file.name}は15MB以下にしてください。`);
    }
  }
}

async function uploadExpenseFiles(session: MitSession, expenseId: string, files: File[]) {
  if (!files.length) return [] as string[];
  const supabase = await createSupabaseServerClient();
  const warnings: string[] = [];
  const { count: existingFileCount, error: fileCountError } = await supabase
    .from("mit_expense_receipt_files")
    .select("id", { head: true, count: "exact" })
    .eq("entity_id", session.entityId)
    .eq("expense_id", expenseId);
  if (fileCountError) throw new Error(fileCountError.message);

  for (const [index, file] of files.entries()) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const extension = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1].replace("jpeg", "jpg");
    const fileId = randomUUID();
    const storagePath = `${session.entityId}/${expenseId}/${fileId}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(EXPENSE_BUCKET)
      .upload(storagePath, bytes, { contentType: file.type, upsert: false });

    if (uploadError) {
      warnings.push(`${file.name}: ${uploadError.message}`);
      continue;
    }

    const { error: metadataError } = await supabase
      .from("mit_expense_receipt_files")
      .insert({
        id: fileId,
        entity_id: session.entityId,
        expense_id: expenseId,
        storage_bucket: EXPENSE_BUCKET,
        storage_path: storagePath,
        original_filename: file.name.slice(0, 255),
        mime_type: file.type,
        file_size_bytes: file.size,
        sha256,
        is_primary: (existingFileCount ?? 0) === 0 && index === 0,
        uploaded_by: session.uid,
      });
    if (metadataError) {
      await supabase.storage.from(EXPENSE_BUCKET).remove([storagePath]);
      warnings.push(`${file.name}: ${metadataError.message}`);
    }
  }
  return warnings;
}

export async function getExpenseStatistics(session: MitSession) {
  const supabase = await createSupabaseServerClient();
  const [firstMonth] = getRecentExpenseMonths();
  const { data, error } = await supabase
    .from("mit_expense_records")
    .select("transaction_date, amount_yen, merchant_name, category_id")
    .eq("entity_id", session.entityId)
    .eq("status", "confirmed")
    .gte("transaction_date", `${firstMonth.key}-01`)
    .order("transaction_date");
  if (error) throw new Error(error.message);

  const { count: draftCount, error: countError } = await supabase
    .from("mit_expense_records")
    .select("id", { head: true, count: "exact" })
    .eq("entity_id", session.entityId)
    .eq("status", "draft");
  if (countError) throw new Error(countError.message);

  const baseRows = (data ?? []) as unknown as Array<{
    transaction_date: string;
    amount_yen: number;
    merchant_name: string;
    category_id: string | null;
  }>;
  const categoryIds = [...new Set(baseRows.map((row) => row.category_id).filter((id): id is string => Boolean(id)))];
  const { data: categoryData, error: categoryError } = categoryIds.length
    ? await supabase.from("mit_expense_categories").select("id, name, color").in("id", categoryIds)
    : { data: [], error: null };
  if (categoryError) throw new Error(categoryError.message);
  const categoryMap = new Map((categoryData ?? []).map((item) => [item.id as string, { name: item.name as string, color: item.color as string }]));
  const rows = baseRows.map((row) => ({
    transaction_date: row.transaction_date,
    amount_yen: row.amount_yen,
    merchant_name: row.merchant_name,
    category: row.category_id ? categoryMap.get(row.category_id) ?? null : null,
  }));
  return { rows, draftCount: draftCount ?? 0 };
}
