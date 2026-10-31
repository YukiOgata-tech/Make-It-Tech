import "server-only";

import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

const PUBLIC_BUCKET = "mit-site-media";
const PRIVATE_BUCKET = "mit-site-private";
let supabase: SupabaseClient | null = null;

function isSupabaseStorage() {
  return process.env.SITE_STORAGE_BACKEND === "supabase";
}

function getSupabase() {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase site storage configuration is missing.");
  supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}

export async function uploadPublicSiteFile(path: string, bytes: Uint8Array, contentType: string) {
  if (isSupabaseStorage()) {
    const storage = getSupabase().storage.from(PUBLIC_BUCKET);
    const { error } = await storage.upload(path, Buffer.from(bytes), {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;
    return storage.getPublicUrl(path).data.publicUrl;
  }

  const bucket = getFirebaseAdmin().storage.bucket();
  const token = randomUUID();
  await bucket.file(path).save(Buffer.from(bytes), {
    contentType,
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

export async function uploadPrivateSiteFile(path: string, bytes: Uint8Array, contentType: string) {
  if (isSupabaseStorage()) {
    const { error } = await getSupabase().storage.from(PRIVATE_BUCKET).upload(
      path, Buffer.from(bytes), { contentType, cacheControl: "0", upsert: false }
    );
    if (error) throw error;
    return;
  }

  await getFirebaseAdmin().storage.bucket().file(path).save(Buffer.from(bytes), {
    contentType,
    resumable: false,
    metadata: { cacheControl: "private, max-age=0" },
  });
}

export async function getPrivateSiteFileSignedUrl(path: string, expiresInSeconds: number) {
  if (isSupabaseStorage()) {
    const { data, error } = await getSupabase().storage.from(PRIVATE_BUCKET)
      .createSignedUrl(path, expiresInSeconds);
    if (error || !data) throw error ?? new Error("Signed URL was not created.");
    return data.signedUrl;
  }

  const [url] = await getFirebaseAdmin().storage.bucket().file(path).getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return url;
}

export async function readPrivateSiteFile(path: string) {
  if (isSupabaseStorage()) {
    const { data, error } = await getSupabase().storage.from(PRIVATE_BUCKET).download(path);
    if (error || !data) throw error ?? new Error("Private file was not found.");
    return new Uint8Array(await data.arrayBuffer());
  }

  const [bytes] = await getFirebaseAdmin().storage.bucket().file(path).download();
  return new Uint8Array(bytes);
}

export async function savePrivateSiteFileOnce(path: string, bytes: Uint8Array, contentType: string) {
  if (isSupabaseStorage()) {
    const { error } = await getSupabase().storage.from(PRIVATE_BUCKET).upload(
      path, Buffer.from(bytes), { contentType, cacheControl: "0", upsert: false }
    );
    if (!error) return { created: true, bytes };
    // A lost upload response is also safe: read back the immutable object.
    try {
      return { created: false, bytes: await readPrivateSiteFile(path) };
    } catch {
      throw error;
    }
  }

  const file = getFirebaseAdmin().storage.bucket().file(path);
  try {
    await file.save(Buffer.from(bytes), {
      contentType,
      resumable: false,
      metadata: { contentType, cacheControl: "private, no-store, max-age=0" },
      preconditionOpts: { ifGenerationMatch: 0 },
    });
    return { created: true, bytes };
  } catch (error) {
    const code = (error as { code?: unknown })?.code;
    if (![409, 412, "409", "412"].includes(code as string)) throw error;
    const [existing] = await file.download();
    return { created: false, bytes: new Uint8Array(existing) };
  }
}

export async function removePrivateSiteFile(path: string) {
  if (isSupabaseStorage()) {
    const { error } = await getSupabase().storage.from(PRIVATE_BUCKET).remove([path]);
    if (error) throw error;
    return;
  }
  await getFirebaseAdmin().storage.bucket().file(path).delete({ ignoreNotFound: true });
}
