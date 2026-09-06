import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import JSZip from "jszip";
import { CONTRACT_TEMPLATES } from "@/lib/contracts/constants";
import { sha256 } from "@/lib/contracts/crypto";
import {
  generateNdaWordDocument,
  getGeneratedNdaFileName,
} from "@/lib/contracts/nda-word-template";
import {
  generateDataHandlingWordDocument,
  getGeneratedDataHandlingFileName,
} from "@/lib/contracts/data-handling-word-template";
import {
  generateFdeMasterWordDocument,
  getGeneratedFdeMasterFileName,
} from "@/lib/contracts/fde-master-word-template";

test("the NDA Word template is intact and fills every supported field", async () => {
  const template = CONTRACT_TEMPLATES["nda-standard-v1"];
  const sourceBytes = await readFile(
    path.join(process.cwd(), "assets", "contracts", "templates", "nda-standard-v1.docx")
  );
  assert.equal(sha256(sourceBytes), template.sourceSha256);
  const input = {
    companyName: "株式会社テスト&パートナーズ",
    companyAddress: "東京都千代田区1-2-3",
    representativeRole: "代表取締役",
    representativeName: "契約 太郎",
    effectiveDate: "2026-09-10",
    contractPurpose: "FDE業務委託及びシステム開発の検討",
    termYears: 2,
    terminationNoticeDays: 45,
    renewalYears: 2,
    confidentialityYears: 7,
    electronicExecutionAccepted: true as const,
  };
  const generatedBytes = await generateNdaWordDocument(sourceBytes, input);
  const [sourceArchive, generatedArchive] = await Promise.all([
    JSZip.loadAsync(sourceBytes),
    JSZip.loadAsync(generatedBytes),
  ]);
  const documentXml = await generatedArchive.file("word/document.xml")?.async("string");
  assert.ok(documentXml);
  const documentText = documentXml.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");
  assert.match(documentText, /株式会社テスト&パートナーズ（以下「甲」という。）/);
  assert.match(documentText, /所在地：東京都千代田区1-2-3/);
  assert.match(documentText, /代表者：代表取締役 契約 太郎/);
  assert.match(documentText, /契約発効日：2026年9月10日/);
  assert.match(documentText, /FDE業務委託及びシステム開発の検討/);
  assert.match(documentText, /契約発効日から2年間/);
  assert.match(documentText, /期間満了日の45日前/);
  assert.match(documentText, /さらに2年間更新/);
  assert.match(documentText, /本契約終了後7年間/);
  assert.match(documentText, /甲乙双方が電子的に合意/);
  assert.doesNotMatch(documentText, /契約締結日|本書2通|記名押印|202x年/);
  assert.equal(
    getGeneratedNdaFileName(input),
    "秘密保持契約書_株式会社テスト&パートナーズ_2026-09-10.docx"
  );

  const preservedParts = Object.keys(sourceArchive.files).filter(
    (partName) => partName !== "word/document.xml" && !sourceArchive.files[partName].dir
  );
  for (const partName of preservedParts) {
    const [sourcePart, generatedPart] = await Promise.all([
      sourceArchive.file(partName)?.async("uint8array"),
      generatedArchive.file(partName)?.async("uint8array"),
    ]);
    assert.deepEqual(generatedPart, sourcePart, `${partName} must remain unchanged`);
  }
});

