import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { prepareImageUpload } from "@/lib/image-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdmin();

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    // my-life はカバー画像しか受け付けないので purpose は固定。
    const prepared = await prepareImageUpload(file, "cover");
    if (!prepared.ok) {
      return Response.json({ error: prepared.error }, { status: prepared.status });
    }

    const { storage } = getFirebaseAdmin();
    const bucket = storage.bucket();
    const path = `my-life/main/cover/${Date.now()}-${prepared.fileName}`;
    const token = randomUUID();

    await bucket.file(path).save(prepared.buffer, {
      contentType: prepared.contentType,
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
    console.error("My life upload failed", error);
    return Response.json(
      {
        error: "アップロードに失敗しました。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
