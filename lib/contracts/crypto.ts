import { createHash, randomBytes, randomUUID } from "node:crypto";
import { CONTRACT_TOKEN_BYTES } from "@/lib/contracts/constants";

export function sha256(value: Uint8Array | string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createSigningToken() {
  const token = randomBytes(CONTRACT_TOKEN_BYTES).toString("base64url");
  return { token, tokenHash: sha256(token) };
}

export function createRequestId() {
  return randomUUID();
}

function normalizeCanonical(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Canonical JSON cannot contain non-finite numbers.");
    return value;
  }
  if (Array.isArray(value)) return value.map(normalizeCanonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizeCanonical(item)])
    );
  }
  if (value === undefined) return null;
  throw new Error(`Unsupported canonical JSON value: ${typeof value}`);
}

export function canonicalJson(value: unknown) {
  return JSON.stringify(normalizeCanonical(value));
}
