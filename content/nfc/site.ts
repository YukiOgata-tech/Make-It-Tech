/**
 * NFC事業サブドメイン（nfc.make-it-tech.com）の設定。
 *
 * このサブドメインに関わる定数はここに集約する。ホスト名やShopifyのURLが
 * 確定・変更されたときに触るのはこのファイルだけで済むようにしている。
 *
 * ルーティングの実体は `proxy.ts` がホスト名を見て `/sub/nfc` へリライトする。
 * ローカル開発では http://localhost:3000/sub/nfc で同じ画面を確認できる。
 */

export const nfcSite = {
  name: "Make It Tech NFC",
  shortName: "NFC",
  /** proxy.ts のリライト先。ローカル開発時のパスでもある。 */
  basePath: "/sub/nfc",
  /** 本番のホスト名。proxy.ts のリライト判定に使う。 */
  host: "nfc.make-it-tech.com",
  url: "https://nfc.make-it-tech.com",
  title: "NFCスタンド・プレート | Make It Tech",
  description:
    "スマホをかざすだけで、Googleレビュー・SNS・メニュー・予約ページを開けるNFCスタンドとプレート。リンクの設定まで済ませた状態でお届けします。1個から注文でき、5個ごとに1個分お得になります。",
  keywords: [
    "NFC",
    "NFCタグ",
    "NFCスタンド",
    "NFCプレート",
    "Googleレビュー",
    "口コミ",
    "MEO",
    "店舗",
    "飲食店",
    "美容室",
    "デジタルメニュー",
    "LINE公式アカウント",
    "新潟",
  ],
  locale: "ja_JP",
  /**
   * 検索エンジンにインデックスさせるか。
   * LP の中身が揃うまでは false のままにしておき、公開準備が整ったら true にする。
   * layout の metadata と robots.txt の両方がこの値を見る。
   */
  indexable: false,
  logo: "https://make-it-tech.com/images/logo-02_MIT.png",
  ogImage: {
    url: "https://make-it-tech.com/images/og/make-it-tech-og.webp",
    width: 1200,
    height: 630,
    alt: "Make It Tech NFCスタンド・プレート",
  },
} as const;

/**
 * 外部リンク。Shopify のサブドメインは未確定のため、確定するまでは
 * `shopUrl` を空にしておき、UI 側は問い合わせ導線にフォールバックする。
 */
export const nfcLinks = {
  /**
   * Shopify EC。
   * TODO: 現在は「ECがある前提」で表示を確認するための仮URL。
   * Shopify のサブドメインが確定したら実URLに差し替える。
   */
  shopUrl: "https://shop.make-it-tech.com",
  parentUrl: "https://make-it-tech.com",
  contactUrl: "https://make-it-tech.com/contact",
  lineUrl: "https://lin.ee/8uHdH0Y",
} as const;

/** Shopify が未接続の間は問い合わせへ誘導するため、CTAの出し分けに使う。 */
export const isShopReady = nfcLinks.shopUrl.length > 0;

/**
 * NFCサブドメイン内のリンクを作る。
 *
 * 本番（nfc.make-it-tech.com）では proxy が `/` を `/sub/nfc` にリライトするため、
 * ブラウザ上のパスは `/` 始まりになる。一方ローカルでは `/sub/nfc` 始まりで
 * アクセスする。どちらでも壊れないよう、Next の Link にはリライト先の実パス
 * （`/sub/nfc/...`）を渡す。proxy は既に `/sub/nfc` で始まるパスを素通しするので、
 * 本番でもそのまま解決できる。
 */
export function nfcHref(path = "/") {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${nfcSite.basePath}${normalized}` || nfcSite.basePath;
}

/** サイトマップや構造化データ用に、公開URL（nfcドメイン基準）を作る。 */
export function nfcPublicUrl(path = "/") {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${nfcSite.url}${normalized}`;
}

/**
 * サイトマップに載せるページ。ページを追加したらここにも追記する。
 * `path` は nfc ドメイン基準の公開パス。
 */
export const nfcRoutes: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/demo", changeFrequency: "monthly", priority: 0.6 },
];
