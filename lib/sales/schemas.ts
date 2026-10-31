import { z } from "zod";
import { SALE_PAYMENT_METHODS, SALE_STATUSES } from "@/lib/sales/constants";

const emptyToUndefined = (value: unknown) => typeof value === "string" && value.trim() === "" ? undefined : value;
const optionalText = (max: number) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());
const optionalDate = z.preprocess(emptyToUndefined, z.iso.date().optional());
const optionalAmount = z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional());
const optionalTax = z.preprocess(emptyToUndefined, z.coerce.number().int().nonnegative().optional());

export const saleSchema = z.object({
  status: z.enum(SALE_STATUSES),
  recognizedOn: optionalDate,
  customerName: optionalText(160),
  title: optionalText(200),
  amountYen: optionalAmount,
  taxAmountYen: optionalTax,
  invoiceNumber: optionalText(100),
  invoiceIssuedOn: optionalDate,
  invoiceDueOn: optionalDate,
  notes: optionalText(2000),
}).superRefine((value, context) => {
  if (value.taxAmountYen != null && value.amountYen != null && value.taxAmountYen > value.amountYen) {
    context.addIssue({ code: "custom", path: ["taxAmountYen"], message: "消費税額は税込金額以下にしてください。" });
  }
  if (value.status === "confirmed") {
    if (!value.recognizedOn) context.addIssue({ code: "custom", path: ["recognizedOn"], message: "売上計上日を入力してください。" });
    if (!value.customerName) context.addIssue({ code: "custom", path: ["customerName"], message: "取引先を入力してください。" });
    if (!value.title) context.addIssue({ code: "custom", path: ["title"], message: "内容を入力してください。" });
    if (!value.amountYen) context.addIssue({ code: "custom", path: ["amountYen"], message: "税込金額を入力してください。" });
  }
});
export type SaleInput = z.infer<typeof saleSchema>;

export function parseSaleFormData(data: FormData) {
  return saleSchema.safeParse({
    status: data.get("status"), recognizedOn: data.get("recognizedOn"),
    customerName: data.get("customerName"), title: data.get("title"),
    amountYen: data.get("amountYen"), taxAmountYen: data.get("taxAmountYen"),
    invoiceNumber: data.get("invoiceNumber"), invoiceIssuedOn: data.get("invoiceIssuedOn"),
    invoiceDueOn: data.get("invoiceDueOn"), notes: data.get("notes"),
  });
}

export const paymentSchema = z.object({
  paidOn: z.iso.date(),
  amountYen: z.coerce.number().int().positive(),
  method: z.enum(SALE_PAYMENT_METHODS),
  destination: optionalText(160),
  notes: optionalText(1000),
});
export type PaymentInput = z.infer<typeof paymentSchema>;

export function parsePaymentFormData(data: FormData) {
  return paymentSchema.safeParse({
    paidOn: data.get("paidOn"), amountYen: data.get("amountYen"),
    method: data.get("method"), destination: data.get("destination"), notes: data.get("notes"),
  });
}

export const documentUrlSchema = z.string().url().max(2048).refine((value) => new URL(value).protocol === "https:", "HTTPSのURLを入力してください。");
