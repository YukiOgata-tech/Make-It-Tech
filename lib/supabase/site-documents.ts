import { randomBytes } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type DocumentData = Record<string, unknown>;
type DocumentRow = { path: string; data: Record<string, JsonValue>; version: number };
type ReadVersion = { path: string; version: number | null };
type FieldOperation =
  | { operation: "set"; value: JsonValue }
  | { operation: "delete" }
  | { operation: "increment"; value: number };
type DocumentWrite = {
  path: string;
  action: "create" | "set" | "update" | "delete";
  fields: Record<string, FieldOperation>;
  merge?: boolean;
};
type Filter = { field: string; operator: "==" | "<="; value: unknown };
type Sort = { field: string; direction: "asc" | "desc" };

const TIMESTAMP_KEY = "__mit_firestore_timestamp__";
let client: SupabaseClient | null = null;

function getClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase site data configuration is missing.");
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export function serializeSiteDocumentValue(value: unknown): JsonValue {
  if (value instanceof Timestamp) {
    return { [TIMESTAMP_KEY]: value.toDate().toISOString() };
  }
  if (value instanceof Date) {
    return { [TIMESTAMP_KEY]: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return value.map(serializeSiteDocumentValue);
  }
  if (value && typeof value === "object") {
    if (value instanceof FieldValue) {
      throw new Error("Field transforms must be at the document field level.");
    }
    return Object.fromEntries(
      Object.entries(value).filter(([, item]) => item !== undefined).map(
        ([key, item]) => [key, serializeSiteDocumentValue(item)]
      )
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
  throw new Error("Unsupported document value.");
}

function hydrateValue(value: JsonValue): unknown {
  if (Array.isArray(value)) return value.map(hydrateValue);
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === TIMESTAMP_KEY) {
      return Timestamp.fromDate(new Date(String(value[TIMESTAMP_KEY])));
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, hydrateValue(item)])
    );
  }
  return value;
}

function fieldsForWrite(data: DocumentData): DocumentWrite["fields"] {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined).map(([field, value]) => {
      if (value === FieldValue.delete()) {
        return [field, { operation: "delete" }];
      }
      if (value instanceof FieldValue) {
        const operand = (value as FieldValue & { operand?: unknown }).operand;
        if (value.constructor.name === "NumericIncrementTransform" &&
            typeof operand === "number" && Number.isFinite(operand)) {
          return [field, { operation: "increment", value: operand }];
        }
        throw new Error(`Unsupported field transform for ${field}.`);
      }
      return [field, { operation: "set", value: serializeSiteDocumentValue(value) }];
    })
  );
}

async function commit(reads: ReadVersion[], writes: DocumentWrite[]) {
  const { error } = await getClient().rpc("commit_site_documents", {
    p_reads: reads,
    p_writes: writes,
  });
  if (error) throw error;
}

function documentId() {
  return randomBytes(18).toString("base64url").slice(0, 20);
}

class SiteDocumentSnapshot {
  readonly id: string;
  readonly exists: boolean;
  readonly version: number | null;

  constructor(readonly ref: SiteDocumentReference, private readonly row: DocumentRow | null) {
    this.id = ref.id;
    this.exists = row !== null;
    this.version = row?.version ?? null;
  }

  data(): DocumentData | undefined {
    return this.row ? hydrateValue(this.row.data) as DocumentData : undefined;
  }
}

class SiteDocumentReference {
  readonly id: string;

  constructor(readonly path: string) {
    this.id = path.split("/").at(-1)!;
  }

  collection(name: string) {
    return new SiteCollectionReference(`${this.path}/${name}`);
  }

  async get() {
    const { data, error } = await getClient()
      .from("site_documents")
      .select("path,data,version")
      .eq("path", this.path)
      .maybeSingle();
    if (error) throw error;
    return new SiteDocumentSnapshot(this, data as DocumentRow | null);
  }

  async set(data: DocumentData, options?: { merge?: boolean }) {
    await commit([], [{
      path: this.path,
      action: "set",
      fields: fieldsForWrite(data),
      merge: options?.merge === true,
    }]);
  }

  async update(data: DocumentData) {
    await commit([], [{ path: this.path, action: "update", fields: fieldsForWrite(data) }]);
  }

  async delete() {
    await commit([], [{ path: this.path, action: "delete", fields: {} }]);
  }
}

