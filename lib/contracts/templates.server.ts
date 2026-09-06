import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  CONTRACT_TEMPLATES,
  type ContractTemplateId,
} from "@/lib/contracts/constants";
import { sha256 } from "@/lib/contracts/crypto";

const TEMPLATE_FILES: Record<ContractTemplateId, string> = {
  "nda-standard-v1": "nda-standard-v1.docx",
  "data-handling-addendum-standard-v1": "data-handling-addendum-standard-v1.docx",
  "fde-master-standard-v1": "fde-master-standard-v1.docx",
};

export async function readContractTemplate(templateId: ContractTemplateId) {
  const template = CONTRACT_TEMPLATES[templateId];
  const filePath = path.join(
    process.cwd(),
    "assets",
    "contracts",
    "templates",
    TEMPLATE_FILES[templateId]
  );
  const bytes = await readFile(filePath);
  const actualSha256 = sha256(bytes);
  if (actualSha256 !== template.sourceSha256) {
    throw new Error("契約テンプレートの整合性を確認できません。");
  }
  return { template, bytes };
}
