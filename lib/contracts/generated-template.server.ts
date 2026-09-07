import "server-only";
import {
  generateDataHandlingWordDocument,
  getGeneratedDataHandlingFileName,
} from "@/lib/contracts/data-handling-word-template";
import {
  generateFdeMasterWordDocument,
  getGeneratedFdeMasterFileName,
} from "@/lib/contracts/fde-master-word-template";
import {
  generateNdaWordDocument,
  getGeneratedNdaFileName,
} from "@/lib/contracts/nda-word-template";
import {
  dataHandlingTemplateGenerationSchema,
  fdeMasterTemplateGenerationSchema,
  ndaTemplateGenerationSchema,
} from "@/lib/contracts/schemas";
import { readContractTemplate } from "@/lib/contracts/templates.server";
import {
  CONTRACT_TEMPLATES,
  type ContractTemplateId,
} from "@/lib/contracts/constants";

export class ContractTemplateInputError extends Error {
  constructor(public readonly details: unknown) {
    super("Wordへ入力する内容を確認してください。");
    this.name = "ContractTemplateInputError";
  }
}

export async function generateContractTemplateWord(
  templateId: ContractTemplateId,
  payload: unknown
) {
  const template = CONTRACT_TEMPLATES[templateId];
  const { bytes } = await readContractTemplate(templateId);

  if (template.formKind === "nda") {
    const parsed = ndaTemplateGenerationSchema.safeParse(payload);
    if (!parsed.success) throw new ContractTemplateInputError(parsed.error.flatten());
    return {
      bytes: await generateNdaWordDocument(bytes, parsed.data),
      fileName: getGeneratedNdaFileName(parsed.data),
    };
  }

  if (template.formKind === "data_handling") {
    const parsed = dataHandlingTemplateGenerationSchema.safeParse(payload);
    if (!parsed.success) throw new ContractTemplateInputError(parsed.error.flatten());
    return {
      bytes: await generateDataHandlingWordDocument(bytes, parsed.data),
      fileName: getGeneratedDataHandlingFileName(parsed.data),
    };
  }

  const parsed = fdeMasterTemplateGenerationSchema.safeParse(payload);
  if (!parsed.success) throw new ContractTemplateInputError(parsed.error.flatten());
  return {
    bytes: await generateFdeMasterWordDocument(bytes, parsed.data),
    fileName: getGeneratedFdeMasterFileName(parsed.data),
  };
}
