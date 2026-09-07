import "server-only";

import { FieldValue, Timestamp, type DocumentReference, type Transaction } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { buildAuditChain, type ContractAuditEvent } from "@/lib/contracts/audit";
import {
  CONTRACT_TEMPLATES,
  CONTRACT_TOKEN_DEFAULT_HOURS,
  type ContractTemplateId,
} from "@/lib/contracts/constants";
import { canonicalJson, createSigningToken, sha256 } from "@/lib/contracts/crypto";
import { maskEmail, type getRequestEvidence } from "@/lib/contracts/http";
import {
  contractInputPartySchema,
  type ContractInputParty,
  type CreateContractInputRequestInput,
  type DataHandlingContractConditions,
  type DataHandlingTemplateGenerationInput,
  type FdeMasterContractConditions,
  type FdeMasterTemplateGenerationInput,
  type NdaContractConditions,
  type NdaTemplateGenerationInput,
} from "@/lib/contracts/schemas";
import { createContract, getContract } from "@/lib/contracts/server";

export const CONTRACT_INPUT_REQUEST_STATUSES = [
  "pending",
  "submitted",
  "finalizing",
  "converted",
  "cancelled",
  "failed",
  "expired",
] as const;

export type ContractInputRequestStatus =
  (typeof CONTRACT_INPUT_REQUEST_STATUSES)[number];

export const CONTRACT_INPUT_REQUEST_STATUS_LABELS: Record<
  ContractInputRequestStatus,
  string
> = {
  pending: "相手方入力待ち",
  submitted: "入力内容の確認待ち",
  finalizing: "契約作成中",
  converted: "契約へ登録済み",
  cancelled: "取消済み",
  failed: "送信失敗",
  expired: "期限切れ",
};

type ContractConditions =
  | NdaContractConditions
  | DataHandlingContractConditions
  | FdeMasterContractConditions;

type ContractGenerationInput =
  | NdaTemplateGenerationInput
  | DataHandlingTemplateGenerationInput
  | FdeMasterTemplateGenerationInput;

export type ContractInputRequestRecord = {
  id: string;
  title: string;
  internalMemo: string;
  signerEmail: string;
  sourceTemplateId: ContractTemplateId;
  contractConditions: ContractConditions;
  contractConditionsSha256: string;
  electronicExecutionAccepted: true;
  status: ContractInputRequestStatus;
  submittedInput?: ContractInputParty;
  submittedInputSha256?: string;
  previewSha256?: string;
  contractId: string;
  activeTokenHash?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
  viewedAt?: Timestamp;
  submittedAt?: Timestamp;
  cancelledAt?: Timestamp;
  convertedAt?: Timestamp;
  auditLastHash: string;
  auditSequence: number;
};

export type ContractInputRequestView = Omit<
  ContractInputRequestRecord,
  "createdAt" | "updatedAt" | "expiresAt" | "viewedAt" | "submittedAt" | "cancelledAt" | "convertedAt"
> & {
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  viewedAt?: string;
  submittedAt?: string;
  cancelledAt?: string;
  convertedAt?: string;
};

type AdminActor = { uid: string; email?: string };
type RequestEvidence = ReturnType<typeof getRequestEvidence>;

function normalizeRequest(
  id: string,
  data: FirebaseFirestore.DocumentData
): ContractInputRequestRecord {
  return { id, ...(data as Omit<ContractInputRequestRecord, "id">) };
}

function serializeTimestamp(value?: Timestamp) {
  return value?.toDate().toISOString();
}

export function serializeContractInputRequest(
  request: ContractInputRequestRecord
): ContractInputRequestView {
  return {
    ...request,
    createdAt: serializeTimestamp(request.createdAt) ?? "",
    updatedAt: serializeTimestamp(request.updatedAt) ?? "",
    expiresAt: serializeTimestamp(request.expiresAt) ?? "",
    viewedAt: serializeTimestamp(request.viewedAt),
    submittedAt: serializeTimestamp(request.submittedAt),
    cancelledAt: serializeTimestamp(request.cancelledAt),
    convertedAt: serializeTimestamp(request.convertedAt),
  };
}

