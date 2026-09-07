import "server-only";

import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { sha256 } from "@/lib/contracts/crypto";

export type ContractPdfKind = "original" | "executed" | "certificate";

export function getContractStoragePath(contractId: string, kind: ContractPdfKind) {
  return `contracts/${contractId}/${kind}.pdf`;
}
function isPreconditionFailure(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  return code === 409 || code === 412 || code === "409" || code === "412";
}

export async function saveContractPdfOnce(
  contractId: string,
  kind: ContractPdfKind,
  bytes: Uint8Array
) {
  const path = getContractStoragePath(contractId, kind);
  const { storage } = getFirebaseAdmin();
  const file = storage.bucket().file(path);
  try {
    await file.save(Buffer.from(bytes), {
      contentType: "application/pdf",
      resumable: false,
      metadata: {
        contentType: "application/pdf",
        cacheControl: "private, no-store, max-age=0",
      },
      preconditionOpts: { ifGenerationMatch: 0 },
    });
    return { path, sha256: sha256(bytes), created: true };
  } catch (error) {
    if (!isPreconditionFailure(error)) throw error;
    const [existing] = await file.download();
    return { path, sha256: sha256(existing), created: false };
  }
}

export async function readContractPdf(path: string) {
  const { storage } = getFirebaseAdmin();
  const [bytes] = await storage.bucket().file(path).download();
  return new Uint8Array(bytes);
}

export async function removeContractPdfAfterFailedCreate(path: string) {
  const { storage } = getFirebaseAdmin();
  await storage.bucket().file(path).delete({ ignoreNotFound: true });
}
