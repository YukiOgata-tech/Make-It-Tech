import "server-only";

import { FieldValue, Timestamp, type DocumentReference, type Transaction } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import {
  AUTHORITY_STATEMENT_VERSION,
  CONSENT_STATEMENT_VERSION,
  CONTRACT_DOCUMENT_ACCESS_DAYS,
  CONTRACT_DOCUMENT_VERSION,
  CONTRACT_PDF_MAX_BYTES,
  CONTRACT_TEMPLATES,
  CONTRACT_TOKEN_DEFAULT_DAYS,
  type ContractStatus,
  type ContractTemplateId,
  type ContractType,
  type VerificationMethod,
} from "@/lib/contracts/constants";
import { buildAuditChain, type ContractAuditEvent } from "@/lib/contracts/audit";
import { createSigningToken, sha256 } from "@/lib/contracts/crypto";
import type { CreateContractInput } from "@/lib/contracts/schemas";
import { validateOriginalPdf } from "@/lib/contracts/pdf-validation";
import {
  getContractStoragePath,
  readContractPdf,
  removeContractPdfAfterFailedCreate,
  saveContractPdfOnce,
} from "@/lib/contracts/storage";
import { getVerificationProvider } from "@/lib/contracts/verification";
import {
  canAccessContractDocument,
  canVoidContractStatus,
  getContractTokenPurpose,
  type ContractDocumentKind,
} from "@/lib/contracts/token-policy";

type RequestEvidence = {
  ipAddress: string;
  userAgent: string;
  requestId: string;
};

type AdminActor = {
  uid: string;
  email?: string;
};

type StoredDocument = {
  version: number;
  storagePath: string;
  sha256: string;
  size: number;
  pageCount: number;
  originalFileName: string;
  contentType: "application/pdf";
  lockedAt?: Timestamp;
};

export type ContractRecord = {
  id: string;
  contractNumber: string;
  title: string;
  type: ContractType;
  internalMemo: string;
  status: ContractStatus;
  company: {
    name: string;
    corporateNumber: string;
    address: string;
  };
  signer: {
    name: string;
    role: string;
    email: string;
  };
  verificationMethod: VerificationMethod;
  effectiveDate?: string;
  sourceTemplate?: {
    id: ContractTemplateId;
    name: string;
    version: string;
    sourceSha256: string;
    fileName: string;
  };
  document: StoredDocument;
  executedDocument?: { storagePath: string; sha256: string };
  certificateDocument?: { storagePath: string; sha256: string };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sentAt?: Timestamp;
  viewedAt?: Timestamp;
  signedAt?: Timestamp;
  completedAt?: Timestamp;
  voidedAt?: Timestamp;
  tokenExpiresAt?: Timestamp;
  activeTokenHash?: string;
  documentAccessExpiresAt?: Timestamp;
  documentAccessTokenHash?: string;
  auditLastHash: string;
  auditSequence: number;
  acceptance?: {
    verificationMethod: VerificationMethod;
    verificationStatus: "succeeded";
    verificationTransactionId: string | null;
    verifiedAt: Timestamp;
    identityAccepted: true;
    authorityAccepted: true;
    authorityStatementVersion: string;
    reviewedAccepted: true;
    consentAccepted: true;
    consentStatementVersion: string;
    acceptedAt: Timestamp;
    ipAddress: string;
    userAgent: string;
    requestId: string;
  };
  pendingCompletionEvent?: ContractAuditEvent;
};

export type ContractView = Omit<
  ContractRecord,
  | "createdAt"
  | "updatedAt"
  | "sentAt"
  | "viewedAt"
  | "signedAt"
  | "completedAt"
  | "voidedAt"
  | "tokenExpiresAt"
  | "documentAccessExpiresAt"
  | "document"
  | "pendingCompletionEvent"
> & {
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  completedAt?: string;
  voidedAt?: string;
  tokenExpiresAt?: string;
  documentAccessExpiresAt?: string;
  document: Omit<StoredDocument, "lockedAt"> & { lockedAt?: string };
};

export type PublicContractView = {
  id: string;
  contractNumber: string;
  title: string;
  type: ContractType;
  status: ContractStatus;
  companyName: string;
  corporateNumber: string;
  signerName: string;
  signerRole: string;
  signerEmailMasked: string;
  verificationMethod: VerificationMethod;
  documentVersion: number;
  documentSha256: string;
  tokenExpiresAt?: string;
  signedAt?: string;
  completedAt?: string;
  executedAvailable: boolean;
  certificateAvailable: boolean;
};

function timestampToIso(value: Timestamp | undefined) {
  return value?.toDate().toISOString();
}

function normalizeContract(id: string, data: FirebaseFirestore.DocumentData): ContractRecord {
  return { id, ...(data as Omit<ContractRecord, "id">) };
}

