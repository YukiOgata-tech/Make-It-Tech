import sharp from "sharp";

/**
 * 管理画面からアップロードされた画像を WebP に正規化する共通処理。
 *
 * Vercel の画像最適化を使わない方針なので、配信するファイルそのものを
 * 最終寸法・最終品質で保存する。CLAUDE.md「ブログ画像の方針」を参照。
 * blog / announcements / my-life の各 upload ルートが同じ規則で動くように、
 * 検証から変換までをここに集約している。
 */

export const UPLOAD_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** サーバー側で変換して軽くするので、入力は元の大きさのままでも構わない。 */
export const UPLOAD_MAX_IMAGE_MB = 15;

/** カバー画像は OGP と同じ寸法に固定する。 */
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;
/** 本文画像は縦横比を保ったまま、この幅を上限にする。 */
const INLINE_MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

/** 変換後は必ず WebP なので、拡張子も差し替える。 */
export function toWebpFileName(name: string) {
  const base = name.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "image";
  return `${base.replace(/\.[^.]+$/, "")}.webp`;
}

export type PreparedImageUpload =
  | { ok: true; buffer: Buffer; fileName: string; contentType: "image/webp" }
  | { ok: false; error: string; status: number };

async function convert(input: Buffer, purpose: string, isGif: boolean) {
  // アニメーションGIFはコマを保持したまま WebP にする。
  const pipeline = sharp(input, isGif ? { animated: true } : undefined);

  // GIF はコマごとの切り出しで崩れやすいので、カバーでも縮小だけに留める。
  if (purpose === "cover" && !isGif) {
    return pipeline
      .resize(COVER_WIDTH, COVER_HEIGHT, { fit: "cover", position: "centre" })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toBuffer();
  }

  return pipeline
    .resize({ width: INLINE_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toBuffer();
}

/**
 * フォームから受け取った値を検証し、WebP に変換して返す。
 *
 * `purpose` が "cover" のときだけ 1200x630 に切り出す。それ以外は
 * 縦横比を保ったまま幅の上限をかけるだけで、拡大はしない。
 */
export async function prepareImageUpload(
  file: unknown,
  purpose: string
): Promise<PreparedImageUpload> {
  if (!(file instanceof File)) {
    return { ok: false, error: "ファイルが見つかりません。", status: 400 };
  }
  if (!UPLOAD_ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, error: "画像ファイルのみ対応しています。", status: 400 };
  }
  if (file.size / (1024 * 1024) > UPLOAD_MAX_IMAGE_MB) {
    return {
      ok: false,
      error: `画像サイズは${UPLOAD_MAX_IMAGE_MB}MB以内にしてください。`,
      status: 400,
    };
  }

  const original = Buffer.from(await file.arrayBuffer());
  try {
    const buffer = await convert(original, purpose, file.type === "image/gif");
    return {
      ok: true,
      buffer,
      fileName: toWebpFileName(file.name),
      contentType: "image/webp",
    };
  } catch (error) {
    console.error("Image conversion failed", error);
    return {
      ok: false,
      error: "画像の変換に失敗しました。別の画像でお試しください。",
      status: 400,
    };
  }
}
