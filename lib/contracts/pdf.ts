import { readFile } from "node:fs/promises";
import { join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFPage, PDFFont, rgb } from "pdf-lib";
import { CONTRACT_TYPE_LABELS, type ContractType } from "@/lib/contracts/constants";

const FONT_PATH = join(
  process.cwd(),
  "node_modules",
  "@fontsource",
  "noto-sans-jp",
  "files",
  "noto-sans-jp-japanese-400-normal.woff"
);

export type ContractArtifactSource = {
  contractNumber: string;
  title: string;
  type: ContractType;
  companyName: string;
  signerName: string;
  signerRole: string;
  verificationMethod: "company_email_link" | "jpki";
  signedAt: Date;
  documentSha256: string;
  finalAuditHash: string;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 54;
const BODY_SIZE = 10;
const LINE_HEIGHT = 17;

function formatJst(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date) + " JST";
}

function verificationLabel(method: ContractArtifactSource["verificationMethod"]) {
  return method === "jpki" ? "JPKI本人確認" : "会社メールの署名URLによる確認";
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  let current = "";
  for (const character of text) {
    const candidate = `${current}${character}`;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawWrapped(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  options?: { size?: number; maxWidth?: number; color?: ReturnType<typeof rgb> }
) {
  const size = options?.size ?? BODY_SIZE;
  const maxWidth = options?.maxWidth ?? PAGE_WIDTH - MARGIN * 2;
  const lines = wrapText(text, font, size, maxWidth);
  lines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: y - index * LINE_HEIGHT,
      size,
      font,
      color: options?.color ?? rgb(0.12, 0.14, 0.18),
    });
  });
  return y - lines.length * LINE_HEIGHT;
}

function drawEvidencePage(page: PDFPage, font: PDFFont, source: ContractArtifactSource) {
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 12,
    width: PAGE_WIDTH,
    height: 12,
    color: rgb(0.89, 0.31, 0.16),
  });
  page.drawText("電子契約証跡", {
    x: MARGIN,
    y: PAGE_HEIGHT - 76,
    size: 22,
    font,
    color: rgb(0.08, 0.1, 0.14),
  });
  page.drawText("Make It Tech 内部電子契約システム", {
    x: MARGIN,
    y: PAGE_HEIGHT - 103,
    size: 9,
    font,
    color: rgb(0.4, 0.43, 0.48),
  });

  const rows = [
    ["契約ID", source.contractNumber],
    ["契約書", source.title],
    ["契約種別", CONTRACT_TYPE_LABELS[source.type]],
    ["契約先", source.companyName],
    ["署名者", `${source.signerRole} ${source.signerName}`],
    ["本人確認", verificationLabel(source.verificationMethod)],
    ["契約締結日時", formatJst(source.signedAt)],
  ];
  let y = PAGE_HEIGHT - 155;
  for (const [label, value] of rows) {
    page.drawText(label, { x: MARGIN, y, size: 9, font, color: rgb(0.4, 0.43, 0.48) });
    y = drawWrapped(page, font, value, MARGIN + 110, y, { maxWidth: PAGE_WIDTH - MARGIN * 2 - 110 });
    y -= 12;
  }

  y -= 6;
  page.drawText("Document SHA-256", { x: MARGIN, y, size: 9, font, color: rgb(0.4, 0.43, 0.48) });
  y = drawWrapped(page, font, source.documentSha256, MARGIN, y - 23, { size: 8 });
  page.drawText("Audit Log 最終Hash", { x: MARGIN, y: y - 8, size: 9, font, color: rgb(0.4, 0.43, 0.48) });
  drawWrapped(page, font, source.finalAuditHash, MARGIN, y - 31, { size: 8 });

  page.drawText("このページは契約原本を変更せず、締結時の証跡情報を追加したものです。", {
    x: MARGIN,
    y: 58,
    size: 8,
    font,
    color: rgb(0.4, 0.43, 0.48),
  });
}

async function embedJapaneseFont(document: PDFDocument) {
  document.registerFontkit(fontkit);
  const bytes = await readFile(FONT_PATH);
  return document.embedFont(bytes, { subset: true });
}

