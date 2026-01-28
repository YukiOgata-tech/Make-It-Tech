export const footerLinks = [
  {
    title: "サービス",
    links: [
      { label: "サービス概要", href: "/services" },
      { label: "料金の目安", href: "/pricing" },
      { label: "事業所概要", href: "/about" },
      { label: "業務診断", href: "/#diagnosis" },
      { label: "LINEで相談", href: "/survey" },
    ],
  },
  {
    title: "お問い合わせ",
    links: [
      { label: "無料相談", href: "/contact" },
      { label: "対応の流れ", href: "/#process" },
    ],
  },
  {
    title: "法務・ポリシー",
    links: [
      { label: "注意事項（利用規約）", href: "/terms" },
      { label: "プライバシーポリシー", href: "/privacy" },
    ],
  },
  {
    title: "ナレッジ",
    links: [
      { label: "用語集", href: "/glossary" },
    ],
  },
] as const;
