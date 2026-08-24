import { randomUUID } from "crypto";
import sharp from "sharp";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// 受け取ったあとサーバー側で WebP に変換するので、入力は元の大きさのままでも構わない。
const MAX_IMAGE_MB = 15;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** カバー画像は OGP と同じ寸法に固定する。CLAUDE.md「ブログ画像の方針」参照。 */
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;
/** 本文画像は縦横比を保ったまま、この幅を上限にする。 */
const INLINE_MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

function safeFileName(name: string) {
  const base = name.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "image";
  // 変換後は必ず WebP なので、拡張子も差し替える。
  return `${base.replace(/\.[^.]+$/, "")}.webp`;
}

/**
 * アップロードされた画像を WebP に変換する。
 *
 * Vercel の画像最適化を使わない方針なので、配信するファイルそのものを
 * 最終寸法・最終品質で保存する。カバーは 1200x630 に切り出し、本文画像は
 * 縦横比を保ったまま幅の上限だけかける（拡大はしない）。
 */
async function toWebp(input: Buffer, purpose: string, isGif: boolean) {
  // アニメーションGIFはコマを保持したまま WebP にする。
  const pipeline = sharp(input, isGif ? { animated: true } : undefined);

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

export async function POST(request: Request) {
  await requireAdmin();

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const purpose = String(formData.get("purpose") ?? "general");
    const postId = String(formData.get("postId") ?? `temp-${Date.now()}`);

    if (!(file instanceof File)) {
      return Response.json({ error: "ファイルが見つかりません。" }, { status: 400 });
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return Response.json({ error: "画像ファイルのみ対応しています。" }, { status: 400 });
    }

    if (file.size / (1024 * 1024) > MAX_IMAGE_MB) {
      return Response.json({ error: `画像サイズは${MAX_IMAGE_MB}MB以内にしてください。` }, { status: 400 });
    }

    const { storage } = getFirebaseAdmin();
    const bucket = storage.bucket();

    const safeName = safeFileName(file.name);
    const path = `blog/${postId}/${purpose}/${Date.now()}-${safeName}`;
    const original = Buffer.from(await file.arrayBuffer());

    let buffer: Buffer;
    try {
      buffer = await toWebp(original, purpose, file.type === "image/gif");
    } catch (error) {
      console.error("Blog image conversion failed", error);
      return Response.json(
        { error: "画像の変換に失敗しました。別の画像でお試しください。" },
        { status: 400 }
      );
    }

    const token = randomUUID();

    await bucket.file(path).save(buffer, {
      contentType: "image/webp",
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const encodedPath = encodeURIComponent(path);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

    return Response.json({ ok: true, url, path });
  } catch (error) {
    console.error("Blog upload failed", error);
    return Response.json(
      {
        error: "アップロードに失敗しました。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
