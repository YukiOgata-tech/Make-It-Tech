import JSZip from "jszip";
import type { NdaTemplateGenerationInput } from "@/lib/contracts/schemas";

const ORIGINAL_PURPOSE =
  "本契約は、甲乙間における業務提携、業務委託、FDE（Forward Deployed Engineering）、システム開発、DX・AI導入支援、その他これらに関連する取引又はその検討（以下「本目的」という。）に際して開示される秘密情報を適切に保護するための基本条件を定めることを目的とする。";
const ORIGINAL_TERM =
  "1. 本契約の有効期間は、契約締結日から3年間とする。ただし、期間満了日の30日前までに甲又は乙から書面による終了の通知がない場合、本契約はさらに1年間更新され、以後も同様とする。";
const ORIGINAL_CONFIDENTIALITY_TERM =
  "2. 第3条その他秘密情報の保護に関する義務は、本契約終了後5年間存続する。";
const ORIGINAL_EXECUTION =
  "本契約締結の証として、本書2通を作成し、甲乙双方が記名押印の上、各1通を保有する。";
const ELECTRONIC_EXECUTION =
  "本契約締結の証として、本契約の電磁的記録を作成し、甲乙双方が電子的に合意の上、各自その電磁的記録を保管する。";

function escapeXmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function replaceTextOnce(xml: string, source: string, replacement: string, label: string) {
  const escapedSource = escapeXmlText(source);
  const marker = `<w:t>${escapedSource}</w:t>`;
  const markerWithSpace = `<w:t xml:space="preserve">${escapedSource}</w:t>`;
  const replacementTag = `<w:t>${escapeXmlText(replacement)}</w:t>`;
  const occurrences = xml.split(marker).length - 1 + xml.split(markerWithSpace).length - 1;
  if (occurrences !== 1) {
    throw new Error(`NDAテンプレートの${label}を一意に特定できません。`);
  }
  if (xml.includes(marker)) return xml.replace(marker, replacementTag);
  return xml.replace(markerWithSpace, replacementTag);
}

function formatContractDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year: String(year), monthDay: `年${month}月${day}日` };
}

export function getGeneratedNdaFileName(input: NdaTemplateGenerationInput) {
  const safeCompanyName = input.companyName
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "契約先";
  return `秘密保持契約書_${safeCompanyName}_${input.contractDate}.docx`;
}

export async function generateNdaWordDocument(
  templateBytes: Uint8Array,
  input: NdaTemplateGenerationInput
) {
  const archive = await JSZip.loadAsync(templateBytes);
  const documentPart = archive.file("word/document.xml");
  if (!documentPart) throw new Error("NDAテンプレートの本文を読み込めません。");
  let xml = await documentPart.async("string");
  const date = formatContractDate(input.contractDate);

  xml = replaceTextOnce(
    xml,
    "＿＿＿＿＿＿＿＿＿＿＿＿（以下「甲」という。）と、",
    `${input.companyName}（以下「甲」という。）と、`,
    "甲の名称"
  );
  xml = replaceTextOnce(xml, "所在地：", `所在地：${input.companyAddress}`, "甲の所在地");
  xml = replaceTextOnce(xml, "法人名・商号：", `法人名・商号：${input.companyName}`, "甲の法人名");
  xml = replaceTextOnce(
    xml,
    `代表者：${"　".repeat(16)}印`,
    `代表者：${input.representativeRole} ${input.representativeName}`,
    "甲の代表者"
  );
  xml = replaceTextOnce(xml, "202x", date.year, "契約年");
  xml = replaceTextOnce(xml, "年　　月　　日", date.monthDay, "契約月日");
  xml = replaceTextOnce(xml, ORIGINAL_EXECUTION, ELECTRONIC_EXECUTION, "電子締結条項");
  xml = replaceTextOnce(xml, "　".repeat(10) + "印", "", "乙の押印欄");

  if (input.contractPurpose) {
    xml = replaceTextOnce(
      xml,
      ORIGINAL_PURPOSE,
      `本契約は、甲乙間における${input.contractPurpose}（以下「本目的」という。）に際して開示される秘密情報を適切に保護するための基本条件を定めることを目的とする。`,
      "契約目的"
    );
  }

  xml = replaceTextOnce(
    xml,
    ORIGINAL_TERM,
    `1. 本契約の有効期間は、契約締結日から${input.termYears}年間とする。ただし、期間満了日の${input.terminationNoticeDays}日前までに甲又は乙から書面による終了の通知がない場合、本契約はさらに${input.renewalYears}年間更新され、以後も同様とする。`,
    "有効期間"
  );
  xml = replaceTextOnce(
    xml,
    ORIGINAL_CONFIDENTIALITY_TERM,
    `2. 第3条その他秘密情報の保護に関する義務は、本契約終了後${input.confidentialityYears}年間存続する。`,
    "秘密保持義務の存続期間"
  );

  archive.file("word/document.xml", xml);
  return archive.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
}