export async function createExecutedPdf(originalBytes: Uint8Array, source: ContractArtifactSource) {
  const document = await PDFDocument.load(originalBytes, { updateMetadata: false });
  const font = await embedJapaneseFont(document);
  const evidencePage = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawEvidencePage(evidencePage, font, source);
  document.setTitle(`${source.title}（締結済み）`);
  document.setAuthor("Make It Tech");
  document.setCreator("Make It Tech Internal Contract System");
  document.setProducer("Make It Tech Internal Contract System");
  return document.save({ useObjectStreams: true });
}

export async function createCertificatePdf(source: ContractArtifactSource) {
  const document = await PDFDocument.create();
  const font = await embedJapaneseFont(document);
  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  page.drawRectangle({
    x: 28,
    y: 28,
    width: PAGE_WIDTH - 56,
    height: PAGE_HEIGHT - 56,
    borderWidth: 1,
    borderColor: rgb(0.84, 0.35, 0.2),
  });
  page.drawText("電子契約締結証明書", {
    x: MARGIN,
    y: PAGE_HEIGHT - 88,
    size: 24,
    font,
    color: rgb(0.08, 0.1, 0.14),
  });
  page.drawText("Make It Tech", {
    x: MARGIN,
    y: PAGE_HEIGHT - 116,
    size: 12,
    font,
    color: rgb(0.84, 0.35, 0.2),
  });

  const rows = [
    ["契約ID", source.contractNumber],
    ["契約タイトル", source.title],
    ["契約種別", CONTRACT_TYPE_LABELS[source.type]],
    ["契約当事者", `Make It Tech / ${source.companyName}`],
    ["署名者", source.signerName],
    ["役職", source.signerRole],
    ["認証方式", verificationLabel(source.verificationMethod)],
    ["契約締結日時", formatJst(source.signedAt)],
    ["契約ステータス", "締結済み（completed）"],
  ];
  let y = PAGE_HEIGHT - 170;
  for (const [label, value] of rows) {
    page.drawText(label, { x: MARGIN, y, size: 9, font, color: rgb(0.4, 0.43, 0.48) });
    y = drawWrapped(page, font, value, MARGIN + 110, y, { maxWidth: PAGE_WIDTH - MARGIN * 2 - 110 });
    y -= 10;
  }

  page.drawText("Document SHA-256", { x: MARGIN, y, size: 9, font, color: rgb(0.4, 0.43, 0.48) });
  y = drawWrapped(page, font, source.documentSha256, MARGIN, y - 22, { size: 8 });
  page.drawText("Audit Log 最終Hash", { x: MARGIN, y: y - 7, size: 9, font, color: rgb(0.4, 0.43, 0.48) });
  drawWrapped(page, font, source.finalAuditHash, MARGIN, y - 29, { size: 8 });

  drawWrapped(
    page,
    font,
    "本証明書はMake It Tech独自システムが保存する契約記録を示すものです。外部認証局または認定電子署名サービスが発行した証明書ではありません。",
    MARGIN,
    88,
    { size: 8, color: rgb(0.4, 0.43, 0.48) }
  );

  document.setTitle(`${source.contractNumber} 電子契約締結証明書`);
  document.setAuthor("Make It Tech");
  document.setCreator("Make It Tech Internal Contract System");
  document.setProducer("Make It Tech Internal Contract System");
  return document.save({ useObjectStreams: true });
}

export async function createContractArtifacts(
  originalBytes: Uint8Array,
  source: ContractArtifactSource
) {
  const certificateBytes = await createCertificatePdf(source);
  const [executedDocument, certificateDocument] = await Promise.all([
    PDFDocument.load(originalBytes, { updateMetadata: false }),
    PDFDocument.load(certificateBytes, { updateMetadata: false }),
  ]);
  const [evidencePage] = await executedDocument.copyPages(certificateDocument, [0]);
  executedDocument.addPage(evidencePage);
  executedDocument.setTitle(`${source.title}（締結済み）`);
  executedDocument.setAuthor("Make It Tech");
  executedDocument.setCreator("Make It Tech Internal Contract System");
  executedDocument.setProducer("Make It Tech Internal Contract System");
  const executedBytes = await executedDocument.save({ useObjectStreams: true });
  return { executedBytes, certificateBytes };
}
