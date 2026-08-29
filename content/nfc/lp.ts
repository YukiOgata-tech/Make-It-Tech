/**
 * NFC事業LPのコンテンツ定義（下書き）。
 *
 * 各セクションはこのファイルから文言・価格・画像パスを読み込む。
 * サブドメインの設定・リンクは `content/nfc/site.ts` を参照。
 *
 * 価格・仕様は docs/make_it_tech_nfc_business_master.md を正とする。
 * 未確定事項（プレート型の正式サイズ、税表記、送料、納期など）は
 * 断定を避けた表現にしており、確定次第ここだけを更新すれば LP に反映される。
 */

export const nfcHero = {
  eyebrow: "NFCスタンド / プレート",
  title: "かざすだけで、",
  titleAccent: "見てほしいページへ。",
  lead: "Googleレビュー、Instagram、メニュー、予約ページ。お店で一番見てほしいページを、スマホをかざすだけで開けるようにします。リンクの設定まで済ませてお届けするので、届いたその日から使えます。",
  badges: ["リンク設定まで込み", "1個から注文できます", "5個ごとに1個分お得"],
  /** ヒーローのビジュアルで順に切り替わるリンク先。用途セクションの予告を兼ねる。 */
  rotation: [
    { label: "Googleレビュー", tone: "sun" },
    { label: "Instagram", tone: "coral" },
    { label: "デジタルメニュー", tone: "teal" },
    { label: "LINE公式アカウント", tone: "mint" },
    { label: "予約ページ", tone: "sun" },
  ],
} as const;

export const nfcProblems = {
  eyebrow: "こんな場面で",
  title: "「あとで見ておいてください」で、終わっていませんか",
  items: [
    {
      before: "レビューをお願いしても、その場で書いてもらえない",
      after: "会計時にかざしてもらえば、投稿画面がすぐ開きます",
    },
    {
      before: "SNSのアカウント名を口頭で伝えている",
      after: "かざすだけでプロフィールが開くので、伝え間違いがなくなります",
    },
    {
      before: "紙のメニューを刷り直すたびに費用がかかる",
      after: "デジタルメニューへつなげば、内容の更新は手元で完結します",
    },
  ],
} as const;

export const nfcUseCases = {
  eyebrow: "つなげられるページ",
  title: "URLがあるページなら、だいたいつなげられます",
  description:
    "すでにお持ちのページへの導線をつくるサービスです。リンク先そのものの制作は含みません。",
  visual: {
    src: "/images/flyer/google-review-stands.webp",
    alt: "Googleレビューへ案内するNFCスタンドの設置イメージ",
  },
  items: [
    { label: "Googleレビュー", note: "投稿画面を直接開きます" },
    { label: "Googleマップ", note: "店舗情報・経路案内へ" },
    { label: "Instagram", note: "プロフィールや最新投稿へ" },
    { label: "TikTok / X / Facebook", note: "各SNSのアカウントへ" },
    { label: "LINE公式アカウント", note: "友だち追加画面へ" },
    { label: "デジタルメニュー", note: "卓上・レジ横での閲覧に" },
    { label: "予約ページ", note: "予約サイト・自社フォームへ" },
    { label: "Webサイト / ECサイト", note: "商品ページや通販へ" },
    { label: "クーポン・キャンペーン", note: "期間限定ページへ" },
    { label: "アンケートフォーム", note: "回答率を上げたいときに" },
    { label: "採用ページ", note: "求人情報・応募フォームへ" },
    { label: "そのほかのURL", note: "ご相談ください" },
  ],
} as const;

