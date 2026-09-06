import { z } from "zod";
import {
  CONTRACT_TEMPLATE_IDS,
  CONTRACT_TYPES,
  CONTRACT_TOKEN_MAX_DAYS,
} from "@/lib/contracts/constants";

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);
const optionalTrimmed = (max: number) => z.string().trim().max(max).optional().default("");
const singleLine = (min: number, max: number) => trimmed(min, max).refine(
  (value) => !/[\r\n]/.test(value),
  "改行は使用できません。"
);
const optionalSingleLine = (max: number) => z.string().trim().max(max).refine(
  (value) => !/[\r\n]/.test(value),
  "改行は使用できません。"
).optional();

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}, "日付を確認してください。");

export const createContractSchema = z.object({
  title: trimmed(1, 160),
  type: z.enum(CONTRACT_TYPES),
  internalMemo: optionalTrimmed(2000),
  companyName: trimmed(1, 200),
  corporateNumber: optionalTrimmed(30),
  companyAddress: optionalTrimmed(500),
  signerName: trimmed(1, 120),
  signerRole: trimmed(1, 120),
  signerEmail: z.string().trim().email().max(320),
  sourceTemplateId: z.enum(CONTRACT_TEMPLATE_IDS).optional(),
  effectiveDate: isoDate.optional(),
});

export const sendContractSchema = z.object({
  expiresInDays: z.number().int().min(1).max(CONTRACT_TOKEN_MAX_DAYS).default(7),
});

export const acceptContractSchema = z.object({
  identityAccepted: z.literal(true),
  authorityAccepted: z.literal(true),
  reviewedAccepted: z.literal(true),
  consentAccepted: z.literal(true),
});

export const ndaTemplateGenerationSchema = z.object({
  companyName: singleLine(1, 200),
  companyAddress: singleLine(1, 500),
  representativeRole: singleLine(1, 120),
  representativeName: singleLine(1, 120),
  contractDate: isoDate,
  contractPurpose: singleLine(1, 500).optional(),
  termYears: z.number().int().min(1).max(99).default(3),
  terminationNoticeDays: z.number().int().min(1).max(365).default(30),
  renewalYears: z.number().int().min(1).max(20).default(1),
  confidentialityYears: z.number().int().min(1).max(99).default(5),
  electronicExecutionAccepted: z.literal(true),
});

export const dataHandlingTemplateGenerationSchema = z.object({
  companyName: singleLine(1, 200),
  companyAddress: singleLine(1, 500),
  representativeRole: singleLine(1, 120),
  representativeName: singleLine(1, 120),
  contractDate: isoDate,
  targetData: optionalSingleLine(500),
  processingPurpose: optionalSingleLine(500),
  dataSubjects: optionalSingleLine(500),
  sensitivePersonalInformation: optionalSingleLine(500),
  specificPersonalInformation: optionalSingleLine(500),
  systemsUsed: optionalSingleLine(500),
  storageLocation: optionalSingleLine(500),
  retentionPeriod: optionalSingleLine(500),
  accessScope: optionalSingleLine(500),
  subcontractors: optionalSingleLine(500),
  thirdPartyServices: optionalSingleLine(500),
  overseasUse: optionalSingleLine(500),
  incidentContact: optionalSingleLine(500),
  endOfTermHandling: optionalSingleLine(500),
  additionalSecurityRequirements: optionalSingleLine(500),
  specialProvisions: optionalSingleLine(500),
  electronicExecutionAccepted: z.literal(true),
});

export const fdeMasterTemplateGenerationSchema = z.object({
  companyName: singleLine(1, 200),
  companyAddress: singleLine(1, 500),
  representativeRole: singleLine(1, 120),
  representativeName: singleLine(1, 120),
  contractDate: isoDate,
  latePaymentInterestRate: z.number().min(0).max(100),
  confidentialityYears: z.number().int().min(1).max(99),
  suspensionDelayDays: z.number().int().min(1).max(365),
  curePeriodDays: z.number().int().min(1).max(365),
  handoverDays: z.number().int().min(1).max(365),
  dataDeletionDays: z.number().int().min(1).max(365),
  termYears: z.number().int().min(1).max(99),
  renewalNoticeDays: z.number().int().min(1).max(365),
  renewalYears: z.number().int().min(1).max(20),
  terminationNoticeDays: z.number().int().min(1).max(365),
  jurisdiction: singleLine(1, 100),
  electronicExecutionAccepted: z.literal(true),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type NdaTemplateGenerationInput = z.infer<typeof ndaTemplateGenerationSchema>;
export type DataHandlingTemplateGenerationInput = z.infer<typeof dataHandlingTemplateGenerationSchema>;
export type FdeMasterTemplateGenerationInput = z.infer<typeof fdeMasterTemplateGenerationSchema>;
