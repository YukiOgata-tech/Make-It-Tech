import "server-only";

import { sha256 } from "@/lib/contracts/crypto";
import {
  readPrivateSiteFile,
  removePrivateSiteFile,
  savePrivateSiteFileOnce,
} from "@/lib/site-storage";

export type ContractPdfKind = "original" | "executed" | "certificate";

export function getContractStoragePath(contractId: string, kind: ContractPdfKind) {
  return `contracts/${contractId}/${kind}.pdf`;
}
export async function saveContractPdfOnce(
  contractId: string,
  kind: ContractPdfKind,
  bytes: Uint8Array
) {
  const path = getContractStoragePath(contractId, kind);
  const saved = await savePrivateSiteFileOnce(path, bytes, "application/pdf");
  return { path, sha256: sha256(saved.bytes), created: saved.created };
}

export async function readContractPdf(path: string) {
  return readPrivateSiteFile(path);
}

export async function removeContractPdfAfterFailedCreate(path: string) {
  await removePrivateSiteFile(path);
}
