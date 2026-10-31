import { requireAdmin } from "@/lib/admin-auth";
import { prepareImageUpload } from "@/lib/image-upload";
import { uploadPublicSiteFile } from "@/lib/site-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdmin();

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const purpose = String(formData.get("purpose") ?? "general");
    const postId = String(formData.get("postId") ?? `temp-${Date.now()}`);

    const prepared = await prepareImageUpload(file, purpose);
    if (!prepared.ok) {
      return Response.json({ error: prepared.error }, { status: prepared.status });
    }

    const path = `blog/${postId}/${purpose}/${Date.now()}-${prepared.fileName}`;
    const url = await uploadPublicSiteFile(path, prepared.buffer, prepared.contentType);

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
