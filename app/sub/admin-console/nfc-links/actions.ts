"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getManagedNfcLinkCollection,
  isManagedNfcSlug,
  normalizeNfcDestinationUrl,
} from "@/lib/nfc-managed-links";

const schema = z.object({
  slug: z.string().min(1).max(80),
  label: z.string().trim().min(1, "表示名を入力してください。").max(80),
  destinationUrl: z.string().trim().min(1, "遷移先URLを入力してください。").max(2048),
  enabled: z.boolean(),
});

export type NfcLinkFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialNfcLinkFormState: NfcLinkFormState = {
  status: "idle",
  message: "",
};

export async function saveNfcLink(
  _previousState: NfcLinkFormState,
  formData: FormData
): Promise<NfcLinkFormState> {
  const session = await requireAdmin();

  const parsed = schema.safeParse({
    slug: formData.get("slug"),
    label: formData.get("label"),
    destinationUrl: formData.get("destinationUrl"),
    enabled: formData.get("enabled") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };
  }

  if (!isManagedNfcSlug(parsed.data.slug)) {
    return {
      status: "error",
      message: "リンクIDには半角英小文字・数字・ハイフンのみ使用できます。",
    };
  }

  let destinationUrl: string;
  try {
    destinationUrl = normalizeNfcDestinationUrl(parsed.data.destinationUrl);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "遷移先URLが不正です。",
    };
  }

  try {
    const collection = getManagedNfcLinkCollection();
    const document = collection.doc(parsed.data.slug);
    const existing = await document.get();
    const now = Timestamp.now();
    const email = session.email?.toLowerCase() ?? "";

    await document.set(
      {
        slug: parsed.data.slug,
        label: parsed.data.label,
        destinationUrl,
        enabled: parsed.data.enabled,
        version: 1,
        updatedAt: now,
        updatedBy: { uid: session.uid, email },
        ...(!existing.exists
          ? {
              organizationId: null,
              ownerId: null,
              createdAt: now,
              createdBy: { uid: session.uid, email },
            }
          : {}),
      },
      { merge: true }
    );
  } catch {
    return {
      status: "error",
      message: "保存に失敗しました。Firebaseの設定を確認してください。",
    };
  }

  revalidatePath("/sub/admin-console/nfc-links");
  revalidatePath(`/sub/nfc/${parsed.data.slug}`);

  return {
    status: "success",
    message: "遷移先を保存しました。NFCタグのURLは変更する必要がありません。",
  };
}