function writeEvents(
  transaction: Transaction,
  requestRef: DocumentReference,
  events: ContractAuditEvent[]
) {
  for (const event of events) {
    transaction.create(requestRef.collection("events").doc(event.eventId), event);
  }
}

function getInputBaseUrl() {
  const configured = process.env.SIGN_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return process.env.NODE_ENV === "production"
    ? "https://sign.make-it-tech.com"
    : "http://localhost:3000/sub/sign";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

async function sendInputRequestEmail(
  input: Pick<CreateContractInputRequestInput, "title" | "signerEmail"> & {
    sourceTemplateId: ContractTemplateId;
  },
  inputUrl: string,
  expiresAt: Date
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_MANUAL?.trim() || process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) throw new Error("メール送信設定が不足しています。");
  const deadline = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "long",
    timeStyle: "short",
  }).format(expiresAt);
  const template = CONTRACT_TEMPLATES[input.sourceTemplateId];
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.signerEmail],
      subject: `【Make It Tech】会社・署名者情報入力のお願い：${input.title}`,
      html: `<div style="font-family:sans-serif;line-height:1.8;color:#202124"><h2>契約当事者情報入力のお願い</h2><p>Make It Techとの「${escapeHtml(input.title)}」について、下記の専用ページから貴社情報と署名予定者情報をご入力ください。契約条件はMake It Techが設定します。</p><p><strong>契約書：</strong>${escapeHtml(template.name)}</p><p><strong>入力期限：</strong>${escapeHtml(deadline)}</p><p><a href="${escapeHtml(inputUrl)}" style="display:inline-block;padding:12px 20px;background:#df5d35;color:#fff;text-decoration:none;border-radius:8px">会社・署名者情報を入力する</a></p><p style="font-size:12px;color:#666">入力後、Make It Techが内容を確認して契約書PDFを作成します。このURLは第三者へ共有しないでください。</p></div>`,
      text: `Make It Techから会社・署名者情報入力のお願いです。契約条件はMake It Techが設定します。\n契約名: ${input.title}\n契約書: ${template.name}\n入力期限: ${deadline}\n入力URL: ${inputUrl}\n\nこのURLは第三者へ共有しないでください。`,
    }),
  });
  if (!response.ok) throw new Error("会社・署名者情報入力メールを送信できませんでした。");
}

