export type GlossaryTerm = {
  id: string;
  term: string;
  reading?: string;
  desc: string;
  details?: string[];
  tags?: string[];
};

export type GlossaryGroup = {
  id: string;
  title: string;
  desc: string;
  terms: GlossaryTerm[];
};

export const glossaryGroups: GlossaryGroup[] = [
  {
    id: "operations",
    title: "業務･改善まわり",
    desc: "現場の課題整理や改善でよく出る言葉です。",
    terms: [
      {
        id: "workflow",
        term: "業務フロー",
        reading: "ぎょうむふろー",
        desc: "業務が「誰から誰へ、どの順番で進むか」を整理した流れ図。",
        details: ["手戻りや抜け漏れを見つけやすくなります。"],
        tags: ["整理", "見える化"],
      },
      {
        id: "personalization",
        term: "属人化",
        reading: "ぞくじんか",
        desc: "特定の人しか分からない状態で、引き継ぎや改善が難しいこと。",
        details: ["業務フローと入力ルールの標準化とドキュメント化で解消します。"],
        tags: ["リスク", "改善"],
      },
      {
        id: "bottleneck",
        term: "ボトルネック",
        reading: "ぼとるねっく",
        desc: "作業が滞りやすい工程。ここを改善すると全体が速くなります。",
        tags: ["課題", "改善"],
      },
      {
        id: "kpi",
        term: "KPI",
        reading: "けーぴーあい",
        desc: "重要な指標。例：問い合わせ数、予約完了率、対応時間など。",
        details: ["改善の優先順位を決める基準になります。"],
        tags: ["指標"],
      },
      {
        id: "pdca",
        term: "PDCA",
        reading: "ぴーでぃーしーえー",
        desc: "計画→実行→確認→改善の繰り返し。小さく試して改善します。",
        tags: ["改善"],
      },
    ],
  },
  {
    id: "web",
    title: "Web･集客･導線",
    desc: "Web制作や問い合わせ導線で頻出する言葉です。",
    terms: [
      {
        id: "lp",
        term: "LP(ランディングページ)",
        reading: "えるぴー",
        desc: "1ページで目的を伝えるページ。問い合わせや採用に使われます。",
        tags: ["Web"],
      },
      {
        id: "cta",
        term: "CTA",
        reading: "しーてぃーえー",
        desc: "「問い合わせはこちら」などの行動ボタン。導線の要部分です。",
        tags: ["導線"],
      },
      {
        id: "conversion",
        term: "コンバージョン",
        reading: "こんばーじょん",
        desc: "問い合わせや予約など、目的の行動が完了した状態。",
        tags: ["成果"],
      },
      {
        id: "seo",
        term: "SEO",
        reading: "えすいーおー",
        desc: "検索結果で見つけてもらうための対策。構成と情報整理が重要。Google検索に載るかどうか！",
        tags: ["集客"],
      },
      {
        id: "analytics",
        term: "アクセス解析(GA4など)",
        reading: "あくせすかいせき",
        desc: "どこから来て、どのページで離脱したかを把握する仕組み。",
        tags: ["計測"],
      },
      {
        id: "form",
        term: "フォーム",
        reading: "ふぉーむ",
        desc: "問い合わせや予約の入力画面。項目設計で精度が変わります。",
        tags: ["導線", "入力"],
      },
    ],
  },
  {
    id: "tech",
    title: "IT･ツール･システム",
    desc: "導入や自動化でよく出る言葉です。",
    terms: [
      {
        id: "saas",
        term: "SaaS",
        reading: "さーす",
        desc: "クラウドで使うソフト。月額で使えるツールが多いです。",
        tags: ["ツール"],
      },
      {
        id: "api",
        term: "API連携",
        reading: "えーぴーあい",
        desc: "異なるサービス同士をつなげて、自動で情報をやり取りする仕組み。",
        tags: ["連携"],
      },
      {
        id: "rpa",
        term: "RPA",
        reading: "あーるぴーえー",
        desc: "人がやっている定型作業を自動化する仕組み。例:データ転記、手入力→機械自動入力など。",
        tags: ["自動化"],
      },
      {
        id: "crm",
        term: "CRM",
        reading: "しーあーるえむ",
        desc: "顧客情報を管理し、対応履歴を一元化する仕組み。",
        tags: ["管理"],
      },
      {
        id: "cms",
        term: "CMS",
        reading: "しーえむえす",
        desc: "Webサイトを専門知識なしで更新できる仕組み。",
        tags: ["更新"],
      },
      {
        id: "requirements",
        term: "要件定義",
        reading: "ようけんていぎ",
        desc: "何を作るか、何を作らないかを決める工程。",
        tags: ["設計"],
      },
      {
        id: "estimate",
        term: "概算見積",
        reading: "がいさんみつもり",
        desc: "範囲と前提を決めた上での費用の目安。詳細見積の前段階です。",
        tags: ["費用"],
      },
    ],
  },
];

export const glossaryDiagnosisSteps = [
  "現状の業務フロー･担当･利用ツールの棚卸し",
  "詰まりポイントや二重入力などの課題整理",
  "推奨ITの選定理由と導線設計の提示",
  "概算見積・進行スケジュールの提示",
] as const;

export const glossaryDiagnosisDeliverables = [
  "診断サマリー(現状/課題/優先順位)",
  "改善案と推奨ITの一覧",
  "概算見積･進行プラン",
  "次のアクションの提案",
] as const;
