import { z } from "zod";
import {
  CONTRACT_TEMPLATE_IDS,
  CONTRACT_TYPES,
  CONTRACT_TOKEN_DEFAULT_DAYS,
  CONTRACT_TOKEN_MAX_DAYS,
} from "@/lib/contracts/constants";

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);
const optionalTrimmed = (max: number) => z.string().trim().max(max).optional().default("");
const singleLine = (min: number, max: number) => trimmed(min, max).refine(
  (value) => !/[\r\n]/.test(value),
  "改行は使用できません。"
);
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

export const contractInputPartySchema = z.object({
  companyName: singleLine(1, 200),
  corporateNumber: optionalTrimmed(30),
  companyAddress: singleLine(1, 500),
  representativeRole: singleLine(1, 120),
  representativeName: singleLine(1, 120),
});

export const sendContractSchema = z.object({
  expiresInDays: z.number().int().min(1).max(CONTRACT_TOKEN_MAX_DAYS).default(CONTRACT_TOKEN_DEFAULT_DAYS),
});

export const acceptContractSchema = z.object({
  typedSignerName: singleLine(1, 120),
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
  effectiveDate: isoDate,
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
  effectiveDate: isoDate,
  targetData: singleLine(1, 500),
  processingPurpose: singleLine(1, 500),
  dataSubjects: singleLine(1, 500),
  sensitivePersonalInformation: singleLine(1, 500),
  specificPersonalInformation: singleLine(1, 500),
  systemsUsed: singleLine(1, 500),
  storageLocation: singleLine(1, 500),
  retentionPeriod: singleLine(1, 500),
  accessScope: singleLine(1, 500),
  subcontractors: singleLine(1, 500),
  thirdPartyServices: singleLine(1, 500),
  overseasUse: singleLine(1, 500),
  incidentContact: singleLine(1, 500),
  endOfTermHandling: singleLine(1, 500),
  additionalSecurityRequirements: singleLine(1, 500),
  specialProvisions: singleLine(1, 500),
  electronicExecutionAccepted: z.literal(true),
});

export const fdeMasterTemplateGenerationSchema = z.object({
  companyName: singleLine(1, 200),
  companyAddress: singleLine(1, 500),
  representativeRole: singleLine(1, 120),
  representativeName: singleLine(1, 120),
  effectiveDate: isoDate,
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

const contractPartyFieldKeys = {
  companyName: true,
  companyAddress: true,
  representativeRole: true,
  representativeName: true,
  electronicExecutionAccepted: true,
} as const;

export const ndaContractConditionsSchema = ndaTemplateGenerationSchema.omit(
  contractPartyFieldKeys
);
export const dataHandlingContractConditionsSchema =
  dataHandlingTemplateGenerationSchema.omit(contractPartyFieldKeys);
export const fdeMasterContractConditionsSchema =
  fdeMasterTemplateGenerationSchema.omit(contractPartyFieldKeys);

const contractInputRequestBaseFields = {
  title: trimmed(1, 160),
  internalMemo: optionalTrimmed(2000),
  signerEmail: z.string().trim().email().max(320),
  electronicExecutionAccepted: z.literal(true),
};

export const createContractInputRequestSchema = z.discriminatedUnion(
  "sourceTemplateId",
  [
    z.object({
      ...contractInputRequestBaseFields,
      sourceTemplateId: z.literal("nda-standard-v1"),
      contractConditions: ndaContractConditionsSchema,
    }),
    z.object({
      ...contractInputRequestBaseFields,
      sourceTemplateId: z.literal("data-handling-addendum-standard-v1"),
      contractConditions: dataHandlingContractConditionsSchema,
    }),
    z.object({
      ...contractInputRequestBaseFields,
      sourceTemplateId: z.literal("fde-master-standard-v1"),
      contractConditions: fdeMasterContractConditionsSchema,
    }),
  ]
);

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type CreateContractInputRequestInput = z.infer<typeof createContractInputRequestSchema>;
export type ContractInputParty = z.infer<typeof contractInputPartySchema>;
export type NdaContractConditions = z.infer<typeof ndaContractConditionsSchema>;
export type DataHandlingContractConditions = z.infer<typeof dataHandlingContractConditionsSchema>;
export type FdeMasterContractConditions = z.infer<typeof fdeMasterContractConditionsSchema>;
export type NdaTemplateGenerationInput = z.infer<typeof ndaTemplateGenerationSchema>;
export type DataHandlingTemplateGenerationInput = z.infer<typeof dataHandlingTemplateGenerationSchema>;
export type FdeMasterTemplateGenerationInput = z.infer<typeof fdeMasterTemplateGenerationSchema>;
