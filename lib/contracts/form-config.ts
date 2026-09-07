export const DATA_HANDLING_FIELD_GROUPS = [
  {
    title: "対象データ",
    fields: [
      { key: "targetData", label: "対象データ", placeholder: "例：従業員基本情報、勤怠、顧客情報、売上データ" },
      { key: "processingPurpose", label: "利用目的・処理内容", placeholder: "例：業務分析、システム構築、データ移行、AI検索" },
      { key: "dataSubjects", label: "対象者", placeholder: "例：従業員、顧客、取引先担当者" },
      { key: "sensitivePersonalInformation", label: "要配慮個人情報", placeholder: "有・無／取り扱う対象と必要措置" },
      { key: "specificPersonalInformation", label: "特定個人情報", placeholder: "原則対象外／取り扱う場合の追加条件" },
    ],
  },
  {
    title: "利用環境と権限",
    fields: [
      { key: "systemsUsed", label: "利用システム", placeholder: "クラウド、DB、AI、API、SaaSなど" },
      { key: "storageLocation", label: "保存場所・地域", placeholder: "例：日本国内、Google Cloud東京リージョン" },
      { key: "retentionPeriod", label: "保存期間", placeholder: "例：契約終了後30日以内に削除" },
      { key: "accessScope", label: "アクセス権限", placeholder: "担当者、権限レベル、利用期間など" },
      { key: "subcontractors", label: "再委託先", placeholder: "名称、対象データ、取扱範囲など" },
      { key: "thirdPartyServices", label: "第三者サービス", placeholder: "利用するサービスと利用条件" },
      { key: "overseasUse", label: "国外利用", placeholder: "国・地域の限定、または禁止条件" },
    ],
  },
  {
    title: "事故対応と終了時の取扱い",
    fields: [
      { key: "incidentContact", label: "事故時の連絡", placeholder: "初報期限、担当者、電話・メールなど" },
      { key: "endOfTermHandling", label: "終了時の取扱い", placeholder: "返却形式、移行先、削除期限など" },
      { key: "additionalSecurityRequirements", label: "追加セキュリティ要件", placeholder: "IP制限、VPN、暗号化方式、ログ保存期間など" },
      { key: "specialProvisions", label: "特記事項", placeholder: "優先する条項と、その具体的な内容" },
    ],
  },
] as const;

export type DataHandlingFieldKey =
  (typeof DATA_HANDLING_FIELD_GROUPS)[number]["fields"][number]["key"];

export const INITIAL_DATA_HANDLING_FIELDS: Record<DataHandlingFieldKey, string> = {
  targetData: "",
  processingPurpose: "",
  dataSubjects: "",
  sensitivePersonalInformation: "",
  specificPersonalInformation: "",
  systemsUsed: "",
  storageLocation: "",
  retentionPeriod: "契約終了後30日以内に削除する",
  accessScope: "本業務の遂行に必要な最小限の担当者に限定する",
  subcontractors: "",
  thirdPartyServices: "",
  overseasUse: "",
  incidentContact: "漏えい等を認識した場合、速やかに甲指定の連絡先へ報告する",
  endOfTermHandling: "契約終了後30日以内に返却または復元困難な方法で削除する",
  additionalSecurityRequirements: "特段の定めなし",
  specialProvisions: "特段の定めなし",
};

export type FdeMasterFieldKey =
  | "latePaymentInterestRate"
  | "confidentialityYears"
  | "suspensionDelayDays"
  | "curePeriodDays"
  | "handoverDays"
  | "dataDeletionDays"
  | "termYears"
  | "renewalNoticeDays"
  | "renewalYears"
  | "terminationNoticeDays"
  | "jurisdiction";

export type FdeMasterField = {
  key: FdeMasterFieldKey;
  label: string;
  type: "number" | "text";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
};

export const FDE_MASTER_FIELD_GROUPS: ReadonlyArray<{
  title: string;
  fields: ReadonlyArray<FdeMasterField>;
}> = [
  {
    title: "支払と情報保護",
    fields: [
      { key: "latePaymentInterestRate", label: "遅延損害金率（年率％）", type: "number", min: 0, max: 100, step: 0.01 },
      { key: "confidentialityYears", label: "契約終了後の秘密保持期間（年）", type: "number", min: 1, max: 99 },
      { key: "suspensionDelayDays", label: "業務停止の対象となる支払遅延（日）", type: "number", min: 1, max: 365 },
    ],
  },
  {
    title: "違反時と契約終了時",
    fields: [
      { key: "curePeriodDays", label: "契約違反の是正期間（日）", type: "number", min: 1, max: 365 },
      { key: "handoverDays", label: "終了後の引渡し目安（日）", type: "number", min: 1, max: 365 },
      { key: "dataDeletionDays", label: "移行完了後のデータ削除期限（日）", type: "number", min: 1, max: 365 },
    ],
  },
  {
    title: "契約期間と管轄",
    fields: [
      { key: "termYears", label: "基本契約の有効期間（年）", type: "number", min: 1, max: 99 },
      { key: "renewalNoticeDays", label: "自動更新を停止する通知期限（日）", type: "number", min: 1, max: 365 },
      { key: "renewalYears", label: "自動更新期間（年）", type: "number", min: 1, max: 20 },
      { key: "terminationNoticeDays", label: "任意解約の通知期限（日）", type: "number", min: 1, max: 365 },
      { key: "jurisdiction", label: "専属的合意管轄の地域名", type: "text", placeholder: "例：山形、東京" },
    ],
  },
];

export const INITIAL_FDE_MASTER_FIELDS: Record<FdeMasterFieldKey, string> = {
  latePaymentInterestRate: "14.6",
  confidentialityYears: "5",
  suspensionDelayDays: "30",
  curePeriodDays: "14",
  handoverDays: "30",
  dataDeletionDays: "30",
  termYears: "1",
  renewalNoticeDays: "30",
  renewalYears: "1",
  terminationNoticeDays: "30",
  jurisdiction: "",
};
