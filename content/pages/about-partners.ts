export interface PartnerCompany {
  name: string;
  description: string;
  introduction: string;
  websiteUrl: string;
  logoSrc?: string;
  logoAlt?: string;
  location?: string;
  partnership?: string;
}

/**
 * パートナー企業の掲載情報
 * ロゴを掲載する場合は public/images/partners/ に配置し、logoSrcへ /images/partners/ファイル名 の形式で指定してください。
 * 外部サイトのロゴを直接使う場合は、next.config.tsのremotePatternsにも
 * 参照先ドメインを追加してください。
 */
export const partnerCompanies: readonly PartnerCompany[] = [
  {
    name: "Dミセ",
    description:
      "店舗運営に必要な勤怠・シフト管理を、現場目線で効率化するDXサービスです。",
    introduction:
      "店舗で働く方と運営する方の双方に寄り添い、日々の勤怠管理やシフト業務をわかりやすく整えるサービスを展開しています。Make It Techとは、現場で本当に使われる仕組みづくりという共通の視点を持ち、店舗運営と業務DXの領域で連携しています。",
    websiteUrl: "https://d-mise.com",
    logoSrc: "https://d-mise.com/images/dmise-logo-trans.png",
    logoAlt: "Dミセのロゴ",
    partnership: "店舗運営・業務DX領域での連携",
  },
  {
    name: "買取蔵の宮",
    description:
      "士業からも勧められる、神奈川県平塚市の地域に根ざした買取店です。",
    introduction:
      "お客様との信頼関係を大切にし、一つひとつの相談に丁寧に向き合う買取サービスを提供しています。地域のお客様に誠実な価値を届ける事業者として、Make It Techの取り組みを支えていただきながら、事業運営における相互連携を進めています。",
    websiteUrl: "https://kaitorikuranomiya.com",
    location: "神奈川県平塚市",
    partnership: "事業運営における相互連携",
  },
  // {
  //   name: "企業名",
  //   description: "企業および連携内容の簡潔な紹介文です。",
  //   introduction: "専用ページに掲載する詳しい紹介文です。",
  //   websiteUrl: "https://example.com/",
  //   logoSrc: "/images/partners/example.svg",
  //   logoAlt: "企業名のロゴ",
  //   location: "新潟県新潟市",
  //   partnership: "Web・DX領域での事業連携",
  // },
];