export async function createContractInputRequest(
  input: CreateContractInputRequestInput,
  actor: AdminActor
) {
  const { firestore } = getFirebaseAdmin();
  const requestRef = firestore.collection("contractInputRequests").doc();
  const contractId = firestore.collection("contracts").doc().id;
  const { token, tokenHash } = createSigningToken();
  const tokenRef = firestore.collection("contractTokens").doc(tokenHash);
  const nowDate = new Date();
  const now = Timestamp.fromDate(nowDate);
  const expiresAtDate = new Date(
    nowDate.getTime() + CONTRACT_TOKEN_DEFAULT_HOURS * 60 * 60 * 1000
  );
  const expiresAt = Timestamp.fromDate(expiresAtDate);
  const contractConditionsSha256 = sha256(canonicalJson(input.contractConditions));
  const chain = buildAuditChain(requestRef.id, "", 0, [
    {
      eventType: "INPUT_REQUEST_CREATED",
      occurredAt: nowDate,
      actorType: "admin",
      actorId: actor.uid,
      metadata: {
        sourceTemplateId: input.sourceTemplateId,
        contractId,
        contractConditionsSha256,
        recipientEmailHash: sha256(input.signerEmail.toLowerCase()),
        expiresAt: expiresAtDate.toISOString(),
      },
    },
  ]);

  await firestore.runTransaction(async (transaction) => {
    transaction.create(requestRef, {
      title: input.title,
      internalMemo: input.internalMemo,
      signerEmail: input.signerEmail.toLowerCase(),
      sourceTemplateId: input.sourceTemplateId,
      contractConditions: input.contractConditions,
      contractConditionsSha256,
      electronicExecutionAccepted: input.electronicExecutionAccepted,
      contractId,
      status: "pending",
      activeTokenHash: tokenHash,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    transaction.create(tokenRef, {
      inputRequestId: requestRef.id,
      tokenHash,
      purpose: "recipient_input",
      status: "active",
      createdAt: now,
      expiresAt,
    });
    writeEvents(transaction, requestRef, chain.events);
  });

  const inputUrl = `${getInputBaseUrl()}/i/${token}`;
  try {
    await sendInputRequestEmail(input, inputUrl, expiresAtDate);
  } catch (error) {
    await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(requestRef);
      if (!snapshot.exists) return;
      const current = normalizeRequest(snapshot.id, snapshot.data()!);
      const failedAtDate = new Date();
      const failedAt = Timestamp.fromDate(failedAtDate);
      const failedChain = buildAuditChain(
        current.id,
        current.auditLastHash,
        current.auditSequence,
        [{
          eventType: "INPUT_REQUEST_FAILED",
          occurredAt: failedAtDate,
          actorType: "system",
          metadata: { delivery: "email", tokenRevoked: true },
        }]
      );
      transaction.update(requestRef, {
        status: "failed",
        activeTokenHash: FieldValue.delete(),
        updatedAt: failedAt,
        auditLastHash: failedChain.lastHash,
        auditSequence: failedChain.lastSequence,
      });
      transaction.update(tokenRef, { status: "revoked", revokedAt: failedAt });
      writeEvents(transaction, requestRef, failedChain.events);
    });
    throw error;
  }

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(requestRef);
    if (!snapshot.exists) return;
    const current = normalizeRequest(snapshot.id, snapshot.data()!);
    const sentAtDate = new Date();
    const sentAt = Timestamp.fromDate(sentAtDate);
    const sentChain = buildAuditChain(
      current.id,
      current.auditLastHash,
      current.auditSequence,
      [{
        eventType: "INPUT_REQUEST_SENT",
        occurredAt: sentAtDate,
        actorType: "admin",
        actorId: actor.uid,
        metadata: { delivery: "email" },
      }]
    );
    transaction.update(requestRef, {
      updatedAt: sentAt,
      auditLastHash: sentChain.lastHash,
      auditSequence: sentChain.lastSequence,
    });
    writeEvents(transaction, requestRef, sentChain.events);
  });

  return { id: requestRef.id, inputUrl, expiresAt: expiresAtDate.toISOString() };
}

export async function getContractInputRequest(id: string) {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore.collection("contractInputRequests").doc(id).get();
  return snapshot.exists ? normalizeRequest(snapshot.id, snapshot.data()!) : null;
}

export async function getContractInputRequests(limit = 100) {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection("contractInputRequests")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((item) => normalizeRequest(item.id, item.data()));
}

export async function getContractInputRequestEvents(requestId: string) {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection("contractInputRequests")
    .doc(requestId)
    .collection("events")
    .orderBy("sequence", "asc")
    .limit(500)
    .get();
  return snapshot.docs.map((document) => {
    const data = document.data() as ContractAuditEvent;
    return { ...data, occurredAt: data.occurredAt.toDate().toISOString() };
  });
}

export type PublicContractInputRequest = {
  id: string;
  title: string;
  sourceTemplateId: ContractTemplateId;
  templateName: string;
  signerEmailMasked: string;
  expiresAt: string;
};

type OpenInputRequestResult =
  | { state: "available"; request: PublicContractInputRequest }
  | { state: "invalid" }
  | { state: "expired" }
  | { state: "submitted" }
  | { state: "cancelled" };

