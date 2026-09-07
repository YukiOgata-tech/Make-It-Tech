import "server-only";
import { CONTRACT_PDF_MAX_BYTES } from "@/lib/contracts/constants";
import { validateOriginalPdf } from "@/lib/contracts/pdf-validation";

const CONVERSION_TIMEOUT_MS = 60_000;

function getConversionEndpoint() {
  const configured = process.env.CONTRACT_PDF_CONVERTER_URL?.trim();
  if (!configured) {
    throw new Error(
      "PDF自動変換が未設定です。CONTRACT_PDF_CONVERTER_URLを設定してください。"
    );
  }

  const baseUrl = new URL(configured);
  if (!baseUrl.pathname.endsWith("/forms/libreoffice/convert")) {
    baseUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/forms/libreoffice/convert`;
  }
  return baseUrl.toString();
}

export async function convertWordToPdf(wordBytes: Uint8Array, fileName: string) {
  const formData = new FormData();
  formData.append(
    "files",
    new Blob([Buffer.from(wordBytes)], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    fileName
  );
  formData.append("updateIndexes", "true");
  formData.append("exportFormFields", "false");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONVERSION_TIMEOUT_MS);
  try {
    const token = process.env.CONTRACT_PDF_CONVERTER_BEARER_TOKEN?.trim();
    const response = await fetch(getConversionEndpoint(), {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`PDF変換サービスがエラーを返しました（${response.status}）。`);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/pdf")) {
      throw new Error("PDF変換サービスからPDF以外の応答が返されました。");
    }

    const pdfBytes = new Uint8Array(await response.arrayBuffer());
    if (pdfBytes.length > CONTRACT_PDF_MAX_BYTES) {
      throw new Error("生成されたPDFが4MBを超えています。");
    }
    await validateOriginalPdf(pdfBytes);
    return pdfBytes;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("PDF変換がタイムアウトしました。もう一度お試しください。");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
