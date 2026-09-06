import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import JSZip from "jszip";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { CONTRACT_TEMPLATES } from "@/lib/contracts/constants";
import { sha256 } from "@/lib/contracts/crypto";
import {
  generateNdaWordDocument,
  getGeneratedNdaFileName,
} from "@/lib/contracts/nda-word-template";
import { createContractArtifacts } from "@/lib/contracts/pdf";
import { validateOriginalPdf } from "@/lib/contracts/pdf-validation";

test("the NDA Word template is packaged intact and retains its review markers", async () => {
  const template = CONTRACT_TEMPLATES["nda-standard-v1"];
  const bytes = await readFile(
    path.join(process.cwd(), "assets", "contracts", "templates", "nda-standard-v1.docx")
  );
  assert.equal(sha256(bytes), template.sourceSha256);

  const archive = await JSZip.loadAsync(bytes);
  const documentXml = await archive.file("word/document.xml")?.async("string");
  assert.ok(documentXml);
  const documentText = documentXml.replace(/<[^>]+>/g, "");
  assert.match(documentText, /秘密保持契約書/);
  assert.match(documentText, /本書2通/);
  assert.match(documentText, /202x年/);
});

test("the NDA Word generator fills parties, date, terms, and electronic execution wording", async () => {
  const sourceBytes = await readFile(
    path.join(process.cwd(), "assets", "contracts", "templates", "nda-standard-v1.docx")
  );
  const input = {
    companyName: "株式会社テスト&パートナーズ",
    companyAddress: "東京都千代田区1-2-3",
    representativeRole: "代表取締役",
    representativeName: "契約 太郎",
    contractDate: "2026-09-10",
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
  assert.match(documentText, /2026年9月10日/);
  assert.match(documentText, /FDE業務委託及びシステム開発の検討/);
  assert.match(documentText, /契約締結日から2年間/);
  assert.match(documentText, /期間満了日の45日前/);
  assert.match(documentText, /さらに2年間更新/);
  assert.match(documentText, /本契約終了後7年間/);
  assert.match(documentText, /甲乙双方が電子的に合意/);
  assert.doesNotMatch(documentText, /本書2通|記名押印|202x年/);
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

test("contract PDFs preserve the original and generate readable Japanese artifacts", async () => {
  const original = await PDFDocument.create();
  const font = await original.embedFont(StandardFonts.Helvetica);
  const page = original.addPage([400, 500]);
  page.drawText("Original contract", { x: 40, y: 440, font, size: 16 });
  const originalBytes = await original.save();
  const validation = await validateOriginalPdf(originalBytes);
  assert.equal(validation.pageCount, 1);

  const source = {
    contractNumber: "MIT-C-2026-00001",
    title: "FDE業務委託基本契約書",
    type: "fde_master" as const,
    companyName: "株式会社テスト",
    signerName: "契約 太郎",
    signerRole: "代表取締役",
    verificationMethod: "company_email_link" as const,
    signedAt: new Date("2026-09-06T03:04:05.000Z"),
    documentSha256: sha256(originalBytes),
    finalAuditHash: "a".repeat(64),
  };
  const { executedBytes, certificateBytes } = await createContractArtifacts(originalBytes, source);
  const executed = await PDFDocument.load(executedBytes);
  const certificate = await PDFDocument.load(certificateBytes);
  assert.equal(executed.getPageCount(), 2);
  assert.equal(certificate.getPageCount(), 1);
  assert.ok(executedBytes.length > originalBytes.length);
  assert.ok(certificateBytes.length > 1000);

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const parsedCertificate = await pdfjs.getDocument({ data: certificateBytes }).promise;
  const certificatePage = await parsedCertificate.getPage(1);
  const text = await certificatePage.getTextContent();
  const extracted = text.items.map((item) => ("str" in item ? item.str : "")).join(" ");
  assert.match(extracted, /電子契約締結証明書/);
  assert.match(extracted, /株式会社テスト/);
});
