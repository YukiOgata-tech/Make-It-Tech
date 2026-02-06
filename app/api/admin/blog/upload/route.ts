import { randomUUID } from "crypto";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_IMAGE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "image";
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
    const buffer = Buffer.from(await file.arrayBuffer());
    const token = randomUUID();

    await bucket.file(path).save(buffer, {
      contentType: file.type,
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