export const nfcProducts = {
  eyebrow: "商品",
  title: "2つの形から選べます",
  description: "設置したい場所に合わせて、スタンド型と平面プレート型をご用意しています。",
  items: [
    {
      id: "stand",
      name: "スタンド型",
      summary: "卓上に自立するタイプ",
      size: "表示面 約12cm × 約7.3cm",
      sizeConfirmed: true,
      places: ["レジ横", "受付カウンター", "客席テーブル", "待合スペース"],
      description:
        "自立するので、置くだけで設置が終わります。目線に入りやすく、お客様に声をかけながら使う場面に向いています。",
      image: {
        src: "/images/flyer/shop/type-stand.webp",
        alt: "卓上に自立するNFCスタンド型",
      },
    },
    {
      id: "plate",
      name: "平面プレート型",
      summary: "貼り付けて使う正方形タイプ",
      size: "正方形（寸法は確定次第ご案内します）",
      sizeConfirmed: false,
      places: ["壁面", "テーブル天板", "カウンター", "レジ周辺"],
      description:
        "厚みがないので、テーブルや壁面に貼り付けて使えます。設置場所を固定したい場合や、席ごとに複数置きたい場合に向いています。",
      image: {
        src: "/images/flyer/shop/type-plate.webp",
        alt: "テーブルや壁面に設置するNFC平面プレート型",
      },
    },
  ],
} as const;

export const nfcDesignTiers = {
  eyebrow: "デザイン",
  title: "既製デザインか、お店のデザインか",
  items: [
    {
      id: "default",
      name: "デフォルトデザイン",
      price: 4980,
      priceNote: "スタンド型・プレート型 共通",
      lead: "あらかじめ用意したデザインから選ぶタイプです。",
      features: [
        "用意されたデザインから選択",
        "白・黒などのカラーバリエーション",
        "リンク設定サポート込み",
        "最短で導入できます",
      ],
      recommended: true,
      recommendLabel: "まずはこちら",
    },
    {
      id: "original",
      name: "オリジナル印刷",
      price: 11980,
      priceAlt: 9980,
      priceNote: "スタンド型 11,980円 / プレート型 9,980円",
      lead: "お店のロゴやブランドに合わせて印刷するタイプです。",
      features: [
        "ロゴ・ブランドデザインを印刷",
        "入稿データをお持ちなら制作費0円",
        "デザイン制作の依頼も可能（+5,000円）",
        "同じデザインならまとめ買い割引の対象",
      ],
      recommended: false,
      recommendLabel: "",
    },
  ],
  designFee: {
    title: "デザインの入稿について",
    rows: [
      {
        label: "入稿データをお持ちの場合",
        value: "+0円",
        note: "完成済みのデータをお送りください",
      },
      {
        label: "デザイン制作を依頼する場合",
        value: "+5,000円",
        note: "公式LINEでご要望をうかがい、1案を制作します",
      },
    ],
  },
  gallery: [
    {
      src: "/images/flyer/shop/design-cafe.webp",
      alt: "カフェ向けNFCスタンドのデザイン例",
      label: "CAFE",
    },
    {
      src: "/images/flyer/shop/design-washoku.webp",
      alt: "和食店向けNFCスタンドのデザイン例",
      label: "WASHOKU",
    },
    {
      src: "/images/flyer/shop/design-ramen.webp",
      alt: "ラーメン店向けNFCスタンドのデザイン例",
      label: "RAMEN",
    },
  ],
  comparisonRows: [
    {
      label: "デザイン",
      default: "用意されたデザインから選択",
      original: "店舗ロゴやブランドに合わせて印刷",
    },
    {
      label: "入稿データ",
      default: "不要",
      original: "完成データを入稿、または制作を依頼",
    },
    {
      label: "デザイン制作",
      default: "不要",
      original: "+5,000円で1案制作",
    },
    {
      label: "おすすめ",
      default: "早く、手軽に導入したい店舗",
      original: "店内やブランドの世界観を揃えたい店舗",
    },
  ],
} as const;

export const nfcFlow = {
  eyebrow: "ご利用の流れ",
  title: "デザインを選んで、届いたら置くだけ",
  description:
    "NFCの書き込みや細かな設定はMake It Tech側で行います。お客様側で専用アプリを入れたり、機器を設定したりする必要はありません。",
  steps: [
    {
      title: "デザインを選択",
      body: "既製デザインから選ぶか、店舗ロゴに合わせたオリジナル印刷を選択します。デザイン制作のご依頼も可能です。",
      label: "SELECT DESIGN",
    },
    {
      title: "届いたら設置",
      body: "リンク設定と読み取り確認を済ませてお届けします。商品が届いたら、テーブルやレジ、受付に置くだけで利用開始です。",
      label: "PLACE & START",
    },
  ],
  visual: {
    src: "/images/flyer/shop/hero-stand.webp",
    alt: "届いたら置くだけで利用できるNFCスタンド",
  },
  lineSupport: {
    eyebrow: "OFFICIAL LINE SUPPORT",
    title: "細かなご要望も、購入前の相談も公式LINEへ",
    body: "デザインのご希望、リンク先の確認、設置場所や注文数のご相談まで、公式LINEで常時受け付けています。決まっていない段階でもお気軽にご連絡ください。",
    cta: "公式LINEで相談する",
  },
} as const;

