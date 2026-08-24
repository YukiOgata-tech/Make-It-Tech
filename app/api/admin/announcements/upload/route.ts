import { randomUUID } from "crypto";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { prepareImageUpload } from "@/lib/image-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdmin();

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const purpose = String(formData.get("purpose") ?? "general");
    const announcementId = String(formData.get("announcementId") ?? `temp-${Date.now()}`);

    const prepared = await prepareImageUpload(file, purpose);
    if (!prepared.ok) {
      return Response.json({ error: prepared.error }, { status: prepared.status });
    }

    const { storage } = getFirebaseAdmin();
    const bucket = storage.bucket();

    const path = `announcements/${announcementId}/${purpose}/${Date.now()}-${prepared.fileName}`;
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
    console.error("Announcement upload failed", error);
    return Response.json(
      {
        error: "アップロードに失敗しました。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