export async function openContractInputRequest(
  token: string,
  evidence: RequestEvidence
): Promise<OpenInputRequestResult> {
  const tokenHash = sha256(token);
  const { firestore } = getFirebaseAdmin();
  const tokenRef = firestore.collection("contractTokens").doc(tokenHash);
  return firestore.runTransaction(async (transaction) => {
    const tokenSnapshot = await transaction.get(tokenRef);
    if (!tokenSnapshot.exists || tokenSnapshot.data()?.purpose !== "recipient_input") {
      return { state: "invalid" } as const;
    }
    const inputRequestId = String(tokenSnapshot.data()?.inputRequestId ?? "");
    if (!inputRequestId) return { state: "invalid" } as const;
    const requestRef = firestore.collection("contractInputRequests").doc(inputRequestId);
    const requestSnapshot = await transaction.get(requestRef);
    if (!requestSnapshot.exists) return { state: "invalid" } as const;
    const inputRequest = normalizeRequest(requestSnapshot.id, requestSnapshot.data()!);
    if (inputRequest.status === "cancelled") {
      return { state: "cancelled" } as const;
    }
    if (inputRequest.status === "submitted" || inputRequest.status === "converted") {
      return { state: "submitted" } as const;
    }
    if (inputRequest.status !== "pending" || tokenSnapshot.data()?.status !== "active") {
      return { state: "invalid" } as const;
    }
    if (inputRequest.expiresAt.toDate().getTime() <= Date.now()) {
      const expiredAtDate = new Date();
      const expiredAt = Timestamp.fromDate(expiredAtDate);
      const chain = buildAuditChain(
        inputRequest.id,
        inputRequest.auditLastHash,
        inputRequest.auditSequence,
        [{
          eventType: "INPUT_REQUEST_EXPIRED",
          occurredAt: expiredAtDate,
          actorType: "system",
        }]
      );
      transaction.update(requestRef, {
        status: "expired",
        updatedAt: expiredAt,
        auditLastHash: chain.lastHash,
        auditSequence: chain.lastSequence,
      });
      transaction.update(tokenRef, { status: "expired", expiredAt });
      writeEvents(transaction, requestRef, chain.events);
      return { state: "expired" } as const;
    }
    if (!inputRequest.viewedAt) {
      const viewedAtDate = new Date();
      const viewedAt = Timestamp.fromDate(viewedAtDate);
      const chain = buildAuditChain(
        inputRequest.id,
        inputRequest.auditLastHash,
        inputRequest.auditSequence,
        [{
          eventType: "INPUT_PAGE_OPENED",
          occurredAt: viewedAtDate,
          actorType: "signer",
          actorId: sha256(inputRequest.signerEmail),
          ipAddress: evidence.ipAddress,
          userAgent: evidence.userAgent,
          requestId: evidence.requestId,
        }]
      );
      transaction.update(requestRef, {
        viewedAt,
        updatedAt: viewedAt,
        auditLastHash: chain.lastHash,
        auditSequence: chain.lastSequence,
      });
      writeEvents(transaction, requestRef, chain.events);
    }
    const template = CONTRACT_TEMPLATES[inputRequest.sourceTemplateId];
    return {
      state: "available",
      request: {
        id: inputRequest.id,
        title: inputRequest.title,
        sourceTemplateId: inputRequest.sourceTemplateId,
        templateName: template.name,
        signerEmailMasked: maskEmail(inputRequest.signerEmail),
        expiresAt: inputRequest.expiresAt.toDate().toISOString(),
      },
    } as const;
  });
}

function parseSubmittedInput(payload: unknown) {
  const party = contractInputPartySchema.safeParse(payload);
  if (!party.success) {
    throw new Error("入力内容を確認してください。すべての必須項目を入力してください。");
  }
  return party.data;
}

export function buildContractInputGenerationInput(
  inputRequest: ContractInputRequestRecord
): ContractGenerationInput {
  if (!inputRequest.submittedInput || !inputRequest.submittedInputSha256) {
    throw new Error("相手方の入力が完了していません。");
  }
  if (inputRequest.electronicExecutionAccepted !== true) {
    throw new Error("電子締結用文言への置換確認が完了していません。");
  }
  if (
    sha256(canonicalJson(inputRequest.submittedInput)) !==
    inputRequest.submittedInputSha256
  ) {
    throw new Error("相手方入力のHashが一致しません。");
  }
  if (
    sha256(canonicalJson(inputRequest.contractConditions)) !==
    inputRequest.contractConditionsSha256
  ) {
    throw new Error("Make It Techが設定した契約条件のHashが一致しません。");
  }
  return {
    ...inputRequest.contractConditions,
    ...inputRequest.submittedInput,
    electronicExecutionAccepted: true,
  } as ContractGenerationInput;
}

