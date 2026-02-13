import { unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export type MyLifeConfig = {
  leadText?: string;
  titleText?: string;
  message: string;
  imageUrl?: string;
  imagePath?: string;
  updatedAt?: Date;
};

const MY_LIFE_DOC_ID = "main";

function toDate(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  if (value && typeof value === "object") {
    const maybeSeconds = (value as { seconds?: unknown; _seconds?: unknown }).seconds;
    const maybeAltSeconds = (value as { _seconds?: unknown })._seconds;
    const seconds =
      typeof maybeSeconds === "number"
        ? maybeSeconds
        : typeof maybeAltSeconds === "number"
          ? maybeAltSeconds
          : null;
    if (seconds !== null) return new Date(seconds * 1000);
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
}

function normalize(data: Record<string, unknown> | undefined): MyLifeConfig {
  const raw = data ?? {};
  return {
    leadText: typeof raw.leadText === "string" ? raw.leadText : undefined,
    titleText: typeof raw.titleText === "string" ? raw.titleText : undefined,
    message: typeof raw.message === "string" ? raw.message : "",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
    imagePath: typeof raw.imagePath === "string" ? raw.imagePath : undefined,
    updatedAt: toDate(raw.updatedAt),
  };
}

const getCachedMyLifeConfig = unstable_cache(
  async () => {
    const { firestore } = getFirebaseAdmin();
    const snapshot = await firestore.collection("myLife").doc(MY_LIFE_DOC_ID).get();
    if (!snapshot.exists) {
      return { message: "" } satisfies MyLifeConfig;
    }
    return normalize(snapshot.data() as Record<string, unknown>);
  },
  ["public-my-life-main"],
  { revalidate: false, tags: ["public-my-life", "admin-my-life"] }
);

export async function fetchMyLifeConfig() {
  if (process.env.NODE_ENV !== "production") {
    const { firestore } = getFirebaseAdmin();
    const snapshot = await firestore.collection("myLife").doc(MY_LIFE_DOC_ID).get();
    if (!snapshot.exists) {
      return { message: "" } satisfies MyLifeConfig;
    }
    return normalize(snapshot.data() as Record<string, unknown>);
  }
  return getCachedMyLifeConfig();
}

export async function saveMyLifeConfig(payload: {
  leadText?: string;
  titleText?: string;
  message: string;
  imageUrl?: string;
  imagePath?: string;
}) {
  const { firestore } = getFirebaseAdmin();
  await firestore.collection("myLife").doc(MY_LIFE_DOC_ID).set(
    {
      leadText: payload.leadText ?? "",
      titleText: payload.titleText ?? "",
      message: payload.message,
      imageUrl: payload.imageUrl ?? "",
      imagePath: payload.imagePath ?? "",
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export { MY_LIFE_DOC_ID };
