export const CONTRACT_TYPES = [
  "nda",
  "data_handling_addendum",
  "fde_master",
  "fde_individual",
  "web",
  "development",
  "other",
] as const;

export type ContractType = (typeof CONTRACT_TYPES)[number];

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  nda: "秘密保持契約（NDA）",
  data_handling_addendum: "個人情報・データ取扱特約",
  fde_master: "FDE業務委託基本契約",
  fde_individual: "FDE個別契約",
  web: "Web制作契約",
  development: "システム開発・業務委託契約",
  other: "その他",
};

export const CONTRACT_STATUSES = [
  "draft",
  "ready",
  "sent",
  "viewed",
  "signed",
  "completed",
  "void",
  "expired",
] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "下書き",
  ready: "送信準備完了",
  sent: "送信済み",
  viewed: "閲覧済み",
  signed: "締結処理中",
  completed: "締結済み",
  void: "失効",
  expired: "期限切れ",
};

export const VERIFICATION_METHODS = ["company_email_link", "jpki"] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

export const AUTHORITY_STATEMENT_VERSION = "v1";
export const CONSENT_STATEMENT_VERSION = "v1";

export const CONTRACT_ACCEPTANCE_STATEMENTS = {
  identity: "私は上記の署名予定者本人です。",
  authority:
    "私は上記法人を代表し、または当該法人から権限を付与され、本契約を締結する権限を有しています。",
  reviewed: "契約書の内容を確認しました。",
  consent: "本契約の内容に同意し、電子的に契約を締結します。",
} as const;

export const CONTRACT_DOCUMENT_VERSION = 1;
export const CONTRACT_TOKEN_BYTES = 32;
export const CONTRACT_TOKEN_DEFAULT_DAYS = 7;
export const CONTRACT_TOKEN_MAX_DAYS = 30;
export const CONTRACT_DOCUMENT_ACCESS_DAYS = 7;
export const CONTRACT_PDF_MAX_BYTES = 4 * 1024 * 1024;

export const CONTRACT_TEMPLATE_IDS = [
  "nda-standard-v1",
  "data-handling-addendum-standard-v1",
  "fde-master-standard-v1",
] as const;
export type ContractTemplateId = (typeof CONTRACT_TEMPLATE_IDS)[number];

export const CONTRACT_TEMPLATES: Record<
  ContractTemplateId,
  {
    name: string;
    version: string;
    contractType: ContractType;
    defaultTitle: string;
    description: string;
    formKind: "nda" | "data_handling" | "fde_master";
    fileName: string;
    sourceSha256: string;
    generationPath: string;
  }
> = {
  "nda-standard-v1": {
    name: "秘密保持契約書 NDA 標準テンプレート",
    version: "v1",
    contractType: "nda",
    defaultTitle: "秘密保持契約書",
    description: "法人間で秘密情報を共有する前に締結する標準NDA",
    formKind: "nda",
    fileName: "秘密保持契約書_NDA_標準テンプレート.docx",
    sourceSha256: "d63791aecfc06928e14ea3abe6d00e4143f51c177e45c502c3a0835801f1fe6c",
    generationPath: "/api/admin/contracts/templates/nda-standard-v1/generate",
  },
  "data-handling-addendum-standard-v1": {
    name: "個人情報・データ取扱特約 標準テンプレート",
    version: "v1",
    contractType: "data_handling_addendum",
    defaultTitle: "個人情報・データ取扱特約",
    description: "FDE業務で取り扱う個人情報・業務データの条件を定める特約",
    formKind: "data_handling",
    fileName: "個人情報・データ取扱特約_標準テンプレート.docx",
    sourceSha256: "1f4eac910194d92dbd867c15fb08465f3fe8fb862ac67d0a8572118be4c550f1",
    generationPath: "/api/admin/contracts/templates/data-handling-addendum-standard-v1/generate",
  },
  "fde-master-standard-v1": {
    name: "FDE業務委託基本契約書 標準テンプレート",
    version: "v1",
    contractType: "fde_master",
    defaultTitle: "FDE業務委託基本契約書",
    description: "FDE業務の共通条件、契約期間、責任範囲などを定める基本契約",
    formKind: "fde_master",
    fileName: "FDE業務委託基本契約書_標準テンプレート.docx",
    sourceSha256: "3d727b7d7d8c1b3a2f39a489009d94427e057c7eec2b219f44401e4fcf87f444",
    generationPath: "/api/admin/contracts/templates/fde-master-standard-v1/generate",
  },
};

export const CONTRACT_EVENT_TYPES = [
  "CONTRACT_CREATED",
  "DOCUMENT_UPLOADED",
  "DOCUMENT_LOCKED",
  "MIT_ACCEPTED",
  "SIGN_REQUEST_CREATED",
  "SIGN_REQUEST_SENT",
  "SIGN_REQUEST_FAILED",
  "SIGN_PAGE_OPENED",
  "VERIFICATION_STARTED",
  "VERIFICATION_SUCCEEDED",
  "AUTHORITY_ACCEPTED",
  "CONSENT_ACCEPTED",
  "CONTRACT_SIGNED",
  "CONTRACT_COMPLETED",
  "CONTRACT_VOIDED",
  "TOKEN_EXPIRED",
] as const;

export type ContractEventType = (typeof CONTRACT_EVENT_TYPES)[number];
