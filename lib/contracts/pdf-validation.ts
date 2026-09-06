import { PDFDocument } from "pdf-lib";

export async function validateOriginalPdf(bytes: Uint8Array) {
  if (bytes.length < 5 || Buffer.from(bytes.subarray(0, 5)).toString("ascii") !== "%PDF-") {
    throw new Error("PDFファイルのヘッダーを確認できません。");
  }
  const document = await PDFDocument.load(bytes, {
    ignoreEncryption: false,
    updateMetadata: false,
  });
  if (document.isEncrypted) throw new Error("暗号化されたPDFには対応していません。");
  if (document.getPageCount() < 1) throw new Error("PDFにページがありません。");
  return { pageCount: document.getPageCount() };
}
