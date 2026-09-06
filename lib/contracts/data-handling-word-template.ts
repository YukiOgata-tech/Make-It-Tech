import JSZip from "jszip";
import type { DataHandlingTemplateGenerationInput } from "@/lib/contracts/schemas";
import {
  formatJapaneseContractDate,
  getWordText,
  replaceWordTextOnce,
  sanitizeWordFileNamePart,
} from "@/lib/contracts/word-template-xml";

const TEMPLATE_NAME = "個人情報・データ取扱特約";

const ORIGINAL_EXECUTION =
  "本特約締結の証として、本書2通を作成し、甲乙双方が記名押印の上、各1通を保有する。";
const ELECTRONIC_EXECUTION =
  "本特約締結の証として、本特約の電磁的記録を作成し、甲乙双方が電子的に合意の上、各自その電磁的記録を保管する。";
const ORIGINAL_APPENDIX_HEADING = "別紙1　個別契約に記載するデータ条件（標準項目）";
const FINAL_APPENDIX_HEADING = "別紙1　データ取扱条件";
const ORIGINAL_APPENDIX_GUIDE =
  "案件固有の条件がある場合は、個別契約書又はSOWに以下のうち必要な項目を記載する。本別紙に直接記入して合意する運用としてもよい。";
const FINAL_APPENDIX_INTRO =
  "本別紙に定めるデータ取扱条件は、本特約の一部を構成する。";

const DATA_CONDITION_REPLACEMENTS = [
  ["対象データ", "例：従業員基本情報、勤怠、顧客情報、売上データ、問い合わせ履歴等", "targetData"],
  ["利用目的・処理内容", "例：業務分析、システム構築、データ移行、AI検索、集計・分析等", "processingPurpose"],
  ["対象者", "例：従業員、顧客、取引先担当者等", "dataSubjects"],
  ["要配慮個人情報", "有・無／取り扱う場合は対象と必要措置を記載", "sensitivePersonalInformation"],
  ["特定個人情報", "原則対象外。取り扱う場合のみ明示し、追加条件を記載", "specificPersonalInformation"],
  ["利用システム", "クラウド、DB、AI、API、SaaS等", "systemsUsed"],
  ["保存場所・地域", "指定がある場合に記載", "storageLocation"],
  ["保存期間", "指定がある場合に記載", "retentionPeriod"],
  ["アクセス権限", "担当者、権限レベル、利用期間等", "accessScope"],
  ["再委託先", "対象データを継続的に取り扱う再委託先がある場合に記載", "subcontractors"],
  ["第三者サービス", "特定サービスの利用可否・条件を限定する場合に記載", "thirdPartyServices"],
  ["国外利用", "国・地域の限定又は禁止がある場合に記載", "overseasUse"],
  ["事故時の連絡", "個別の初報期限、担当者、電話・メール等", "incidentContact"],
  ["終了時の取扱い", "返却形式、移行先、削除期限等", "endOfTermHandling"],
  ["追加セキュリティ要件", "IP制限、専用端末、VPN、暗号化方式、ログ保存期間等", "additionalSecurityRequirements"],
  ["特記事項", "本特約と異なる条件を定める場合は、優先する条項と内容を明示", "specialProvisions"],
] as const satisfies ReadonlyArray<
  readonly [string, string, keyof DataHandlingTemplateGenerationInput]
>;

function replaceTableValue(
  xml: string,
  rowLabel: string,
  originalValue: string,
  replacement: string
) {
  const rows = [...xml.matchAll(/<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g)].filter((match) => {
    const firstCell = match[0].match(/<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/);
    return firstCell ? getWordText(firstCell[0]) === rowLabel : false;
  });
  if (rows.length !== 1 || rows[0].index === undefined) {
    throw new Error(`個人情報・データ取扱特約テンプレートの${rowLabel}欄を一意に特定できません。`);
  }
  const row = rows[0];
  const updatedRow = replaceWordTextOnce(
    row[0],
    originalValue,
    replacement,
    rowLabel,
    TEMPLATE_NAME
  );
  return xml.slice(0, row.index) + updatedRow + xml.slice(row.index + row[0].length);
}

export function getGeneratedDataHandlingFileName(input: DataHandlingTemplateGenerationInput) {
  const safeCompanyName = sanitizeWordFileNamePart(input.companyName);
  return `個人情報・データ取扱特約_${safeCompanyName}_${input.effectiveDate}.docx`;
}

export async function generateDataHandlingWordDocument(
  templateBytes: Uint8Array,
  input: DataHandlingTemplateGenerationInput
) {
  const archive = await JSZip.loadAsync(templateBytes);
  const documentPart = archive.file("word/document.xml");
  if (!documentPart) {
    throw new Error("個人情報・データ取扱特約テンプレートの本文を読み込めません。");
  }
  let xml = await documentPart.async("string");

  xml = replaceWordTextOnce(xml, "株式会社〇〇", input.companyName, "甲の名称", TEMPLATE_NAME);
  xml = replaceWordTextOnce(xml, "所在地：", `所在地：${input.companyAddress}`, "甲の所在地", TEMPLATE_NAME);
  xml = replaceWordTextOnce(xml, "法人名：株式会社", `法人名：${input.companyName}`, "甲の法人名", TEMPLATE_NAME);
  xml = replaceWordTextOnce(
    xml,
    `代表者：${"　".repeat(16)}印`,
    `代表者：${input.representativeRole} ${input.representativeName}`,
    "甲の代表者",
    TEMPLATE_NAME
  );
  xml = replaceWordTextOnce(
    xml,
    "契約締結日：〇年〇月〇日",
    `契約発効日：${formatJapaneseContractDate(input.effectiveDate)}`,
    "契約発効日",
    TEMPLATE_NAME
  );
  xml = replaceWordTextOnce(
    xml,
    ORIGINAL_APPENDIX_HEADING,
    FINAL_APPENDIX_HEADING,
    "別紙見出し",
    TEMPLATE_NAME
  );
  xml = replaceWordTextOnce(
    xml,
    ORIGINAL_APPENDIX_GUIDE,
    FINAL_APPENDIX_INTRO,
    "別紙案内文",
    TEMPLATE_NAME
  );
  xml = replaceWordTextOnce(xml, ORIGINAL_EXECUTION, ELECTRONIC_EXECUTION, "電子締結条項", TEMPLATE_NAME);
  xml = replaceWordTextOnce(
    xml,
    `氏名：尾形友輝${"　".repeat(15)}印`,
    "氏名：尾形友輝",
    "乙の押印欄",
    TEMPLATE_NAME
  );

  for (const [rowLabel, originalValue, fieldName] of DATA_CONDITION_REPLACEMENTS) {
    xml = replaceTableValue(xml, rowLabel, originalValue, input[fieldName].trim());
  }

  archive.file("word/document.xml", xml);
  return archive.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
}
