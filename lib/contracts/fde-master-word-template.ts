import JSZip from "jszip";
import type { FdeMasterTemplateGenerationInput } from "@/lib/contracts/schemas";
import {
  formatJapaneseContractDate,
  replaceWordTextOnce,
  sanitizeWordFileNamePart,
} from "@/lib/contracts/word-template-xml";

const TEMPLATE_NAME = "FDE業務委託基本契約書";
const ORIGINAL_EXECUTION =
  "本契約締結の証として、本書2通を作成し、甲乙双方が記名押印の上、各1通を保有する。";
const ELECTRONIC_EXECUTION =
  "本契約締結の証として、本契約の電磁的記録を作成し、甲乙双方が電子的に合意の上、各自その電磁的記録を保管する。";

export function getGeneratedFdeMasterFileName(input: FdeMasterTemplateGenerationInput) {
  return `FDE業務委託基本契約書_${sanitizeWordFileNamePart(input.companyName)}_${input.contractDate}.docx`;
}

export async function generateFdeMasterWordDocument(
  templateBytes: Uint8Array,
  input: FdeMasterTemplateGenerationInput
) {
  const archive = await JSZip.loadAsync(templateBytes);
  const documentPart = archive.file("word/document.xml");
  if (!documentPart) {
    throw new Error(`${TEMPLATE_NAME}テンプレートの本文を読み込めません。`);
  }
  let xml = await documentPart.async("string");
  const replace = (source: string, replacement: string, label: string) => {
    xml = replaceWordTextOnce(xml, source, replacement, label, TEMPLATE_NAME);
  };

  replace(
    "株式会社〇〇（以下「甲」という。）",
    `${input.companyName}（以下「甲」という。）`,
    "甲の名称"
  );
  replace("所在地：", `所在地：${input.companyAddress}`, "甲の所在地");
  replace("法人名：株式会社〇〇", `法人名：${input.companyName}`, "甲の法人名");
  replace(
    `代表者：${"　".repeat(16)}印`,
    `代表者：${input.representativeRole} ${input.representativeName}`,
    "甲の代表者"
  );
  replace(
    "契約締結日：202x年y月z日",
    `契約締結日：${formatJapaneseContractDate(input.contractDate)}`,
    "契約締結日"
  );
  replace(
    "2. 甲が支払期日までに金銭債務を履行しない場合、甲は、支払期日の翌日から完済日まで、年〇％の割合による遅延損害金を支払う。",
    `2. 甲が支払期日までに金銭債務を履行しない場合、甲は、支払期日の翌日から完済日まで、年${input.latePaymentInterestRate}％の割合による遅延損害金を支払う。`,
    "遅延損害金率"
  );
  replace(
    "7. 本条の義務は、本契約終了後〇年間存続する。ただし、営業秘密、個人データその他その性質上継続的な保護を要する情報については、その保護を要する期間中存続する。",
    `7. 本条の義務は、本契約終了後${input.confidentialityYears}年間存続する。ただし、営業秘密、個人データその他その性質上継続的な保護を要する情報については、その保護を要する期間中存続する。`,
    "秘密保持義務の存続期間"
  );
  replace(
    "(3) 委託料その他の支払が〇日以上遅延している場合",
    `(3) 委託料その他の支払が${input.suspensionDelayDays}日以上遅延している場合`,
    "業務停止までの支払遅延日数"
  );
  replace(
    "1. 甲又は乙が本契約又は個別契約に違反し、相手方が相当の期間を定めて書面で是正を求めたにもかかわらず、〇日以内に是正されない場合、相手方は本契約又は当該個別契約の全部又は一部を解除することができる。",
    `1. 甲又は乙が本契約又は個別契約に違反し、相手方が相当の期間を定めて書面で是正を求めたにもかかわらず、${input.curePeriodDays}日以内に是正されない場合、相手方は本契約又は当該個別契約の全部又は一部を解除することができる。`,
    "是正期間"
  );
  replace(
    "1. 個別契約が終了し、甲が対象システムの継続利用を希望する場合、乙は、甲に乙への未払債務がないことを条件として、終了日から〇日以内を目安に、合理的な範囲で次の引渡しを行う。",
    `1. 個別契約が終了し、甲が対象システムの継続利用を希望する場合、乙は、甲に乙への未払債務がないことを条件として、終了日から${input.handoverDays}日以内を目安に、合理的な範囲で次の引渡しを行う。`,
    "引渡し期限"
  );
  replace(
    "4. 乙は、甲によるデータ受領又は移行完了を確認した後〇日以内に、法令上保存が必要な場合を除き、乙が管理する環境から甲データを削除する。",
    `4. 乙は、甲によるデータ受領又は移行完了を確認した後${input.dataDeletionDays}日以内に、法令上保存が必要な場合を除き、乙が管理する環境から甲データを削除する。`,
    "データ削除期限"
  );
  replace(
    "1. 本契約の有効期間は、契約締結日から〇年間とする。",
    `1. 本契約の有効期間は、契約締結日から${input.termYears}年間とする。`,
    "契約期間"
  );
  replace(
    "2. 期間満了日の〇日前までに甲又は乙から書面による終了の通知がない場合、本契約は同一条件でさらに〇年間更新され、以後も同様とする。",
    `2. 期間満了日の${input.renewalNoticeDays}日前までに甲又は乙から書面による終了の通知がない場合、本契約は同一条件でさらに${input.renewalYears}年間更新され、以後も同様とする。`,
    "自動更新条件"
  );
  replace(
    "3. 甲又は乙は、相手方に〇日前までに書面で通知することにより、本契約のみを将来に向かって終了させることができる。ただし、終了時点で有効な個別契約には影響せず、当該個別契約が終了するまで本契約の規定を適用する。",
    `3. 甲又は乙は、相手方に${input.terminationNoticeDays}日前までに書面で通知することにより、本契約のみを将来に向かって終了させることができる。ただし、終了時点で有効な個別契約には影響せず、当該個別契約が終了するまで本契約の規定を適用する。`,
    "任意解約通知期限"
  );
  replace(
    "2. 本契約又は個別契約に関連して訴訟の必要が生じた場合、〇地方裁判所又は〇簡易裁判所を第一審の専属的合意管轄裁判所とする。",
    `2. 本契約又は個別契約に関連して訴訟の必要が生じた場合、${input.jurisdiction}地方裁判所又は${input.jurisdiction}簡易裁判所を第一審の専属的合意管轄裁判所とする。`,
    "専属的合意管轄裁判所"
  );
  replace(ORIGINAL_EXECUTION, ELECTRONIC_EXECUTION, "電子締結条項");
  replace(
    `氏名：尾形友輝${"　".repeat(15)}印`,
    "氏名：尾形友輝",
    "乙の押印欄"
  );

  archive.file("word/document.xml", xml);
  return archive.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
}
