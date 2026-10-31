import { requireAdmin } from "@/lib/admin-auth";
import { prepareImageUpload } from "@/lib/image-upload";
import { uploadPublicSiteFile } from "@/lib/site-storage";

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

    const path = `my-life/main/cover/${Date.now()}-${prepared.fileName}`;
    const url = await uploadPublicSiteFile(path, prepared.buffer, prepared.contentType);

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
