import type { ContractStatus } from "@/lib/contracts/constants";

export type ContractTokenPurpose = "recipient_input" | "signing" | "documents";
export type ContractDocumentKind = "original" | "executed" | "certificate";

export const VOIDABLE_CONTRACT_STATUSES: readonly ContractStatus[] = [
  "draft",
  "ready",
  "sent",
  "viewed",
  "expired",
];

export function getContractTokenPurpose(value: unknown): ContractTokenPurpose {
  if (value === "documents" || value === "recipient_input") return value;
  return "signing";
}

export function canVoidContractStatus(status: ContractStatus) {
  return VOIDABLE_CONTRACT_STATUSES.includes(status);
}

export function canAccessContractDocument(input: {
  purpose: ContractTokenPurpose;
  tokenStatus: string;
  expiresAt?: Date;
  contractStatus: ContractStatus;
  kind: ContractDocumentKind;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  if (
    input.tokenStatus !== "active" ||
    !input.expiresAt ||
    input.expiresAt.getTime() <= now.getTime()
  ) {
    return false;
  }

  if (input.purpose === "signing") {
    return (
      input.kind === "original" &&
      (input.contractStatus === "sent" || input.contractStatus === "viewed")
    );
  }

  if (input.purpose === "recipient_input") return false;

  return (
    input.contractStatus === "completed" &&
    (input.kind === "executed" || input.kind === "certificate")
  );
}