export function serializeContract(contract: ContractRecord): ContractView {
  const rest = { ...contract };
  delete rest.pendingCompletionEvent;
  return {
    ...rest,
    createdAt: timestampToIso(contract.createdAt) ?? "",
    updatedAt: timestampToIso(contract.updatedAt) ?? "",
    sentAt: timestampToIso(contract.sentAt),
    viewedAt: timestampToIso(contract.viewedAt),
    signedAt: timestampToIso(contract.signedAt),
    completedAt: timestampToIso(contract.completedAt),
    voidedAt: timestampToIso(contract.voidedAt),
    tokenExpiresAt: timestampToIso(contract.tokenExpiresAt),
    documentAccessExpiresAt: timestampToIso(contract.documentAccessExpiresAt),
    document: {
      ...contract.document,
      lockedAt: timestampToIso(contract.document.lockedAt),
    },
  };
}

function toPublicContract(contract: ContractRecord, linkExpiresAt = contract.tokenExpiresAt): PublicContractView {
  const [local = "", domain = ""] = contract.signer.email.split("@");
  return {
    id: contract.id,
    contractNumber: contract.contractNumber,
    title: contract.title,
    type: contract.type,
    status: contract.status,
    companyName: contract.company.name,
    corporateNumber: contract.company.corporateNumber,
    signerName: contract.signer.name,
    signerRole: contract.signer.role,
    signerEmailMasked: local && domain ? `${local.slice(0, 1)}***@${domain}` : "***",
    verificationMethod: contract.verificationMethod,
    documentVersion: contract.document.version,
    documentSha256: contract.document.sha256,
    tokenExpiresAt: timestampToIso(linkExpiresAt),
    signedAt: timestampToIso(contract.signedAt),
    completedAt: timestampToIso(contract.completedAt),
    executedAvailable: Boolean(contract.executedDocument?.storagePath),
    certificateAvailable: Boolean(contract.certificateDocument?.storagePath),
  };
}

function writeAuditEvents(
  transaction: Transaction,
  contractRef: DocumentReference,
  events: ContractAuditEvent[]
) {
  for (const event of events) {
    transaction.create(contractRef.collection("events").doc(event.eventId), event);
  }
}

function safeOriginalFileName(name: string) {
  const cleaned = name.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return cleaned.slice(0, 240) || "contract.pdf";
}

function jstYear(date: Date) {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", year: "numeric" }).format(date)
  );
}

export async function createContract(input: CreateContractInput, pdf: File, actor: AdminActor) {
  if (pdf.type !== "application/pdf") throw new Error("PDF形式のファイルを選択してください。");
  if (pdf.size < 1 || pdf.size > CONTRACT_PDF_MAX_BYTES) {
    throw new Error("契約書PDFは4MB以内にしてください。");
  }

  const bytes = new Uint8Array(await pdf.arrayBuffer());
  const validation = await validateOriginalPdf(bytes);
  const documentSha256 = sha256(bytes);
  const sourceTemplateId = input.sourceTemplateId;
  const template = sourceTemplateId
    ? CONTRACT_TEMPLATES[sourceTemplateId]
    : undefined;
  if (template && template.contractType !== input.type) {
    throw new Error("選択したテンプレートと契約種別が一致しません。");
  }
  const { firestore } = getFirebaseAdmin();
  const contractRef = firestore.collection("contracts").doc();
  const original = await saveContractPdfOnce(contractRef.id, "original", bytes);
  const nowDate = new Date();
  const now = Timestamp.fromDate(nowDate);
  const year = jstYear(nowDate);

  try {
    const result = await firestore.runTransaction(async (transaction) => {
      const counterRef = firestore.collection("counters").doc(`contracts-${year}`);
      const counterSnapshot = await transaction.get(counterRef);
      const nextNumber = Number(counterSnapshot.data()?.value ?? 0) + 1;
      const contractNumber = `MIT-C-${year}-${String(nextNumber).padStart(5, "0")}`;
      const chain = buildAuditChain(contractRef.id, "", 0, [
        {
          eventType: "CONTRACT_CREATED",
          occurredAt: nowDate,
          actorType: "admin",
          actorId: actor.uid,
          metadata: {
            contractNumber,
            contractType: input.type,
            ...(input.effectiveDate ? { effectiveDate: input.effectiveDate } : {}),
            ...(template
              ? {
                  sourceTemplateId,
                  sourceTemplateVersion: template.version,
                  sourceTemplateSha256: template.sourceSha256,
                }
              : {}),
          },
        },
        {
          eventType: "DOCUMENT_UPLOADED",
          occurredAt: nowDate,
          actorType: "admin",
          actorId: actor.uid,
          metadata: {
            documentVersion: CONTRACT_DOCUMENT_VERSION,
            documentSha256,
            pageCount: validation.pageCount,
            size: pdf.size,
          },
        },
      ]);

      transaction.set(counterRef, { value: nextNumber, updatedAt: now }, { merge: true });
      transaction.create(contractRef, {
        contractNumber,
        title: input.title,
        type: input.type,
        internalMemo: input.internalMemo,
        status: "draft",
        company: {
          name: input.companyName,
          corporateNumber: input.corporateNumber,
          address: input.companyAddress,
        },
        signer: {
          name: input.signerName,
          role: input.signerRole,
          email: input.signerEmail.toLowerCase(),
        },
        verificationMethod: "company_email_link",
        ...(input.effectiveDate ? { effectiveDate: input.effectiveDate } : {}),
        ...(template && sourceTemplateId
          ? {
              sourceTemplate: {
                id: sourceTemplateId,
                name: template.name,
                version: template.version,
                sourceSha256: template.sourceSha256,
                fileName: template.fileName,
              },
            }
          : {}),
        document: {
          version: CONTRACT_DOCUMENT_VERSION,
          storagePath: original.path,
          sha256: documentSha256,
          size: pdf.size,
          pageCount: validation.pageCount,
          originalFileName: safeOriginalFileName(pdf.name),
          contentType: "application/pdf",
        },
        createdAt: now,
        updatedAt: now,
        auditLastHash: chain.lastHash,
        auditSequence: chain.lastSequence,
      });
      writeAuditEvents(transaction, contractRef, chain.events);
      return { id: contractRef.id, contractNumber };
    });
    return result;
  } catch (error) {
    await removeContractPdfAfterFailedCreate(original.path).catch(() => undefined);
    throw error;
  }
}

