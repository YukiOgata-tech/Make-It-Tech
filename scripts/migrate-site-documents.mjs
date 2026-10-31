import { createHash } from "node:crypto";
import nextEnv from "@next/env";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());

const mode = process.argv[2] ?? "--dry-run";
if (!["--dry-run", "--apply", "--verify"].includes(mode)) {
  throw new Error("Use --dry-run, --apply or --verify.");
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Firebase source configuration is missing.");
}
if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

function serialize(value) {
  if (value instanceof Timestamp) {
    return { __mit_firestore_timestamp__: value.toDate().toISOString() };
  }
  if (value instanceof Date) {
    return { __mit_firestore_timestamp__: value.toISOString() };
  }
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, serialize(item)])
    );
  }
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return value;
  }
  throw new Error(`Unsupported Firestore value: ${typeof value}`);
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonical(value[key])])
    );
  }
  return value;
}

function digest(value) {
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}

const source = getFirestore();
const documents = [];

async function visitCollection(collection) {
  const snapshot = await collection.get();
  for (const document of snapshot.docs) {
    documents.push({ path: document.ref.path, data: serialize(document.data()) });
    for (const child of await document.ref.listCollections()) {
      await visitCollection(child);
    }
  }
}

for (const collection of await source.listCollections()) {
  await visitCollection(collection);
}
documents.sort((a, b) => a.path.localeCompare(b.path));

const counts = new Map();
for (const document of documents) {
  const collection = document.path.split("/")
    .filter((_, index) => index % 2 === 0).join("/");
  counts.set(collection, (counts.get(collection) ?? 0) + 1);
}
for (const [collection, count] of [...counts].sort()) {
  console.log(`${collection}: ${count}`);
}
console.log(`Total source documents: ${documents.length}`);

if (mode === "--dry-run") process.exit(0);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase destination configuration is missing.");
const destination = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

for (const document of documents) {
  const { data: existing, error: readError } = await destination
    .from("site_documents")
    .select("path,data")
    .eq("path", document.path)
    .maybeSingle();
  if (readError) throw readError;

  if (existing) {
    if (digest(existing.data) !== digest(document.data)) {
      throw new Error(`Destination differs from source: ${document.path}`);
    }
    continue;
  }

  if (mode === "--apply") {
    const { error } = await destination
      .from("site_documents")
      .insert({ path: document.path, data: document.data });
    if (error) throw error;
  } else {
    throw new Error(`Destination is missing: ${document.path}`);
  }
}

const { count, error: countError } = await destination
  .from("site_documents")
  .select("path", { count: "exact", head: true });
if (countError) throw countError;
if (count !== documents.length) {
  throw new Error(`Document count mismatch: source ${documents.length}, destination ${count}`);
}
console.log(`Verified ${count} documents with matching content hashes.`);