export async function submitContractInputRequest(
  token: string,
  payload: unknown,
  evidence: RequestEvidence
) {
  const tokenHash = sha256(token);
  const { firestore } = getFirebaseAdmin();
  const tokenRef = firestore.collection("contractTokens").doc(tokenHash);
  const tokenSnapshot = await tokenRef.get();
  if (!tokenSnapshot.exists || tokenSnapshot.data()?.purpose !== "recipient_input") {
    throw new Error("入力URLが無効です。");
  }
  const requestRef = firestore
    .collection("contractInputRequests")
    .doc(String(tokenSnapshot.data()?.inputRequestId ?? ""));
  const submittedInput = parseSubmittedInput(payload);
  const submittedInputSha256 = sha256(canonicalJson(submittedInput));

  await firestore.runTransaction(async (transaction) => {
    const [currentTokenSnapshot, currentRequestSnapshot] = await Promise.all([
      transaction.get(tokenRef),
      transaction.get(requestRef),
    ]);
    if (!currentTokenSnapshot.exists || !currentRequestSnapshot.exists) {
      throw new Error("入力依頼が見つかりません。");
    }
    const current = normalizeRequest(currentRequestSnapshot.id, currentRequestSnapshot.data()!);
    if (
      current.status !== "pending" ||
      currentTokenSnapshot.data()?.status !== "active" ||
      current.expiresAt.toDate().getTime() <= Date.now()
    ) {
      throw new Error("この入力URLは使用できません。");
    }
    const submittedAtDate = new Date();
    const submittedAt = Timestamp.fromDate(submittedAtDate);
    const chain = buildAuditChain(
      current.id,
      current.auditLastHash,
      current.auditSequence,
      [{
        eventType: "RECIPIENT_INPUT_SUBMITTED",
        occurredAt: submittedAtDate,
        actorType: "signer",
        actorId: sha256(current.signerEmail),
        ipAddress: evidence.ipAddress,
        userAgent: evidence.userAgent,
        requestId: evidence.requestId,
        metadata: {
          sourceTemplateId: current.sourceTemplateId,
          submittedInputSha256,
        },
      }]
    );
    transaction.update(requestRef, {
      status: "submitted",
      submittedInput,
      submittedInputSha256,
      submittedAt,
      updatedAt: submittedAt,
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
      activeTokenHash: FieldValue.delete(),
    });
    transaction.update(tokenRef, { status: "used", usedAt: submittedAt });
    writeEvents(transaction, requestRef, chain.events);
  });
}