export async function acceptContractForMit(contractId: string, actor: AdminActor) {
  const { firestore } = getFirebaseAdmin();
  const contractRef = firestore.collection("contracts").doc(contractId);
  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(contractRef);
    if (!snapshot.exists) throw new Error("契約が見つかりません。");
    const contract = normalizeContract(snapshot.id, snapshot.data()!);
    if (contract.status !== "draft") throw new Error("下書き状態の契約だけを確定できます。");
    const nowDate = new Date();
    const now = Timestamp.fromDate(nowDate);
    const chain = buildAuditChain(contract.id, contract.auditLastHash, contract.auditSequence, [
      {
        eventType: "MIT_ACCEPTED",
        occurredAt: nowDate,
        actorType: "admin",
        actorId: actor.uid,
        metadata: { documentVersion: contract.document.version },
      },
      {
        eventType: "DOCUMENT_LOCKED",
        occurredAt: nowDate,
        actorType: "system",
        metadata: { documentSha256: contract.document.sha256 },
      },
    ]);
    transaction.update(contractRef, {
      status: "ready",
      "document.lockedAt": now,
      mitAcceptedAt: now,
      updatedAt: now,
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    writeAuditEvents(transaction, contractRef, chain.events);
  });
}

function getSignBaseUrl() {
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

async function sendSignatureRequestEmail(contract: ContractRecord, signingUrl: string, expiresAt: Date) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_MANUAL?.trim() || process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) throw new Error("メール送信設定が不足しています。");
  const deadline = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "long",
    timeStyle: "short",
  }).format(expiresAt);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [contract.signer.email],
      subject: `【Make It Tech】電子契約のご確認：${contract.title}`,
      html: `<div style="font-family:sans-serif;line-height:1.8;color:#202124"><h2>Make It Techから電子契約のご確認</h2><p>${escapeHtml(contract.signer.name)} 様</p><p>${escapeHtml(contract.company.name)}との「${escapeHtml(contract.title)}」について、下記の専用ページで内容をご確認ください。</p><p><strong>署名期限：</strong>${escapeHtml(deadline)}</p><p><a href="${escapeHtml(signingUrl)}" style="display:inline-block;padding:12px 20px;background:#df5d35;color:#fff;text-decoration:none;border-radius:8px">契約書を確認する</a></p><p style="font-size:12px;color:#666">このメールに心当たりがない場合は、リンクを開かずMake It Techへご連絡ください。このURLは第三者へ共有しないでください。</p></div>`,
      text: `Make It Techから電子契約のご確認です。\n契約名: ${contract.title}\n契約先: ${contract.company.name}\n署名予定者: ${contract.signer.name}\n署名期限: ${deadline}\n署名URL: ${signingUrl}\n\n心当たりがない場合はURLを開かずMake It Techへご連絡ください。`,
    }),
  });
  if (!response.ok) throw new Error("署名依頼メールの送信に失敗しました。");
}