test("the data handling Word template is intact and fills parties, data conditions, and electronic execution wording", async () => {
  const template = CONTRACT_TEMPLATES["data-handling-addendum-standard-v1"];
  const sourceBytes = await readFile(
    path.join(
      process.cwd(),
      "assets",
      "contracts",
      "templates",
      "data-handling-addendum-standard-v1.docx"
    )
  );
  assert.equal(sha256(sourceBytes), template.sourceSha256);

  const input = {
    companyName: "株式会社テスト&パートナーズ",
    companyAddress: "東京都千代田区1-2-3",
    representativeRole: "代表取締役",
    representativeName: "契約 太郎",
    effectiveDate: "2026-09-10",
    targetData: "顧客情報、問い合わせ履歴",
    processingPurpose: "問い合わせ分析と業務改善",
    dataSubjects: "顧客、取引先担当者",
    sensitivePersonalInformation: "無",
    specificPersonalInformation: "対象外",
    systemsUsed: "Google Cloud、社内分析基盤",
    storageLocation: "日本国内",
    retentionPeriod: "契約終了後30日以内",
    accessScope: "業務担当者と管理者",
    subcontractors: "なし",
    thirdPartyServices: "Google Cloud",
    overseasUse: "なし",
    incidentContact: "発見後24時間以内に指定担当者へ連絡",
    endOfTermHandling: "PDFで返却後、30日以内に削除",
    additionalSecurityRequirements: "多要素認証、保存時暗号化",
    specialProvisions: "なし",
    electronicExecutionAccepted: true as const,
  };
  const generatedBytes = await generateDataHandlingWordDocument(sourceBytes, input);
  const [sourceArchive, generatedArchive] = await Promise.all([
    JSZip.loadAsync(sourceBytes),
    JSZip.loadAsync(generatedBytes),
  ]);
  const documentXml = await generatedArchive.file("word/document.xml")?.async("string");
  assert.ok(documentXml);
  const documentText = documentXml
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&");
  assert.match(documentText, /株式会社テスト&パートナーズ（以下「甲」という。）/);
  assert.match(documentText, /所在地：東京都千代田区1-2-3/);
  assert.match(documentText, /代表者：代表取締役 契約 太郎/);
  assert.match(documentText, /契約発効日：2026年9月10日/);
  for (const expected of [
    input.targetData,
    input.processingPurpose,
    input.dataSubjects,
    input.sensitivePersonalInformation,
    input.specificPersonalInformation,
    input.systemsUsed,
    input.storageLocation,
    input.retentionPeriod,
    input.accessScope,
    input.subcontractors,
    input.thirdPartyServices,
    input.overseasUse,
    input.incidentContact,
    input.endOfTermHandling,
    input.additionalSecurityRequirements,
    input.specialProvisions,
  ]) {
    assert.ok(documentText.includes(expected), `${expected} must be inserted`);
  }
  assert.match(documentText, /甲乙双方が電子的に合意/);
  for (const editingGuide of [
    "別紙1　個別契約に記載するデータ条件（標準項目）",
    "案件固有の条件がある場合は、個別契約書又はSOWに以下のうち必要な項目を記載する。本別紙に直接記入して合意する運用としてもよい。",
    "例：従業員基本情報、勤怠、顧客情報、売上データ、問い合わせ履歴等",
    "例：業務分析、システム構築、データ移行、AI検索、集計・分析等",
    "例：従業員、顧客、取引先担当者等",
    "有・無／取り扱う場合は対象と必要措置を記載",
    "原則対象外。取り扱う場合のみ明示し、追加条件を記載",
    "クラウド、DB、AI、API、SaaS等",
    "指定がある場合に記載",
    "担当者、権限レベル、利用期間等",
    "対象データを継続的に取り扱う再委託先がある場合に記載",
    "特定サービスの利用可否・条件を限定する場合に記載",
    "国・地域の限定又は禁止がある場合に記載",
    "個別の初報期限、担当者、電話・メール等",
    "返却形式、移行先、削除期限等",
    "IP制限、専用端末、VPN、暗号化方式、ログ保存期間等",
    "本特約と異なる条件を定める場合は、優先する条項と内容を明示",
  ]) {
    assert.ok(!documentText.includes(editingGuide), `${editingGuide} must not remain`);
  }
  assert.match(documentText, /別紙1　データ取扱条件/);
  assert.match(documentText, /本別紙に定めるデータ取扱条件は、本特約の一部を構成する。/);
  assert.doesNotMatch(documentText, /契約締結日|株式会社〇〇|〇年〇月〇日|本書2通/);
  assert.equal(
    getGeneratedDataHandlingFileName(input),
    "個人情報・データ取扱特約_株式会社テスト&パートナーズ_2026-09-10.docx"
  );

  const preservedParts = Object.keys(sourceArchive.files).filter(
    (partName) => partName !== "word/document.xml" && !sourceArchive.files[partName].dir
  );
  for (const partName of preservedParts) {
    const [sourcePart, generatedPart] = await Promise.all([
      sourceArchive.file(partName)?.async("uint8array"),
      generatedArchive.file(partName)?.async("uint8array"),
    ]);
    assert.deepEqual(generatedPart, sourcePart, `${partName} must remain unchanged`);
  }
});