export async function reissueContractInputRequest(
  requestId: string,
  actor: AdminActor
) {
  const { firestore } = getFirebaseAdmin();
  const requestRef = firestore.collection("contractInputRequests").doc(requestId);
  const { token, tokenHash } = createSigningToken();
  const tokenRef = firestore.collection("contractTokens").doc(tokenHash);
  const issuedAtDate = new Date();
  const issuedAt = Timestamp.fromDate(issuedAtDate);
  const expiresAtDate = new Date(
    issuedAtDate.getTime() + CONTRACT_TOKEN_DEFAULT_HOURS * 60 * 60 * 1000
  );
  const expiresAt = Timestamp.fromDate(expiresAtDate);
  let currentRequest!: ContractInputRequestRecord;

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(requestRef);
    if (!snapshot.exists) throw new Error("入力依頼が見つかりません。");
    currentRequest = normalizeRequest(snapshot.id, snapshot.data()!);
    if (!["pending", "expired", "failed"].includes(currentRequest.status)) {
      throw new Error("この入力依頼は再発行できません。");
    }
    if (currentRequest.activeTokenHash) {
      transaction.set(
        firestore.collection("contractTokens").doc(currentRequest.activeTokenHash),
        { status: "revoked", revokedAt: issuedAt },
        { merge: true }
      );
    }
    const chain = buildAuditChain(
      currentRequest.id,
      currentRequest.auditLastHash,
      currentRequest.auditSequence,
      [{
        eventType: "INPUT_REQUEST_REISSUED",
        occurredAt: issuedAtDate,
        actorType: "admin",
        actorId: actor.uid,
        metadata: { expiresAt: expiresAtDate.toISOString() },
      }]
    );
    transaction.create(tokenRef, {
      inputRequestId: currentRequest.id,
      tokenHash,
      purpose: "recipient_input",
      status: "active",
      createdAt: issuedAt,
      expiresAt,
    });
    transaction.update(requestRef, {
      status: "pending",
      activeTokenHash: tokenHash,
      expiresAt,
      updatedAt: issuedAt,
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    writeEvents(transaction, requestRef, chain.events);
  });

  const inputUrl = `${getInputBaseUrl()}/i/${token}`;
  try {
    await sendInputRequestEmail(
      {
        title: currentRequest.title,
        signerEmail: currentRequest.signerEmail,
        sourceTemplateId: currentRequest.sourceTemplateId,
      },
      inputUrl,
      expiresAtDate
    );
  } catch (error) {
    await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(requestRef);
      if (!snapshot.exists || snapshot.data()?.activeTokenHash !== tokenHash) return;
      const current = normalizeRequest(snapshot.id, snapshot.data()!);
      const failedAtDate = new Date();
      const failedAt = Timestamp.fromDate(failedAtDate);
      const chain = buildAuditChain(
        current.id,
        current.auditLastHash,
        current.auditSequence,
        [{
          eventType: "INPUT_REQUEST_FAILED",
          occurredAt: failedAtDate,
          actorType: "admin",
          actorId: actor.uid,
          metadata: { delivery: "email", tokenRevoked: true },
        }]
      );
      transaction.update(requestRef, {
        status: "failed",
        activeTokenHash: FieldValue.delete(),
        updatedAt: failedAt,
        auditLastHash: chain.lastHash,
        auditSequence: chain.lastSequence,
      });
      transaction.update(tokenRef, { status: "revoked", revokedAt: failedAt });
      writeEvents(transaction, requestRef, chain.events);
    });
    throw error;
  }

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(requestRef);
    if (
      !snapshot.exists ||
      snapshot.data()?.activeTokenHash !== tokenHash ||
      snapshot.data()?.status !== "pending"
    ) return;
    const current = normalizeRequest(snapshot.id, snapshot.data()!);
    const sentAtDate = new Date();
    const sentAt = Timestamp.fromDate(sentAtDate);
    const chain = buildAuditChain(
      current.id,
      current.auditLastHash,
      current.auditSequence,
      [{
        eventType: "INPUT_REQUEST_SENT",
        occurredAt: sentAtDate,
        actorType: "admin",
        actorId: actor.uid,
        metadata: { delivery: "email", reissued: true },
      }]
    );
    transaction.update(requestRef, {
      updatedAt: sentAt,
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    writeEvents(transaction, requestRef, chain.events);
  });
  return { inputUrl, expiresAt: expiresAtDate.toISOString() };
}

export async function cancelContractInputRequest(
  requestId: string,
  actor: AdminActor
) {
  const { firestore } = getFirebaseAdmin();
  const requestRef = firestore.collection("contractInputRequests").doc(requestId);
  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(requestRef);
    if (!snapshot.exists) throw new Error("入力依頼が見つかりません。");
    const current = normalizeRequest(snapshot.id, snapshot.data()!);
    if (current.status === "cancelled") return;
    if (!["pending", "submitted", "expired", "failed"].includes(current.status)) {
      throw new Error("この入力依頼は取り消せません。");
    }
    const cancelledAtDate = new Date();
    const cancelledAt = Timestamp.fromDate(cancelledAtDate);
    const chain = buildAuditChain(
      current.id,
      current.auditLastHash,
      current.auditSequence,
      [{
        eventType: "INPUT_REQUEST_CANCELLED",
        occurredAt: cancelledAtDate,
        actorType: "admin",
        actorId: actor.uid,
        metadata: {
          previousStatus: current.status,
          activeTokenRevoked: Boolean(current.activeTokenHash),
        },
      }]
    );
    if (current.activeTokenHash) {
      transaction.set(
        firestore.collection("contractTokens").doc(current.activeTokenHash),
        { status: "revoked", revokedAt: cancelledAt },
        { merge: true }
      );
    }
    transaction.update(requestRef, {
      status: "cancelled",
      activeTokenHash: FieldValue.delete(),
      cancelledAt,
      updatedAt: cancelledAt,
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    writeEvents(transaction, requestRef, chain.events);
  });
}

