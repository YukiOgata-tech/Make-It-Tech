import "server-only";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { CONTRACT_PDF_MAX_BYTES } from "@/lib/contracts/constants";
import { validateOriginalPdf } from "@/lib/contracts/pdf-validation";

const CONVERSION_TIMEOUT_MS = 60_000;
const execFileAsync = promisify(execFile);

function getConversionEndpoint(configured: string) {
  const baseUrl = new URL(configured);
  if (!baseUrl.pathname.endsWith("/forms/libreoffice/convert")) {
    baseUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/forms/libreoffice/convert`;
  }
  return baseUrl.toString();
}

async function convertWithLocalMicrosoftWord(wordBytes: Uint8Array) {
  const workingDirectory = await mkdtemp(join(tmpdir(), "contract-pdf-"));
  const wordPath = join(workingDirectory, "source.docx");
  const pdfPath = join(workingDirectory, "converted.pdf");
  const script = `
$ErrorActionPreference = "Stop"
$word = New-Object -ComObject Word.Application
try {
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Open($env:CONTRACT_WORD_INPUT, $false, $true)
  try {
    $document.SaveAs2($env:CONTRACT_PDF_OUTPUT, 17)
  } finally {
    $document.Close($false)
  }
} finally {
  $word.Quit()
}
`;

  try {
    await writeFile(wordPath, wordBytes);
    await execFileAsync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
      {
        env: {
          ...process.env,
          CONTRACT_WORD_INPUT: wordPath,
          CONTRACT_PDF_OUTPUT: pdfPath,
        },
        timeout: 120_000,
        windowsHide: true,
      }
    );
    return new Uint8Array(await readFile(pdfPath));
  } catch (error) {
    if (
      error instanceof Error &&
      "killed" in error &&
      (error as Error & { killed?: boolean }).killed
    ) {
      throw new Error("Microsoft WordによるPDF変換がタイムアウトしました。");
    }
    throw new Error(
      `Microsoft WordでPDFへ変換できませんでした。${error instanceof Error ? ` ${error.message}` : ""}`
    );
  } finally {
    await rm(workingDirectory, { recursive: true, force: true });
  }
}

async function convertWithGotenberg(
  wordBytes: Uint8Array,
  fileName: string,
  configuredUrl: string
) {
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
    const response = await fetch(getConversionEndpoint(configuredUrl), {
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

    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("PDF変換がタイムアウトしました。もう一度お試しください。");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function convertWordToPdf(wordBytes: Uint8Array, fileName: string) {
  const configuredUrl = process.env.CONTRACT_PDF_CONVERTER_URL?.trim();
  let pdfBytes: Uint8Array;

  if (configuredUrl) {
    pdfBytes = await convertWithGotenberg(wordBytes, fileName, configuredUrl);
  } else if (process.platform === "win32") {
    pdfBytes = await convertWithLocalMicrosoftWord(wordBytes);
  } else {
    throw new Error(
      "PDF自動変換が未設定です。CONTRACT_PDF_CONVERTER_URLを設定してください。"
    );
  }

  if (pdfBytes.length > CONTRACT_PDF_MAX_BYTES) {
    throw new Error("生成されたPDFが4MBを超えています。");
  }
  await validateOriginalPdf(pdfBytes);
  return pdfBytes;
}