test("the FDE master Word template is intact and fills every contract placeholder", async () => {
  const template = CONTRACT_TEMPLATES["fde-master-standard-v1"];
  const sourceBytes = await readFile(
    path.join(process.cwd(), "assets", "contracts", "templates", "fde-master-standard-v1.docx")
  );
  assert.equal(sha256(sourceBytes), template.sourceSha256);

  const input = {
    companyName: "株式会社テスト&パートナーズ",
    companyAddress: "東京都千代田区1-2-3",
    representativeRole: "代表取締役",
    representativeName: "契約 太郎",
    effectiveDate: "2026-09-10",
    latePaymentInterestRate: 3.5,
    confidentialityYears: 5,
    suspensionDelayDays: 30,
    curePeriodDays: 14,
    handoverDays: 30,
    dataDeletionDays: 30,
    termYears: 2,
    renewalNoticeDays: 60,
    renewalYears: 1,
    terminationNoticeDays: 90,
    jurisdiction: "東京",
    electronicExecutionAccepted: true as const,
  };
  const generatedBytes = await generateFdeMasterWordDocument(sourceBytes, input);
  const [sourceArchive, generatedArchive] = await Promise.all([
    JSZip.loadAsync(sourceBytes),
    JSZip.loadAsync(generatedBytes),
  ]);
  const documentXml = await generatedArchive.file("word/document.xml")?.async("string");
  assert.ok(documentXml);
  const documentText = documentXml
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&");
  for (const expected of [
    "株式会社テスト&パートナーズ（以下「甲」という。）",
    "所在地：東京都千代田区1-2-3",
    "代表者：代表取締役 契約 太郎",
    "契約発効日：2026年9月10日",
    "年3.5％の割合による遅延損害金",
    "本契約終了後5年間存続",
    "支払が30日以上遅延",
    "14日以内に是正されない場合",
    "終了日から30日以内を目安",
    "移行完了を確認した後30日以内",
    "契約発効日から2年間",
    "期間満了日の60日前",
    "さらに1年間更新",
    "相手方に90日前までに書面で通知",
    "東京地方裁判所又は東京簡易裁判所",
    "甲乙双方が電子的に合意",
  ]) {
    assert.ok(documentText.includes(expected), `${expected} must be inserted`);
  }
  assert.doesNotMatch(documentText, /契約締結日|〇|202x年y月z日|本書2通/);
  assert.equal(
    getGeneratedFdeMasterFileName(input),
    "FDE業務委託基本契約書_株式会社テスト&パートナーズ_2026-09-10.docx"
  );

  const preservedParts = Object.keys(sourceArchive.files).filter(
    (partName) => partName !== "word/document.xml" && !sourceArchive.files[partName].dir
  );
  for (const partName of preservedParts) {
    const [sourcePart, generatedPart] = await Promise.all([
      sourceArchive.file(partName)?.async("uint8array"),
      generatedArchive.file(partName)?.async("uint8array"),
    ]);
    assert.deepEqual(generatedPart, sourcePart, `${partName} must remain unchanged`);
  }
});
