import { createHash } from "node:crypto";
import nextEnv from "@next/env";
import { cert, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());

const mode = process.argv[2] ?? "--dry-run";
if (!["--dry-run", "--apply", "--verify"].includes(mode)) {
  throw new Error("Use --dry-run, --apply or --verify.");
}

const PUBLIC_BUCKET = "mit-site-media";
const PRIVATE_BUCKET = "mit-site-private";
const PUBLIC_PREFIXES = ["blog/", "announcements/", "my-life/"];
const PRIVATE_PREFIXES = ["intake/", "contracts/"];
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const firebaseBucketName = process.env.FIREBASE_STORAGE_BUCKET;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL ||
    !privateKey || !firebaseBucketName) {
  throw new Error("Firebase source configuration is missing.");
}

const firebaseApp = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
  storageBucket: firebaseBucketName,
});
const sourceBucket = getStorage(firebaseApp).bucket();

function destinationBucket(path) {
  if (PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))) return PUBLIC_BUCKET;
  if (PRIVATE_PREFIXES.some((prefix) => path.startsWith(prefix))) return PRIVATE_BUCKET;
  throw new Error(`Unrecognized Firebase Storage path: ${path}`);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

const files = [];
let pageToken;
do {
  const [page, nextQuery] = await sourceBucket.getFiles({
    autoPaginate: false,
    maxResults: 1000,
    pageToken,
  });
  files.push(...page);
  pageToken = nextQuery?.pageToken;
} while (pageToken);
files.sort((a, b) => a.name.localeCompare(b.name));

const inventory = { public: 0, private: 0, bytes: 0 };
for (const file of files) {
  const bucket = destinationBucket(file.name);
  const [metadata] = await file.getMetadata();
  inventory[bucket === PUBLIC_BUCKET ? "public" : "private"] += 1;
  inventory.bytes += Number(metadata.size ?? 0);
  if (Number(metadata.size ?? 0) > MAX_FILE_BYTES) {
    throw new Error(`File exceeds the destination bucket limit: ${file.name}`);
  }
}
console.log(`Firebase Storage: ${files.length} files, ${inventory.bytes} bytes`);
console.log(`Public: ${inventory.public}, private: ${inventory.private}`);
if (mode === "--dry-run") process.exit(0);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase destination configuration is missing.");
const destination = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: bucketError } = await destination.storage.listBuckets();
if (bucketError) throw bucketError;
for (const [name, isPublic] of [[PUBLIC_BUCKET, true], [PRIVATE_BUCKET, false]]) {
  const existing = buckets.find((bucket) => bucket.id === name);
  if (existing) {
    if (existing.public !== isPublic) throw new Error(`Unexpected bucket visibility: ${name}`);
    continue;
  }
  if (mode !== "--apply") throw new Error(`Destination bucket is missing: ${name}`);
  const { error } = await destination.storage.createBucket(name, {
    public: isPublic,
    fileSizeLimit: MAX_FILE_BYTES,
  });
  if (error) throw error;
}

for (const file of files) {
  const bucketName = destinationBucket(file.name);
  const storage = destination.storage.from(bucketName);
  const [sourceBytes] = await file.download();
  const expectedHash = sha256(sourceBytes);
  let { data: downloaded, error: downloadError } = await storage.download(file.name);
  if (downloadError && mode === "--apply") {
    const [metadata] = await file.getMetadata();
    const { error: uploadError } = await storage.upload(file.name, sourceBytes, {
      contentType: metadata.contentType ?? "application/octet-stream",
      cacheControl: bucketName === PUBLIC_BUCKET ? "31536000" : "0",
      upsert: false,
    });
    if (uploadError) throw uploadError;
    ({ data: downloaded, error: downloadError } = await storage.download(file.name));
  }
  if (downloadError || !downloaded) throw downloadError ?? new Error(`Missing file: ${file.name}`);
  const actualHash = sha256(Buffer.from(await downloaded.arrayBuffer()));
  if (actualHash !== expectedHash) throw new Error(`File hash differs: ${file.name}`);
  if (bucketName === PUBLIC_BUCKET) {
    const publicUrl = storage.getPublicUrl(file.name).data.publicUrl;
    const response = await fetch(publicUrl);
    if (!response.ok || sha256(Buffer.from(await response.arrayBuffer())) !== expectedHash) {
      throw new Error(`Public URL does not serve the original bytes: ${file.name}`);
    }
  }
}
console.log(`Verified ${files.length} destination files by SHA-256.`);

const FIREBASE_URL = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/\s"')]+)\/o\/([^?\s"')]+)\?alt=media&token=[A-Za-z0-9-]+/g;
const fileNames = new Set(files.map((file) => file.name));
function rewrite(value) {
  if (typeof value === "string") {
    return value.replace(FIREBASE_URL, (original, bucket, encodedPath) => {
      if (bucket !== firebaseBucketName) return original;
      const path = decodeURIComponent(encodedPath);
      if (!fileNames.has(path) || destinationBucket(path) !== PUBLIC_BUCKET) {
        throw new Error(`Referenced public file was not migrated: ${path}`);
      }
      return destination.storage.from(PUBLIC_BUCKET).getPublicUrl(path).data.publicUrl;
    });
  }
  if (Array.isArray(value)) return value.map(rewrite);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, rewrite(item)]));
  }
  return value;
}

let changed = 0;
for (let offset = 0; ; offset += 1000) {
  const { data: rows, error } = await destination.from("site_documents")
    .select("path,data,version")
    .order("path", { ascending: true })
    .range(offset, offset + 999);
  if (error) throw error;
  for (const row of rows ?? []) {
    const updated = rewrite(row.data);
    if (JSON.stringify(updated).includes("firebasestorage.googleapis.com")) {
      throw new Error(`Unmigrated Firebase Storage URL remains: ${row.path}`);
    }
    if (JSON.stringify(updated) === JSON.stringify(row.data)) continue;
    changed += 1;
    if (mode !== "--apply") {
      throw new Error(`Document still references Firebase Storage: ${row.path}`);
    }
    const fields = Object.fromEntries(Object.entries(updated).map(([field, value]) => [
      field, { operation: "set", value },
    ]));
    const { error: commitError } = await destination.rpc("commit_site_documents", {
      p_reads: [{ path: row.path, version: row.version }],
      p_writes: [{ path: row.path, action: "set", fields }],
    });
    if (commitError) throw commitError;
  }
  if ((rows ?? []).length < 1000) break;
}
console.log(`Updated ${changed} destination documents with Supabase public URLs.`);
