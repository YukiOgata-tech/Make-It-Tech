import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PUBLIC_BUCKET = "mit-site-media";
const PRIVATE_BUCKET = "mit-site-private";
let supabase: SupabaseClient | null = null;

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
  const storage = getSupabase().storage.from(PUBLIC_BUCKET);
  const { error } = await storage.upload(path, Buffer.from(bytes), {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return storage.getPublicUrl(path).data.publicUrl;
}

export async function uploadPrivateSiteFile(path: string, bytes: Uint8Array, contentType: string) {
  const { error } = await getSupabase().storage.from(PRIVATE_BUCKET).upload(
    path, Buffer.from(bytes), { contentType, cacheControl: "0", upsert: false }
  );
  if (error) throw error;
}

export async function getPrivateSiteFileSignedUrl(path: string, expiresInSeconds: number) {
  const { data, error } = await getSupabase().storage.from(PRIVATE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) throw error ?? new Error("Signed URL was not created.");
  return data.signedUrl;
}

export async function readPrivateSiteFile(path: string) {
  const { data, error } = await getSupabase().storage.from(PRIVATE_BUCKET).download(path);
  if (error || !data) throw error ?? new Error("Private file was not found.");
  return new Uint8Array(await data.arrayBuffer());
}

export async function savePrivateSiteFileOnce(path: string, bytes: Uint8Array, contentType: string) {
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

export async function removePrivateSiteFile(path: string) {
  const { error } = await getSupabase().storage.from(PRIVATE_BUCKET).remove([path]);
  if (error) throw error;
}
