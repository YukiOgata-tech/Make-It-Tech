import { nfcSite } from "@/content/nfc/site";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

const COLLECTION_NAME = "nfcManagedLinks";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const NFC_TEST_SLUG = "custom-test";

export type ManagedNfcLink = {
  slug: string;
  label: string;
  destinationUrl: string;
  enabled: boolean;
  organizationId: string | null;
  ownerId: string | null;
  updatedAt: string | null;
};

export function isManagedNfcSlug(value: string) {
  return SLUG_PATTERN.test(value) && value.length <= 80;
}

export function getManagedNfcPublicUrl(slug: string) {
  return `${nfcSite.url}/${slug}`;
}

export function normalizeNfcDestinationUrl(value: string) {
  const trimmed = value.trim();
  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("正しいURLを入力してください。");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("遷移先は https:// で始まるURLを指定してください。");
  }

  if (parsed.username || parsed.password) {
    throw new Error("認証情報を含むURLは登録できません。");
  }

  if (parsed.hostname.toLowerCase() === nfcSite.host) {
    throw new Error("循環を防ぐため、NFCサイト自身は遷移先に指定できません。");
  }

  return parsed.toString();
}

function timestampToIso(value: unknown) {
  if (!value || typeof value !== "object" || !("toDate" in value)) {
    return null;
  }

  const date = (value as { toDate: () => Date }).toDate();
  return date.toISOString();
}

export async function getManagedNfcLink(slug: string): Promise<ManagedNfcLink | null> {
  if (!isManagedNfcSlug(slug)) return null;

  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore.collection(COLLECTION_NAME).doc(slug).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() ?? {};
  const destinationUrl =
    typeof data.destinationUrl === "string" ? data.destinationUrl : "";

  try {
    return {
      slug,
      label:
        typeof data.label === "string" && data.label.trim()
          ? data.label.trim()
          : "リンク先を開いています",
      destinationUrl: normalizeNfcDestinationUrl(destinationUrl),
      enabled: data.enabled === true,
      organizationId:
        typeof data.organizationId === "string" ? data.organizationId : null,
      ownerId: typeof data.ownerId === "string" ? data.ownerId : null,
      updatedAt: timestampToIso(data.updatedAt),
    };
  } catch {
    return null;
  }
}

export function getManagedNfcLinkCollection() {
  const { firestore } = getFirebaseAdmin();
  return firestore.collection(COLLECTION_NAME);
}
