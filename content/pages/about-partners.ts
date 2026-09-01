export interface PartnerCompany {
  name: string;
  description: string;
  websiteUrl: string;
  logoSrc?: string;
  logoAlt?: string;
  location?: string;
  partnership?: string;
}

/**
 * パートナー企業の掲載情報です。
 * ロゴを掲載する場合は public/images/partners/ に配置し、
 * logoSrcへ /images/partners/ファイル名 の形式で指定してください。
 * 外部サイトのロゴを直接使う場合は、next.config.tsのremotePatternsにも
 * 参照先ドメインを追加してください。
 */
export const partnerCompanies: readonly PartnerCompany[] = [
  {
    name: "Dミセ",
    description: "店舗型勤怠管理SaaS・シフト管理DX",
    websiteUrl: "https://d-mise.com",
    logoSrc: "https://d-mise.com/images/dmise-logo-trans.png",
    logoAlt: "Dミセのロゴ",
  },
  // {
  //   name: "企業名",
  //   description: "企業および連携内容の簡潔な紹介文です。",
  //   websiteUrl: "https://example.com/",
  //   logoSrc: "/images/partners/example.svg",
  //   logoAlt: "企業名のロゴ",
  //   location: "新潟県新潟市",
  //   partnership: "Web・DX領域での事業連携",
  // },
];
