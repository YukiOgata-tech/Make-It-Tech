import { Timestamp } from "firebase-admin/firestore";
import type { ContractEventType } from "@/lib/contracts/constants";
import { canonicalJson, createRequestId, sha256 } from "@/lib/contracts/crypto";

export type AuditActorType = "admin" | "signer" | "system";

export type AuditEventInput = {
  eventType: ContractEventType;
  occurredAt: Date;
  actorType: AuditActorType;
  actorId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  eventId?: string;
};

export type ContractAuditEvent = {
  eventId: string;
  contractId: string;
  sequence: number;
  eventType: ContractEventType;
  occurredAt: Timestamp;
  actorType: AuditActorType;
  actorId: string;
  ipAddress: string;
  userAgent: string;
  requestId: string;
  metadata: Record<string, unknown>;
  previousHash: string;
  eventHash: string;
};

export function buildAuditChain(
  contractId: string,
  previousHash: string,
  previousSequence: number,
  inputs: AuditEventInput[]
) {
  let nextPreviousHash = previousHash;
  let sequence = previousSequence;

  const events = inputs.map((input) => {
    sequence += 1;
    const eventId = input.eventId ?? createRequestId();
    const payload = {
      eventId,
      contractId,
      sequence,
      eventType: input.eventType,
      occurredAt: input.occurredAt.toISOString(),
      actorType: input.actorType,
      actorId: input.actorId ?? "",
      ipAddress: input.ipAddress ?? "",
      userAgent: input.userAgent ?? "",
      requestId: input.requestId ?? "",
      metadata: input.metadata ?? {},
      previousHash: nextPreviousHash,
    };
    const eventHash = sha256(canonicalJson(payload));
    const event: ContractAuditEvent = {
      ...payload,
      occurredAt: Timestamp.fromDate(input.occurredAt),
      eventHash,
    };
    nextPreviousHash = eventHash;
    return event;
  });

  return {
    events,
    lastHash: nextPreviousHash,
    lastSequence: sequence,
  };
}

export function verifyAuditChain(
  events: Array<Omit<ContractAuditEvent, "occurredAt"> & { occurredAt: Timestamp | string }>,
  expectedLastHash?: string
) {
  let previousHash = "";
  let previousSequence = 0;
  for (const event of events) {
    const occurredAt = typeof event.occurredAt === "string"
      ? new Date(event.occurredAt).toISOString()
      : event.occurredAt.toDate().toISOString();
    const payload = {
      eventId: event.eventId,
      contractId: event.contractId,
      sequence: event.sequence,
      eventType: event.eventType,
      occurredAt,
      actorType: event.actorType,
      actorId: event.actorId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      requestId: event.requestId,
      metadata: event.metadata,
      previousHash: event.previousHash,
    };
    if (
      event.sequence !== previousSequence + 1 ||
      event.previousHash !== previousHash ||
      sha256(canonicalJson(payload)) !== event.eventHash
    ) {
      return { valid: false, brokenAtSequence: event.sequence, lastHash: previousHash };
    }
    previousHash = event.eventHash;
    previousSequence = event.sequence;
  }
  return {
    valid: expectedLastHash === undefined || previousHash === expectedLastHash,
    brokenAtSequence: expectedLastHash !== undefined && previousHash !== expectedLastHash
      ? previousSequence + 1
      : undefined,
    lastHash: previousHash,
  };
}