export async function recordContractInputPreview(
  requestId: string,
  previewSha256: string,
  actor: AdminActor
) {
  const { firestore } = getFirebaseAdmin();
  const requestRef = firestore.collection("contractInputRequests").doc(requestId);
  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(requestRef);
    if (!snapshot.exists) throw new Error("入力依頼が見つかりません。");
    const current = normalizeRequest(snapshot.id, snapshot.data()!);
    if (current.status !== "submitted") throw new Error("入力確認済みの依頼ではありません。");
    const occurredAtDate = new Date();
    const occurredAt = Timestamp.fromDate(occurredAtDate);
    const chain = buildAuditChain(current.id, current.auditLastHash, current.auditSequence, [{
      eventType: "INPUT_PDF_PREVIEWED",
      occurredAt: occurredAtDate,
      actorType: "admin",
      actorId: actor.uid,
      metadata: { previewSha256 },
    }]);
    transaction.update(requestRef, {
      previewSha256,
      updatedAt: occurredAt,
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    writeEvents(transaction, requestRef, chain.events);
  });
}

export async function finalizeContractInputRequest(
  requestId: string,
  pdf: File | null,
  actor: AdminActor
) {
  const { firestore } = getFirebaseAdmin();
  const requestRef = firestore.collection("contractInputRequests").doc(requestId);
  const initialSnapshot = await requestRef.get();
  if (!initialSnapshot.exists) throw new Error("入力依頼が見つかりません。");
  let inputRequest = normalizeRequest(initialSnapshot.id, initialSnapshot.data()!);
  if (inputRequest.status === "converted") {
    const existing = await getContract(inputRequest.contractId);
    if (!existing) throw new Error("登録済みの契約が見つかりません。");
    return { id: existing.id, contractNumber: existing.contractNumber };
  }
  if (!["submitted", "finalizing"].includes(inputRequest.status)) {
    throw new Error("相手方の入力が完了していません。");
  }
  const generationInput = buildContractInputGenerationInput(inputRequest);
  const existing = await getContract(inputRequest.contractId);
  if (existing) {
    if (
      existing.document.sha256 !== inputRequest.previewSha256 ||
      existing.sourceInputRequestId !== inputRequest.id ||
      existing.sourceInputSha256 !== inputRequest.submittedInputSha256
    ) {
      throw new Error("確保済み契約と入力依頼の証跡が一致しません。");
    }
    if (inputRequest.status === "submitted") {
      inputRequest = await firestore.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(requestRef);
        if (!snapshot.exists) throw new Error("入力依頼が見つかりません。");
        const current = normalizeRequest(snapshot.id, snapshot.data()!);
        if (current.status === "converted") return current;
        if (current.status !== "submitted") return current;
        transaction.update(requestRef, {
          status: "finalizing",
          updatedAt: Timestamp.now(),
        });
        return { ...current, status: "finalizing" as const };
      });
    }
  }

  let bytes: Uint8Array | null = null;
  let pdfSha256 = inputRequest.previewSha256 ?? "";
  if (!existing) {
    if (!pdf) {
      if (inputRequest.status === "finalizing") {
        await firestore.runTransaction(async (transaction) => {
          const [requestSnapshot, contractSnapshot] = await Promise.all([
            transaction.get(requestRef),
            transaction.get(firestore.collection("contracts").doc(inputRequest.contractId)),
          ]);
          if (
            requestSnapshot.exists &&
            requestSnapshot.data()?.status === "finalizing" &&
            !contractSnapshot.exists
          ) {
            transaction.update(requestRef, {
              status: "submitted",
              updatedAt: Timestamp.now(),
            });
          }
        });
      }
      throw new Error("確認済みPDFがありません。PDFを再生成して再開してください。");
    }
    bytes = new Uint8Array(await pdf.arrayBuffer());
    pdfSha256 = sha256(bytes);
    if (!inputRequest.previewSha256 || inputRequest.previewSha256 !== pdfSha256) {
      throw new Error("確認したPDFと登録するPDFが一致しません。もう一度内容を確認してください。");
    }
    inputRequest = await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(requestRef);
      if (!snapshot.exists) throw new Error("入力依頼が見つかりません。");
      const current = normalizeRequest(snapshot.id, snapshot.data()!);
      if (current.status === "converted") return current;
      if (!["submitted", "finalizing"].includes(current.status)) {
        throw new Error("この入力依頼から契約を作成できません。");
      }
      if (current.previewSha256 !== pdfSha256) {
        throw new Error("確認済みPDFのHashが変更されています。");
      }
      if (current.status === "submitted") {
        transaction.update(requestRef, {
          status: "finalizing",
          updatedAt: Timestamp.now(),
        });
      }
      return { ...current, status: "finalizing" as const };
    });
  }

  let result = existing
    ? { id: existing.id, contractNumber: existing.contractNumber }
    : null;
  if (!result && bytes && pdf) {
    try {
      const template = CONTRACT_TEMPLATES[inputRequest.sourceTemplateId];
      result = await createContract(
        {
          title: inputRequest.title,
          type: template.contractType,
          internalMemo: inputRequest.internalMemo,
          companyName: inputRequest.submittedInput!.companyName,
          corporateNumber: inputRequest.submittedInput!.corporateNumber,
          companyAddress: inputRequest.submittedInput!.companyAddress,
          signerName: inputRequest.submittedInput!.representativeName,
          signerRole: inputRequest.submittedInput!.representativeRole,
          signerEmail: inputRequest.signerEmail,
          sourceTemplateId: inputRequest.sourceTemplateId,
          effectiveDate: generationInput.effectiveDate,
        },
        new File([Buffer.from(bytes)], pdf.name, { type: "application/pdf" }),
        actor,
        {
          contractId: inputRequest.contractId,
          sourceInputRequestId: inputRequest.id,
          sourceInputSha256: inputRequest.submittedInputSha256,
        }
      );
    } catch (error) {
      await firestore.runTransaction(async (transaction) => {
        const [requestSnapshot, contractSnapshot] = await Promise.all([
          transaction.get(requestRef),
          transaction.get(firestore.collection("contracts").doc(inputRequest.contractId)),
        ]);
        if (
          requestSnapshot.exists &&
          requestSnapshot.data()?.status === "finalizing" &&
          !contractSnapshot.exists
        ) {
          transaction.update(requestRef, {
            status: "submitted",
            updatedAt: Timestamp.now(),
          });
        }
      }).catch(() => undefined);
      throw error;
    }
  }
  if (!result) throw new Error("契約作成を再開できませんでした。");

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(requestRef);
    if (!snapshot.exists) throw new Error("入力依頼が見つかりません。");
    const current = normalizeRequest(snapshot.id, snapshot.data()!);
    if (current.status === "converted" && current.contractId === result!.id) return;
    if (current.status !== "finalizing" || current.contractId !== result!.id) {
      throw new Error("入力依頼の最終化状態が一致しません。");
    }
    const convertedAtDate = new Date();
    const convertedAt = Timestamp.fromDate(convertedAtDate);
    const chain = buildAuditChain(current.id, current.auditLastHash, current.auditSequence, [{
      eventType: "INPUT_REQUEST_CONVERTED",
      occurredAt: convertedAtDate,
      actorType: "admin",
      actorId: actor.uid,
      metadata: {
        contractId: result!.id,
        documentSha256: pdfSha256,
        submittedInputSha256: current.submittedInputSha256,
      },
    }]);
    transaction.update(requestRef, {
      status: "converted",
      convertedAt,
      updatedAt: convertedAt,
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    writeEvents(transaction, requestRef, chain.events);
  });
  return result;
}