export async function sendContract(contractId: string, expiresInDays = CONTRACT_TOKEN_DEFAULT_DAYS, actor: AdminActor) {
  const { firestore } = getFirebaseAdmin();
  const contractRef = firestore.collection("contracts").doc(contractId);
  const { token, tokenHash } = createSigningToken();
  const tokenRef = firestore.collection("contractTokens").doc(tokenHash);
  const nowDate = new Date();
  const expiresAt = new Date(nowDate.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
  let contract!: ContractRecord;

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(contractRef);
    if (!snapshot.exists) throw new Error("契約が見つかりません。");
    contract = normalizeContract(snapshot.id, snapshot.data()!);
    if (contract.status !== "ready") throw new Error("送信準備完了の契約だけを送信できます。");
    const chain = buildAuditChain(contract.id, contract.auditLastHash, contract.auditSequence, [
      {
        eventType: "SIGN_REQUEST_CREATED",
        occurredAt: nowDate,
        actorType: "admin",
        actorId: actor.uid,
        metadata: { expiresAt: expiresAt.toISOString() },
      },
    ]);
    transaction.create(tokenRef, {
      contractId,
      tokenHash,
      purpose: "signing",
      status: "active",
      createdAt: Timestamp.fromDate(nowDate),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
    transaction.update(contractRef, {
      status: "sent",
      activeTokenHash: tokenHash,
      tokenExpiresAt: Timestamp.fromDate(expiresAt),
      sentAt: Timestamp.fromDate(nowDate),
      updatedAt: Timestamp.fromDate(nowDate),
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    writeAuditEvents(transaction, contractRef, chain.events);
  });

  const signingUrl = `${getSignBaseUrl()}/c/${token}`;
  try {
    await sendSignatureRequestEmail(contract, signingUrl, expiresAt);
  } catch (error) {
    await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(contractRef);
      if (!snapshot.exists || snapshot.data()?.activeTokenHash !== tokenHash) return;
      const current = normalizeContract(snapshot.id, snapshot.data()!);
      const eventDate = new Date();
      const eventTime = Timestamp.fromDate(eventDate);
      const chain = buildAuditChain(current.id, current.auditLastHash, current.auditSequence, [
        {
          eventType: "SIGN_REQUEST_FAILED",
          occurredAt: eventDate,
          actorType: "admin",
          actorId: actor.uid,
          metadata: { delivery: "email", tokenRevoked: true },
        },
      ]);
      transaction.update(contractRef, {
        status: "ready",
        activeTokenHash: FieldValue.delete(),
        tokenExpiresAt: FieldValue.delete(),
        sentAt: FieldValue.delete(),
        updatedAt: eventTime,
        auditLastHash: chain.lastHash,
        auditSequence: chain.lastSequence,
      });
      transaction.update(tokenRef, { status: "revoked", revokedAt: eventTime });
      writeAuditEvents(transaction, contractRef, chain.events);
    });
    throw error;
  }

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(contractRef);
    if (!snapshot.exists) return;
    const current = normalizeContract(snapshot.id, snapshot.data()!);
    if (current.activeTokenHash !== tokenHash || current.status !== "sent") return;
    const eventDate = new Date();
    const chain = buildAuditChain(current.id, current.auditLastHash, current.auditSequence, [
      {
        eventType: "SIGN_REQUEST_SENT",
        occurredAt: eventDate,
        actorType: "admin",
        actorId: actor.uid,
        metadata: { delivery: "email" },
      },
    ]);
    transaction.update(contractRef, {
      updatedAt: Timestamp.fromDate(eventDate),
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    writeAuditEvents(transaction, contractRef, chain.events);
  });

  return { signingUrl, expiresAt: expiresAt.toISOString() };
}

type SignSessionResult =
  | { state: "available" | "completed" | "processing"; contract: PublicContractView }
  | { state: "invalid" | "expired" | "void"; contract?: PublicContractView };

export async function openSignSession(token: string, evidence: RequestEvidence): Promise<SignSessionResult> {
  const tokenHash = sha256(token);
  const { firestore } = getFirebaseAdmin();
  const tokenRef = firestore.collection("contractTokens").doc(tokenHash);
  return firestore.runTransaction(async (transaction) => {
    const tokenSnapshot = await transaction.get(tokenRef);
    if (!tokenSnapshot.exists) return { state: "invalid" } as const;
    const tokenData = tokenSnapshot.data()!;
    const contractRef = firestore.collection("contracts").doc(String(tokenData.contractId));
    const contractSnapshot = await transaction.get(contractRef);
    if (!contractSnapshot.exists) return { state: "invalid" } as const;
    let contract = normalizeContract(contractSnapshot.id, contractSnapshot.data()!);
    const purpose = getContractTokenPurpose(tokenData.purpose);
    const expiresAtTimestamp = tokenData.expiresAt as Timestamp | undefined;
    const expiresAt = expiresAtTimestamp?.toDate();

    if (purpose === "documents") {
      if (contract.status === "void" || tokenData.status === "revoked") {
        return { state: "void", contract: toPublicContract(contract, expiresAtTimestamp) } as const;
      }
      if (contract.status !== "completed") {
        return { state: "invalid" } as const;
      }
      if (contract.documentAccessTokenHash !== tokenHash) {
        return { state: "invalid" } as const;
      }
      if (tokenData.status === "expired") {
        return { state: "expired", contract: toPublicContract(contract, expiresAtTimestamp) } as const;
      }
      if (tokenData.status !== "active") return { state: "invalid" } as const;
      if (!expiresAt || expiresAt.getTime() <= Date.now()) {
        transaction.update(tokenRef, {
          status: "expired",
          expiredAt: Timestamp.fromDate(new Date()),
        });
        return { state: "expired", contract: toPublicContract(contract, expiresAtTimestamp) } as const;
      }
      return { state: "completed", contract: toPublicContract(contract, expiresAtTimestamp) } as const;
    }

    if (contract.status === "completed") {
      return { state: "invalid" } as const;
    }
    if (contract.activeTokenHash !== tokenHash) {
      return { state: contract.status === "void" ? "void" : "invalid" } as const;
    }
    if (contract.status === "void" || tokenData.status === "revoked") {
      return { state: "void", contract: toPublicContract(contract) } as const;
    }
    if (contract.status === "signed" && tokenData.status === "used") {
      return { state: "processing", contract: toPublicContract(contract) } as const;
    }
    if (!expiresAt || expiresAt.getTime() <= Date.now() || tokenData.status === "expired") {
      if ((contract.status === "sent" || contract.status === "viewed") && tokenData.status === "active") {
        const eventDate = new Date();
        const chain = buildAuditChain(contract.id, contract.auditLastHash, contract.auditSequence, [
          {
            eventType: "TOKEN_EXPIRED",
            occurredAt: eventDate,
            actorType: "system",
            ipAddress: evidence.ipAddress,
            userAgent: evidence.userAgent,
            requestId: evidence.requestId,
          },
        ]);
        transaction.update(tokenRef, { status: "expired", expiredAt: Timestamp.fromDate(eventDate) });
        transaction.update(contractRef, {
          status: "expired",
          updatedAt: Timestamp.fromDate(eventDate),
          auditLastHash: chain.lastHash,
          auditSequence: chain.lastSequence,
        });
        writeAuditEvents(transaction, contractRef, chain.events);
        contract = { ...contract, status: "expired" };
      }
      return { state: "expired", contract: toPublicContract(contract) } as const;
    }
    if (tokenData.status !== "active" || !["sent", "viewed"].includes(contract.status)) {
      return { state: "invalid" } as const;
    }
    if (contract.status === "sent") {
      const eventDate = new Date();
      const eventTime = Timestamp.fromDate(eventDate);
      const chain = buildAuditChain(contract.id, contract.auditLastHash, contract.auditSequence, [
        {
          eventType: "SIGN_PAGE_OPENED",
          occurredAt: eventDate,
          actorType: "signer",
          actorId: sha256(contract.signer.email.toLowerCase()),
          ipAddress: evidence.ipAddress,
          userAgent: evidence.userAgent,
          requestId: evidence.requestId,
        },
      ]);
      transaction.update(contractRef, {
        status: "viewed",
        viewedAt: eventTime,
        updatedAt: eventTime,
        auditLastHash: chain.lastHash,
        auditSequence: chain.lastSequence,
      });
      writeAuditEvents(transaction, contractRef, chain.events);
      contract = { ...contract, status: "viewed", viewedAt: eventTime, updatedAt: eventTime };
    }
    return { state: "available", contract: toPublicContract(contract) } as const;
  });
}

export async function completeContractSigning(token: string, evidence: RequestEvidence) {
  const tokenHash = sha256(token);
  const { firestore } = getFirebaseAdmin();
  const tokenRef = firestore.collection("contractTokens").doc(tokenHash);
  const tokenSnapshot = await tokenRef.get();
  if (!tokenSnapshot.exists) throw new Error("署名URLが無効です。");
  if (getContractTokenPurpose(tokenSnapshot.data()?.purpose) !== "signing") {
    throw new Error("このURLでは契約を締結できません。");
  }
  const contractRef = firestore.collection("contracts").doc(String(tokenSnapshot.data()?.contractId));
  const initialContract = await contractRef.get();
  if (!initialContract.exists) throw new Error("契約が見つかりません。");
  const initialData = normalizeContract(initialContract.id, initialContract.data()!);
  const provider = getVerificationProvider(initialData.verificationMethod);
  const verification = await provider.verify({
    expectedEmail: initialData.signer.email,
    tokenValidated: initialData.activeTokenHash === tokenHash,
  });
  if (verification.status !== "succeeded" || !verification.verifiedAt) {
    throw new Error("本人確認に失敗しました。");
  }
  const verifiedAt = verification.verifiedAt;

  let signedContract = await firestore.runTransaction(async (transaction) => {
    const [currentTokenSnapshot, currentContractSnapshot] = await Promise.all([
      transaction.get(tokenRef),
      transaction.get(contractRef),
    ]);
    if (!currentTokenSnapshot.exists || !currentContractSnapshot.exists) {
      throw new Error("契約が見つかりません。");
    }
    const tokenData = currentTokenSnapshot.data()!;
    const contract = normalizeContract(currentContractSnapshot.id, currentContractSnapshot.data()!);
    if (contract.status === "signed" && tokenData.status === "used" && contract.pendingCompletionEvent) {
      return contract;
    }
    if (tokenData.status !== "active" || contract.activeTokenHash !== tokenHash) {
      throw new Error("署名URLは使用できません。");
    }
    const expiresAt = (tokenData.expiresAt as Timestamp | undefined)?.toDate();
    if (!expiresAt || expiresAt.getTime() <= Date.now()) throw new Error("署名URLの有効期限が切れています。");
    if (!["sent", "viewed"].includes(contract.status)) throw new Error("この契約は締結できません。");

    const signedDate = new Date();
    const signedAt = Timestamp.fromDate(signedDate);
    const signerId = sha256(contract.signer.email.toLowerCase());
    const common = {
      occurredAt: signedDate,
      actorType: "signer" as const,
      actorId: signerId,
      ipAddress: evidence.ipAddress,
      userAgent: evidence.userAgent,
      requestId: evidence.requestId,
    };
    const signedChain = buildAuditChain(contract.id, contract.auditLastHash, contract.auditSequence, [
      { ...common, eventType: "VERIFICATION_STARTED", metadata: { method: verification.method } },
      { ...common, eventType: "VERIFICATION_SUCCEEDED", metadata: { method: verification.method } },
      {
        ...common,
        eventType: "AUTHORITY_ACCEPTED",
        metadata: { statementVersion: AUTHORITY_STATEMENT_VERSION },
      },
      {
        ...common,
        eventType: "CONSENT_ACCEPTED",
        metadata: { statementVersion: CONSENT_STATEMENT_VERSION },
      },
      { ...common, eventType: "CONTRACT_SIGNED", metadata: { documentSha256: contract.document.sha256 } },
    ]);
    const completionChain = buildAuditChain(
      contract.id,
      signedChain.lastHash,
      signedChain.lastSequence,
      [{ ...common, eventType: "CONTRACT_COMPLETED" }]
    );
    const pendingCompletionEvent = completionChain.events[0];
    const acceptance = {
      verificationMethod: verification.method,
      verificationStatus: "succeeded" as const,
      verificationTransactionId: verification.transactionId,
      verifiedAt: Timestamp.fromDate(verifiedAt),
      identityAccepted: true as const,
      authorityAccepted: true as const,
      authorityStatementVersion: AUTHORITY_STATEMENT_VERSION,
      reviewedAccepted: true as const,
      consentAccepted: true as const,
      consentStatementVersion: CONSENT_STATEMENT_VERSION,
      acceptedAt: signedAt,
      ipAddress: evidence.ipAddress,
      userAgent: evidence.userAgent,
      requestId: evidence.requestId,
    };
    transaction.update(tokenRef, { status: "used", usedAt: signedAt });
    transaction.update(contractRef, {
      status: "signed",
      signedAt,
      acceptance,
      pendingCompletionEvent,
      updatedAt: signedAt,
      auditLastHash: signedChain.lastHash,
      auditSequence: signedChain.lastSequence,
    });
    writeAuditEvents(transaction, contractRef, signedChain.events);
    return {
      ...contract,
      status: "signed" as const,
      signedAt,
      acceptance,
      pendingCompletionEvent,
      updatedAt: signedAt,
      auditLastHash: signedChain.lastHash,
      auditSequence: signedChain.lastSequence,
    };
  });

  if (!signedContract.pendingCompletionEvent || !signedContract.signedAt) {
    throw new Error("締結処理の再開情報がありません。");
  }

  const originalBytes = await readContractPdf(signedContract.document.storagePath);
  if (sha256(originalBytes) !== signedContract.document.sha256) {
    throw new Error("契約書原本の整合性を確認できませんでした。");
  }
  const artifactSource = {
    contractNumber: signedContract.contractNumber,
    title: signedContract.title,
    type: signedContract.type,
    companyName: signedContract.company.name,
    signerName: signedContract.signer.name,
    signerRole: signedContract.signer.role,
    verificationMethod: signedContract.verificationMethod,
    signedAt: signedContract.signedAt.toDate(),
    documentSha256: signedContract.document.sha256,
    finalAuditHash: signedContract.pendingCompletionEvent.eventHash,
  };
  const { createContractArtifacts } = await import("@/lib/contracts/pdf");
  const { executedBytes, certificateBytes } = await createContractArtifacts(
    originalBytes,
    artifactSource
  );
  const [executed, certificate] = await Promise.all([
    saveContractPdfOnce(signedContract.id, "executed", executedBytes),
    saveContractPdfOnce(signedContract.id, "certificate", certificateBytes),
  ]);

  const { token: documentAccessToken, tokenHash: documentAccessTokenHash } = createSigningToken();
  const documentAccessTokenRef = firestore
    .collection("contractTokens")
    .doc(documentAccessTokenHash);
  const documentAccessIssuedAtDate = new Date();
  const documentAccessIssuedAt = Timestamp.fromDate(documentAccessIssuedAtDate);
  const documentAccessExpiresAtDate = new Date(
    documentAccessIssuedAtDate.getTime() +
      CONTRACT_DOCUMENT_ACCESS_DAYS * 24 * 60 * 60 * 1000
  );
  const documentAccessExpiresAt = Timestamp.fromDate(documentAccessExpiresAtDate);

  const finalization = await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(contractRef);
    if (!snapshot.exists) throw new Error("契約が見つかりません。");
    const contract = normalizeContract(snapshot.id, snapshot.data()!);
    if (contract.status === "completed") return { contract, completedNow: false };
    const pending = contract.pendingCompletionEvent;
    if (
      contract.status !== "signed" ||
      !pending ||
      pending.previousHash !== contract.auditLastHash ||
      pending.sequence !== contract.auditSequence + 1
    ) {
      throw new Error("契約の最終確定状態が一致しません。");
    }
    transaction.create(contractRef.collection("events").doc(pending.eventId), pending);
    transaction.create(documentAccessTokenRef, {
      contractId: contract.id,
      tokenHash: documentAccessTokenHash,
      purpose: "documents",
      status: "active",
      createdAt: documentAccessIssuedAt,
      expiresAt: documentAccessExpiresAt,
    });
    transaction.update(tokenRef, {
      status: "consumed",
      consumedAt: documentAccessIssuedAt,
    });
    transaction.update(contractRef, {
      status: "completed",
      completedAt: pending.occurredAt,
      executedDocument: { storagePath: executed.path, sha256: executed.sha256 },
      certificateDocument: { storagePath: certificate.path, sha256: certificate.sha256 },
      activeTokenHash: FieldValue.delete(),
      documentAccessTokenHash,
      documentAccessExpiresAt,
      pendingCompletionEvent: FieldValue.delete(),
      updatedAt: pending.occurredAt,
      auditLastHash: pending.eventHash,
      auditSequence: pending.sequence,
    });
    return {
      completedNow: true,
      contract: {
        ...contract,
        status: "completed" as const,
        completedAt: pending.occurredAt,
        executedDocument: { storagePath: executed.path, sha256: executed.sha256 },
        certificateDocument: { storagePath: certificate.path, sha256: certificate.sha256 },
        activeTokenHash: undefined,
        documentAccessTokenHash,
        documentAccessExpiresAt,
        pendingCompletionEvent: undefined,
        updatedAt: pending.occurredAt,
        auditLastHash: pending.eventHash,
        auditSequence: pending.sequence,
      },
    };
  });
  signedContract = finalization.contract;
  if (!finalization.completedNow) {
    return {
      contract: toPublicContract(
        signedContract,
        signedContract.documentAccessExpiresAt
      ),
      documentAccessExpiresAt: timestampToIso(signedContract.documentAccessExpiresAt),
    };
  }
  await sendCompletionEmail(
    signedContract,
    `${getSignBaseUrl()}/c/${documentAccessToken}`,
    documentAccessExpiresAtDate
  ).catch(() => undefined);
  return {
    contract: toPublicContract(signedContract, documentAccessExpiresAt),
    documentAccessToken,
    documentAccessExpiresAt: documentAccessExpiresAtDate.toISOString(),
  };
}

