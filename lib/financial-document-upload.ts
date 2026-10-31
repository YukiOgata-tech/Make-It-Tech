import sharp from "sharp";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const PDF_TYPE = "application/pdf";

export async function prepareFinancialDocument(file: File, maxBytes: number) {
  if (![...IMAGE_TYPES, PDF_TYPE].includes(file.type as (typeof IMAGE_TYPES)[number] | typeof PDF_TYPE)) {
    throw new Error(`${file.name}は対応していない形式です。`);
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(`${file.name}は${Math.floor(maxBytes / 1024 / 1024)}MB以下にしてください。`);
  }

  const original = Buffer.from(await file.arrayBuffer());
  if (file.type === PDF_TYPE) {
    return { bytes: original, mimeType: PDF_TYPE, extension: "pdf" } as const;
  }

  let bytes: Buffer;
  try {
    // 領収書の細かい文字を残すため、画像の寸法は変えずに変換する。
    bytes = await sharp(original).rotate().webp({ quality: 92, effort: 6 }).toBuffer();
  } catch {
    throw new Error(`${file.name}をWebPに変換できませんでした。別の画像を選択してください。`);
  }
  if (bytes.length > maxBytes) {
    throw new Error(`${file.name}のWebP変換後のサイズが${Math.floor(maxBytes / 1024 / 1024)}MBを超えました。`);
  }
  return { bytes, mimeType: "image/webp", extension: "webp" } as const;
}
