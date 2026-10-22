import { z } from "zod";
import {
  DOCUMENT_SOURCES,
  EXPENSE_STATUSES,
  PAYMENT_METHODS,
} from "@/lib/expenses/constants";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const optionalPositiveInteger = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().positive().optional()
);

const optionalNonNegativeInteger = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().nonnegative().optional()
);

export const expenseRecordSchema = z
  .object({
    status: z.enum(EXPENSE_STATUSES),
    transactionDate: z.preprocess(
      emptyToUndefined,
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
    ),
    merchantName: optionalText(160),
    amountYen: optionalPositiveInteger,
    taxAmountYen: optionalNonNegativeInteger,
    categoryId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
    paymentMethod: z.preprocess(
      emptyToUndefined,
      z.enum(PAYMENT_METHODS).optional()
    ),
    description: optionalText(500),
    memo: optionalText(2000),
    documentSource: z.enum(DOCUMENT_SOURCES),
  })
  .superRefine((value, context) => {
    if (
      value.taxAmountYen != null &&
      value.amountYen != null &&
      value.taxAmountYen > value.amountYen
    ) {
      context.addIssue({
        code: "custom",
        path: ["taxAmountYen"],
        message: "消費税額は合計金額以下にしてください。",
      });
    }
    if (value.status === "confirmed") {
      if (!value.transactionDate) {
        context.addIssue({ code: "custom", path: ["transactionDate"], message: "取引日を入力してください。" });
      }
      if (!value.merchantName) {
        context.addIssue({ code: "custom", path: ["merchantName"], message: "支払先を入力してください。" });
      }
      if (!value.amountYen) {
        context.addIssue({ code: "custom", path: ["amountYen"], message: "金額を入力してください。" });
      }
    }
  });

export type ExpenseRecordInput = z.infer<typeof expenseRecordSchema>;

export function parseExpenseFormData(formData: FormData) {
  return expenseRecordSchema.safeParse({
    status: formData.get("status"),
    transactionDate: formData.get("transactionDate"),
    merchantName: formData.get("merchantName"),
    amountYen: formData.get("amountYen"),
    taxAmountYen: formData.get("taxAmountYen"),
    categoryId: formData.get("categoryId"),
    paymentMethod: formData.get("paymentMethod"),
    description: formData.get("description"),
    memo: formData.get("memo"),
    documentSource: formData.get("documentSource"),
  });
}
