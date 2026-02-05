export type SecurityPolicySection = {
  id: string;
  title: string;
  body?: string[];
  bullets?: string[];
};

export type SecurityPolicyContent = {
  title: string;
  intro: string[];
  effectiveDate: string;
  contact: {
    formPath: string;
  };
  sections: SecurityPolicySection[];
};

export const securityPolicyContent: SecurityPolicyContent = {
  title: "情報セキュリティ基本方針",
  intro: [
    "Make It Tech は、顧客要求事項に基づくソフトウェアの設計・開発を提供していることを踏まえ、顧客情報および業務データを含む情報資産を重要な資産として認識し、適切に保護するための情報セキュリティ基本方針を定めます。",
    "本方針は、当サイトおよび提供するサービスに関わる情報の取り扱いに適用されます。",
  ],
  effectiveDate: "2026-01-15",
  contact: {
    formPath: "/contact",
  },
  sections: [
    {
      id: "purpose",
      title: "1. 目的",
      body: [
        "情報資産の機密性・完全性・可用性を維持し、信頼されるサービス提供を継続することを目的とします。",
      ],
    },
    {
      id: "scope",
      title: "2. 適用範囲",
      body: [
        "本方針は、当サイトの運営およびサービス提供に関わるすべての関係者に適用されます。",
      ],
      bullets: [
        "代表者および従業員",
        "業務委託先・協力会社",
        "外部サービスの利用に関わる関係者",
      ],
    },
    {
      id: "assets",
      title: "3. 情報資産の管理",
      body: [
        "情報資産の重要度に応じて適切に管理し、必要最小限の範囲で取り扱います。",
      ],
      bullets: [
        "情報資産の分類と管理",
        "アクセス制御・権限管理の徹底",
        "不要になった情報の速やかな削除・破棄",
      ],
    },
    {
      id: "risk",
      title: "4. リスク管理",
      body: [
        "情報セキュリティ上のリスクを把握し、適切な対策を講じます。",
      ],
      bullets: [
        "リスクの評価と対応方針の策定",
        "脆弱性や不正アクセスへの対策",
        "バックアップと復旧手順の整備",
      ],
    },
    {
      id: "vendor",
      title: "5. 外部委託先の管理",
      body: [
        "業務委託や外部サービスを利用する場合、適切な選定と監督を行い、同等の保護水準を求めます。",
      ],
    },
    {
      id: "incident",
      title: "6. インシデント対応",
      body: [
        "情報漏えい等のインシデントが発生した場合、影響の最小化と再発防止のために迅速に対応します。",
      ],
    },
    {
      id: "training",
      title: "7. 教育と遵守",
      body: [
        "関係者への教育を行い、情報セキュリティに関する意識向上と遵守を徹底します。",
      ],
    },
    {
      id: "improvement",
      title: "8. 継続的改善",
      body: [
        "本方針および管理体制は、事業の変化や技術動向に合わせて継続的に見直し、改善します。",
      ],
    },
    {
      id: "contact",
      title: "9. お問い合わせ",
      body: [
        "情報セキュリティに関するお問い合わせは、当サイトのお問い合わせページまたは公式LINEよりご連絡ください。",
      ],
    },
  ],
};