async function sendCompletionEmail(
  contract: ContractRecord,
  completionUrl: string,
  expiresAt: Date
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const adminTo = process.env.RESEND_TO?.trim();
  if (!apiKey || !from) return;
  const recipients = Array.from(new Set([contract.signer.email, adminTo].filter(Boolean))) as string[];
  const deadline = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "long",
    timeStyle: "short",
  }).format(expiresAt);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `【Make It Tech】契約締結完了：${contract.title}`,
      text: `${contract.contractNumber}「${contract.title}」の電子契約が締結されました。\n締結書類: ${completionUrl}\n取得期限: ${deadline}\n\nこの書類取得URLは第三者へ共有しないでください。期限後の再取得はMake It Techへご連絡ください。`,
    }),
  });
  if (!response.ok) throw new Error("Completion email failed.");
}

export async function voidContract(contractId: string, actor: AdminActor) {
  const { firestore } = getFirebaseAdmin();
  const contractRef = firestore.collection("contracts").doc(contractId);
  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(contractRef);
    if (!snapshot.exists) throw new Error("契約が見つかりません。");
    const contract = normalizeContract(snapshot.id, snapshot.data()!);
    if (contract.status === "void") return;
    if (!canVoidContractStatus(contract.status)) {
      throw new Error("締結処理中または締結済みの契約は失効できません。");
    }
    const nowDate = new Date();
    const now = Timestamp.fromDate(nowDate);
    const chain = buildAuditChain(contract.id, contract.auditLastHash, contract.auditSequence, [
      { eventType: "CONTRACT_VOIDED", occurredAt: nowDate, actorType: "admin", actorId: actor.uid },
    ]);
    if (contract.activeTokenHash) {
      transaction.set(
        firestore.collection("contractTokens").doc(contract.activeTokenHash),
        { status: "revoked", revokedAt: now },
        { merge: true }
      );
    }
    transaction.update(contractRef, {
      status: "void",
      voidedAt: now,
      updatedAt: now,
      auditLastHash: chain.lastHash,
      auditSequence: chain.lastSequence,
    });
    writeAuditEvents(transaction, contractRef, chain.events);
  });
}