function comparable(value: unknown): string | number | boolean | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return null;
}

class SiteQuery {
  constructor(
    readonly path: string,
    private readonly filters: Filter[] = [],
    private readonly sort?: Sort,
    private readonly maxResults?: number
  ) {}

  where(field: string, operator: "==" | "<=", value: unknown) {
    return new SiteQuery(this.path, [...this.filters, { field, operator, value }], this.sort, this.maxResults);
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    return new SiteQuery(this.path, this.filters, { field, direction }, this.maxResults);
  }

  limit(count: number) {
    return new SiteQuery(this.path, this.filters, this.sort, count);
  }

  async get() {
    const rows: DocumentRow[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await getClient()
        .from("site_documents")
        .select("path,data,version")
        .eq("collection_path", this.path)
        .order("path", { ascending: true })
        .range(offset, offset + 999);
      if (error) throw error;
      const page = (data ?? []) as DocumentRow[];
      rows.push(...page);
      if (page.length < 1000) break;
    }

    const docs = rows.map((row) => new SiteDocumentSnapshot(
      new SiteDocumentReference(row.path), row
    )).filter((doc) => {
      const data = doc.data() ?? {};
      return this.filters.every(({ field, operator, value }) => {
        const left = comparable(data[field]);
        const right = comparable(value);
        if (left === null || right === null) return false;
        if (operator === "==") return left === right;
        return left <= right;
      });
    });

    if (this.sort) {
      const { field, direction } = this.sort;
      const multiplier = direction === "desc" ? -1 : 1;
      docs.sort((a, b) => {
        const left = comparable(a.data()?.[field]);
        const right = comparable(b.data()?.[field]);
        if (left === null && right === null) return a.id.localeCompare(b.id);
        if (left === null) return 1;
        if (right === null) return -1;
        return (left < right ? -1 : left > right ? 1 : a.id.localeCompare(b.id)) * multiplier;
      });
    }

    const ordered = this.sort
      ? docs.filter((doc) => doc.data()?.[this.sort!.field] !== undefined)
      : docs;
    const limited = this.maxResults === undefined ? ordered : ordered.slice(0, this.maxResults);
    return { docs: limited, empty: limited.length === 0, size: limited.length };
  }
}

class SiteCollectionReference extends SiteQuery {
  doc(id = documentId()) {
    if (!id || id.includes("/")) throw new Error("Invalid document ID.");
    return new SiteDocumentReference(`${this.path}/${id}`);
  }

  async add(data: DocumentData) {
    const ref = this.doc();
    await commit([], [{ path: ref.path, action: "create", fields: fieldsForWrite(data) }]);
    return ref;
  }
}

class SiteTransaction {
  private readonly reads = new Map<string, number | null>();
  private readonly writes: DocumentWrite[] = [];

  async get(ref: SiteDocumentReference) {
    if (this.writes.length) throw new Error("Transaction reads must precede writes.");
    const snapshot = await ref.get();
    this.reads.set(ref.path, snapshot.version);
    return snapshot;
  }

  create(ref: SiteDocumentReference, data: DocumentData) {
    this.writes.push({ path: ref.path, action: "create", fields: fieldsForWrite(data) });
    return this;
  }

  set(ref: SiteDocumentReference, data: DocumentData, options?: { merge?: boolean }) {
    this.writes.push({
      path: ref.path,
      action: "set",
      fields: fieldsForWrite(data),
      merge: options?.merge === true,
    });
    return this;
  }

  update(ref: SiteDocumentReference, data: DocumentData) {
    this.writes.push({ path: ref.path, action: "update", fields: fieldsForWrite(data) });
    return this;
  }

  async commit() {
    if (!this.writes.length) return;
    await commit(
      Array.from(this.reads, ([path, version]) => ({ path, version })),
      this.writes
    );
  }
}

export class SiteDocumentStore {
  collection(name: string) {
    return new SiteCollectionReference(name);
  }

  async runTransaction<T>(callback: (transaction: SiteTransaction) => Promise<T>) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const transaction = new SiteTransaction();
      const result = await callback(transaction);
      try {
        await transaction.commit();
        return result;
      } catch (error) {
        if ((error as { code?: string }).code !== "PT409" || attempt === 4) {
          throw error;
        }
      }
    }
    throw new Error("Document transaction retries exhausted.");
  }
}

export const siteDocumentStore = new SiteDocumentStore();
