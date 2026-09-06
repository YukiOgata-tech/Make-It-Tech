import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import JSZip from "jszip";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { buildAuditChain, verifyAuditChain } from "@/lib/contracts/audit";
import { CONTRACT_TEMPLATES } from "@/lib/contracts/constants";
import { canonicalJson, createSigningToken, sha256 } from "@/lib/contracts/crypto";
import { isAllowedSameOriginRequest } from "@/lib/contracts/origin";
import {
  generateNdaWordDocument,
  getGeneratedNdaFileName,
} from "@/lib/contracts/nda-word-template";
import { createContractArtifacts } from "@/lib/contracts/pdf";
import { validateOriginalPdf } from "@/lib/contracts/pdf-validation";
import { acceptContractSchema, createContractSchema } from "@/lib/contracts/schemas";

test("canonical JSON is stable regardless of object key order", () => {
  const left = canonicalJson({ z: 1, nested: { b: true, a: "value" }, list: [2, 1] });
  const right = canonicalJson({ list: [2, 1], nested: { a: "value", b: true }, z: 1 });
  assert.equal(left, right);
  assert.equal(sha256(left), sha256(right));
});

test("signing tokens use 256 bits and only their hash needs persistence", () => {
  const first = createSigningToken();
  const second = createSigningToken();
  assert.equal(Buffer.from(first.token, "base64url").byteLength, 32);
  assert.equal(first.tokenHash.length, 64);
  assert.notEqual(first.token, second.token);
  assert.notEqual(first.tokenHash, second.tokenHash);
  assert.equal(first.tokenHash, sha256(first.token));
});

test("audit events form a deterministic, ordered hash chain", () => {
  const occurredAt = new Date("2026-09-06T00:00:00.000Z");
  const chain = buildAuditChain("contract-1", "", 0, [
    { eventId: "event-1", eventType: "CONTRACT_CREATED", occurredAt, actorType: "admin", actorId: "admin-1" },
    { eventId: "event-2", eventType: "DOCUMENT_UPLOADED", occurredAt, actorType: "admin", actorId: "admin-1", metadata: { documentSha256: "abc" } },
  ]);
  assert.equal(chain.events.length, 2);
  assert.equal(chain.events[1].previousHash, chain.events[0].eventHash);
  assert.equal(chain.lastHash, chain.events[1].eventHash);
  assert.equal(chain.lastSequence, 2);
  assert.equal(verifyAuditChain(chain.events, chain.lastHash).valid, true);

  const changed = buildAuditChain("contract-1", "", 0, [
    { eventId: "event-1", eventType: "CONTRACT_CREATED", occurredAt, actorType: "admin", actorId: "admin-1" },
    { eventId: "event-2", eventType: "DOCUMENT_UPLOADED", occurredAt, actorType: "admin", actorId: "admin-1", metadata: { documentSha256: "changed" } },
  ]);
  assert.notEqual(changed.lastHash, chain.lastHash);
  assert.equal(verifyAuditChain(changed.events, chain.lastHash).valid, false);
});

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

test("contract inputs reject missing signers, mismatched consent, and unknown templates", () => {
  const validContract = {
    title: "秘密保持契約書",
    type: "nda",
    internalMemo: "",
    companyName: "株式会社テスト",
    corporateNumber: "",
    companyAddress: "",
    signerName: "契約 太郎",
    signerRole: "代表取締役",
    signerEmail: "contract@example.com",
    sourceTemplateId: "nda-standard-v1",
  };
  assert.equal(createContractSchema.safeParse(validContract).success, true);
  assert.equal(createContractSchema.safeParse({ ...validContract, signerName: "" }).success, false);
  assert.equal(createContractSchema.safeParse({ ...validContract, sourceTemplateId: "unknown" }).success, false);
  assert.equal(acceptContractSchema.safeParse({
    identityAccepted: true,
    authorityAccepted: true,
    reviewedAccepted: true,
    consentAccepted: false,
  }).success, false);
});

test("state-changing requests require the same origin", () => {
  assert.equal(isAllowedSameOriginRequest(new Request("https://admin-console.make-it-tech.com/api/admin/contracts", {
    headers: { origin: "https://admin-console.make-it-tech.com" },
  })), true);
  assert.equal(isAllowedSameOriginRequest(new Request("https://admin-console.make-it-tech.com/api/admin/contracts", {
    headers: { origin: "https://attacker.example" },
  })), false);
  assert.equal(isAllowedSameOriginRequest(new Request("https://admin-console.make-it-tech.com/api/admin/contracts")), false);
});

test("Firebase client rules deny direct access to contract data and files", async () => {
  const [firestoreRules, storageRules] = await Promise.all([
    readFile(path.join(process.cwd(), "firestore.rules"), "utf8"),
    readFile(path.join(process.cwd(), "storage.rules"), "utf8"),
  ]);
  assert.match(firestoreRules, /match \/contracts\/\{contractId\}[\s\S]*?allow read, write: if false;/);
  assert.match(firestoreRules, /match \/contractTokens\/\{tokenId\}[\s\S]*?allow read, write: if false;/);
  assert.match(storageRules, /match \/contracts\/\{contractId\}\/\{fileName\}[\s\S]*?allow read, write: if false;/);
});

test("invalid PDF input is rejected before parsing", async () => {
  await assert.rejects(
    validateOriginalPdf(new TextEncoder().encode("not a pdf")),
    /PDFファイルのヘッダー/
  );
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