export const nfcAdvanced = {
  eyebrow: "高度なカスタマイズ",
  title: "リンク先を、あとから変えられるようにする",
  lead: "NFCに最終的なURLを直接書き込むかわりに、Make It Tech側で管理するURLを書き込む方法があります。商品を作り直さずに、つなげる先を切り替えられるようになります。",
  items: [
    "商品を交換せずにリンク先を変更",
    "キャンペーン期間だけ別ページへ切り替え",
    "GoogleレビューからSNSへの切り替え",
    "複数のリンクをまとめた専用ページ",
    "かざされた回数の計測",
    "店舗別・時間帯別のアクセス集計",
    "QRコードとの併用",
  ],
  note: "標準商品には含みません。ご要望をうかがったうえで個別にお見積りします。",
  cta: "カスタマイズを相談する",
} as const;

export const nfcCorporate = {
  eyebrow: "法人・大量導入",
  title: "複数店舗への一括導入にも対応します",
  description:
    "チェーン店舗への展開や、クライアント向けにNFC商品を提供したい事業者様からのご相談も承ります。",
  targets: [
    "複数店舗を運営する法人",
    "経営コンサルティング会社",
    "MEO・Web・マーケティング支援会社",
    "店舗支援事業者・広告代理店",
  ],
  note: "一定数量以上は通常価格と分けて個別にお見積りします。まずは想定数量をお知らせください。",
  cta: "大量注文について問い合わせる",
} as const;

export const nfcFaq = {
  eyebrow: "よくある質問",
  title: "購入前に確認されることをまとめました",
  items: [
    {
      q: "NFCの設定は自分でやる必要がありますか？",
      a: "いいえ。デフォルトデザインとオリジナル印刷では、ご指定いただいたURLの書き込みと読み取り確認までこちらで行います。届いた時点で使える状態です。",
    },
    {
      q: "1個だけでも注文できますか？",
      a: "できます。1個からご注文いただけます。5個以上をまとめてご注文の場合は、5個ごとに1個分の割引が適用されます。",
    },
    {
      q: "どのスマホでも読み取れますか？",
      a: "NFCに対応した端末であれば読み取れます。iPhoneは7以降、Androidも近年の機種はほぼ対応しています。読み取れない端末のために、QRコードを併用する構成もご相談いただけます。",
    },
    {
      q: "リンク先をあとから変更できますか？",
      a: "標準の設定では、NFCに書き込んだURLが固定されます。あとから変更できるようにしたい場合は、高度なカスタマイズとして個別に対応します。",
    },
    {
      q: "Googleビジネスプロフィールがまだありません。",
      a: "NFC商品の価格には登録作業は含みませんが、Make It Tech本体で対応できます。リンク先のページがない状態でもご相談ください。",
    },
    {
      q: "ロゴのデータがなくても、オリジナル印刷を頼めますか？",
      a: "頼めます。デザイン制作を+5,000円で承ります。公式LINEでご要望をうかがい、1案を制作します。",
    },
  ],
} as const;

export const nfcCta = {
  title: "まずは、何につなげたいかだけ決まっていれば大丈夫です",
  description:
    "Googleレビューを増やしたい、SNSを見てもらいたい、メニューをデジタルにしたい。目的が決まっていれば、あとはこちらで形にします。",
  primary: "商品を見る",
  secondary: "公式LINEで相談する",
} as const;

export const nfcNotes = [
  "表示価格は現時点の基本価格です。原価・送料・製造条件により変更する場合があります。",
  "税表記、送料、納期、保証・返品条件は確定次第ご案内します。",
] as const;