export async function getContract(contractId: string) {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore.collection("contracts").doc(contractId).get();
  return snapshot.exists ? normalizeContract(snapshot.id, snapshot.data()!) : null;
}

export async function getContracts() {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore.collection("contracts").orderBy("createdAt", "desc").limit(200).get();
  return snapshot.docs.map((document) => normalizeContract(document.id, document.data()));
}

export async function getContractEvents(contractId: string) {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore
    .collection("contracts")
    .doc(contractId)
    .collection("events")
    .orderBy("sequence", "asc")
    .limit(500)
    .get();
  return snapshot.docs.map((document) => {
    const data = document.data() as ContractAuditEvent;
    return { ...data, occurredAt: data.occurredAt.toDate().toISOString() };
  });
}

export function getContractDocumentPath(contract: ContractRecord, kind: "original" | "executed" | "certificate") {
  if (kind === "original") return contract.document.storagePath;
  if (kind === "executed") return contract.executedDocument?.storagePath;
  return contract.certificateDocument?.storagePath;
}

export async function getPublicContractDocument(token: string, kind: "original" | "executed" | "certificate") {
  const tokenHash = sha256(token);
  const { firestore } = getFirebaseAdmin();
  const tokenSnapshot = await firestore.collection("contractTokens").doc(tokenHash).get();
  if (!tokenSnapshot.exists) return null;
  const contract = await getContract(String(tokenSnapshot.data()?.contractId));
  if (!contract) return null;
  const tokenData = tokenSnapshot.data()!;
  const purpose = getContractTokenPurpose(tokenData.purpose);
  if (purpose === "documents" && contract.documentAccessTokenHash !== tokenHash) return null;
  const tokenExpiresAt = (tokenData.expiresAt as Timestamp | undefined)?.toDate();
  if (!canAccessContractDocument({
    purpose,
    tokenStatus: String(tokenData.status ?? ""),
    expiresAt: tokenExpiresAt,
    contractStatus: contract.status,
    kind: kind as ContractDocumentKind,
  })) {
    return null;
  }
  const path = getContractDocumentPath(contract, kind);
  if (!path) return null;
  const bytes = await readContractPdf(path);
  const expectedHash = kind === "original"
    ? contract.document.sha256
    : kind === "executed"
      ? contract.executedDocument?.sha256
      : contract.certificateDocument?.sha256;
  return expectedHash && sha256(bytes) === expectedHash ? { contract, bytes } : null;
}

export async function getAdminContractDocument(contractId: string, kind: "original" | "executed" | "certificate") {
  const contract = await getContract(contractId);
  if (!contract) return null;
  const path = getContractDocumentPath(contract, kind);
  if (!path) return null;
  const bytes = await readContractPdf(path);
  const expectedHash = kind === "original"
    ? contract.document.sha256
    : kind === "executed"
      ? contract.executedDocument?.sha256
      : contract.certificateDocument?.sha256;
  return expectedHash && sha256(bytes) === expectedHash ? { contract, bytes } : null;
}

export function expectedContractStoragePaths(contractId: string) {
  return {
    original: getContractStoragePath(contractId, "original"),
    executed: getContractStoragePath(contractId, "executed"),
    certificate: getContractStoragePath(contractId, "certificate"),
  };
}
