import { z } from "zod";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { fetchMyLifeConfig, saveMyLifeConfig } from "@/lib/my-life-data";

export const runtime = "nodejs";

const schema = z.object({
  message: z.string().max(6000),
  imageUrl: z.string().url().nullable().optional(),
  imagePath: z.string().max(300).nullable().optional(),
});

export async function GET() {
  await requireAdmin();
  const config = await fetchMyLifeConfig();
  return Response.json({ ok: true, config });
}

export async function PATCH(request: Request) {
  await requireAdmin();

  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return Response.json(
      { error: "Invalid payload.", details: error instanceof Error ? error.message : undefined },
      { status: 400 }
    );
  }

  await saveMyLifeConfig({
    message: payload.message.trim(),
    imageUrl: payload.imageUrl ?? "",
    imagePath: payload.imagePath ?? "",
  });

  revalidateTag("public-my-life", { expire: 0 });
  revalidateTag("admin-my-life", { expire: 0 });

  return Response.json({ ok: true });
}
