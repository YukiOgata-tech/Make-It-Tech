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
    id: "system-basics",
    title: "システム基礎",
    desc: "非エンジニアでも押さえておくと会話がスムーズになる土台の用語です。",
    terms: [
      {
        id: "frontend",
        term: "フロントエンド",
        reading: "ふろんとえんど",
        desc: "ユーザーが触れる画面側。Webやアプリの見た目と操作部分。",
        details: ["UIや入力画面、ボタンの配置などが該当します。"],
        tags: ["画面", "構成"],
      },
      {
        id: "backend",
        term: "バックエンド",
        reading: "ばっくえんど",
        desc: "データ処理やロジックなど、画面の裏側で動く仕組み。",
        details: ["認証・データ保存・通知などを担当します。"],
        tags: ["構成", "処理"],
      },
      {
        id: "server",
        term: "サーバー",
        reading: "さーばー",
        desc: "アプリやサイトを動かすための計算機。クラウド上に置くことが多いです。",
        tags: ["構成"],
      },
      {
        id: "cloud",
        term: "クラウド",
        reading: "くらうど",
        desc: "インターネット経由で使うIT基盤。必要な分だけ使える仕組み。",
        details: ["自社でサーバーを持たずに運用できます。"],
        tags: ["構成"],
      },
      {
        id: "database",
        term: "データベース",
        reading: "でーたべーす",
        desc: "情報を整理して保存する仕組み。検索や集計に強いです。",
        tags: ["データ"],
      },
      {
        id: "api",
        term: "API",
        reading: "えーぴーあい",
        desc: "サービス同士が情報をやり取りするための窓口。",
        details: ["ログイン情報の取得や、他ツールとの連携で使われます。"],
        tags: ["連携"],
      },
      {
        id: "domain",
        term: "ドメイン",
        reading: "どめいん",
        desc: "Webサイトの住所。例: make-it-tech.com など。",
        tags: ["Web"],
      },
      {
        id: "ssl",
        term: "SSL/TLS",
        reading: "えすえるえる",
        desc: "通信を暗号化して安全にする仕組み。URLがhttpsになります。",
        tags: ["セキュリティ"],
      },
      {
        id: "auth",
        term: "認証（Authentication）",
        reading: "にんしょう",
        desc: "本人確認をする仕組み。ログインなどが該当します。",
        tags: ["セキュリティ"],
      },
      {
        id: "authz",
        term: "認可（Authorization）",
        reading: "にんか",
        desc: "誰が何を操作できるかを決める仕組み。",
        tags: ["セキュリティ", "権限"],
      },
    ],
  },
  {
    id: "development",
    title: "開発・設計",
    desc: "要件整理から実装までの流れでよく出る言葉です。",
    terms: [
      {
        id: "requirements",
        term: "要件定義",
        reading: "ようけんていぎ",
        desc: "何を作るか、何を作らないかを決める工程。",
        details: ["予算や納期、優先順位の整理も含まれます。"],
        tags: ["設計"],
      },
      {
        id: "spec",
        term: "仕様",
        reading: "しよう",
        desc: "画面や機能がどう動くかのルール。要件定義の後に固めます。",
        tags: ["設計"],
      },
      {
        id: "wireframe",
        term: "ワイヤーフレーム",
        reading: "わいやーふれーむ",
        desc: "画面の構成や導線を決める設計図。色や装飾は最小限。",
        tags: ["設計", "画面"],
      },
      {
        id: "prototype",
        term: "プロトタイプ",
        reading: "ぷろとたいぷ",
        desc: "動きやUIを確認するための試作品。",
        tags: ["設計", "検証"],
      },
      {
        id: "mvp",
        term: "MVP",
        reading: "えむぶいぴー",
        desc: "最小構成で価値検証する開発手法。",
        details: ["最初から全部作らず、必要最低限で検証します。"],
        tags: ["開発", "検証"],
      },
      {
        id: "deploy",
        term: "リリース/デプロイ",
        reading: "りりーす",
        desc: "作ったシステムを実際に使える状態で公開すること。",
        tags: ["開発", "運用"],
      },
      {
        id: "staging",
        term: "ステージング環境",
        reading: "すてーじんぐ",
        desc: "本番前に動作確認を行う検証用環境。",
        tags: ["運用"],
      },
      {
        id: "production",
        term: "本番環境",
        reading: "ほんばん",
        desc: "実際にユーザーが使う環境。",
        tags: ["運用"],
      },
      {
        id: "git",
        term: "バージョン管理（Git）",
        reading: "ぎっと",
        desc: "変更履歴を管理する仕組み。修正の追跡や巻き戻しに使います。",
        tags: ["開発"],
      },
      {
        id: "bug",
        term: "バグ",
        reading: "ばぐ",
        desc: "想定と違う動きをする不具合。",
        tags: ["開発"],
      },
      {
        id: "qa",
        term: "QA/テスト",
        reading: "きゅーえー",
        desc: "品質確認の工程。動作・表示・入力などを確認します。",
        tags: ["検証"],
      },
    ],
  },
  {
    id: "data-integration",
    title: "データ・連携・自動化",
    desc: "データ移行や自動化でよく出る言葉です。",
    terms: [
      {
        id: "etl",
        term: "ETL",
        reading: "いーてぃーえる",
        desc: "データの抽出・変換・保存をまとめて行う処理。",
        tags: ["データ", "連携"],
      },
      {
        id: "webhook",
        term: "Webhook",
        reading: "うぇぶふっく",
        desc: "あるサービスの更新を別のサービスに自動通知する仕組み。",
        tags: ["連携"],
      },
      {
        id: "rpa",
        term: "RPA",
        reading: "あーるぴーえー",
        desc: "人がやっている定型作業を自動化する仕組み。",
        details: ["Excelやブラウザ操作の自動化によく使われます。"],
        tags: ["自動化"],
      },
      {
        id: "workflow",
        term: "ワークフロー",
        reading: "わーくふろー",
        desc: "申請・承認・通知などの流れを管理する仕組み。",
        tags: ["連携", "運用"],
      },
      {
        id: "batch",
        term: "バッチ処理",
        reading: "ばっちしょり",
        desc: "一定間隔でまとめて実行する処理。夜間実行などが多いです。",
        tags: ["運用"],
      },
      {
        id: "migration",
        term: "データ移行",
        reading: "でーたいこう",
        desc: "旧システムから新システムへデータを移す作業。",
        tags: ["データ"],
      },
      {
        id: "csv",
        term: "CSV",
        reading: "しーえすぶい",
        desc: "表形式のデータファイル。インポート/エクスポートでよく使います。",
        tags: ["データ"],
      },
      {
        id: "dashboard",
        term: "ダッシュボード",
        reading: "だっしゅぼーど",
        desc: "指標をひと目で見られる画面。日次の確認に使います。",
        tags: ["データ", "可視化"],
      },
      {
        id: "bi",
        term: "BI",
        reading: "びーあい",
        desc: "データを可視化・分析して意思決定に使う仕組み。",
        tags: ["データ", "可視化"],
      },
      {
        id: "logging",
        term: "ログ",
        reading: "ろぐ",
        desc: "操作やエラーの記録。原因調査や改善に使います。",
        tags: ["運用"],
      },
    ],
  },
  {
    id: "operations-security",
    title: "運用・保守・セキュリティ",
    desc: "公開後の運用や安全性に関する用語です。",
    terms: [
      {
        id: "maintenance",
        term: "保守・運用",
        reading: "ほしゅうんよう",
        desc: "公開後の更新・監視・改善対応などを継続的に行うこと。",
        tags: ["運用"],
      },
      {
        id: "monitoring",
        term: "監視",
        reading: "かんし",
        desc: "異常や停止を検知する仕組み。アラート通知とセットで使います。",
        tags: ["運用"],
      },
      {
        id: "backup",
        term: "バックアップ",
        reading: "ばっくあっぷ",
        desc: "万が一に備えてデータを保管すること。",
        tags: ["運用"],
      },
      {
        id: "availability",
        term: "可用性（Uptime）",
        reading: "かようせい",
        desc: "システムが止まらずに使える状態を保つ指標。",
        tags: ["運用"],
      },
      {
        id: "sla",
        term: "SLA",
        reading: "えすえるえー",
        desc: "サービスの品質や対応時間の取り決め。",
        tags: ["運用"],
      },
      {
        id: "access-control",
        term: "アクセス制御",
        reading: "あくせすせいぎょ",
        desc: "権限によって操作できる範囲を制限する仕組み。",
        tags: ["セキュリティ", "権限"],
      },
      {
        id: "permission",
        term: "権限管理",
        reading: "けんげんかんり",
        desc: "誰が何を操作できるかを管理すること。",
        tags: ["セキュリティ", "権限"],
      },
      {
        id: "vulnerability",
        term: "脆弱性",
        reading: "ぜいじゃくせい",
        desc: "セキュリティ上の弱点。悪用されると被害が出る可能性があります。",
        tags: ["セキュリティ"],
      },
      {
        id: "incident",
        term: "インシデント",
        reading: "いんしでんと",
        desc: "障害や情報漏洩など、対応が必要な出来事。",
        tags: ["セキュリティ", "運用"],
      },
    ],
  },
  {
    id: "ai",
    title: "AI・生成AI",
    desc: "生成AI活用でよく出る言葉です。",
    terms: [
      {
        id: "llm",
        term: "LLM",
        reading: "えるえるえむ",
        desc: "大量の文章から学習した言語モデル。文章生成や要約に強いです。",
        tags: ["AI"],
      },
      {
        id: "prompt",
        term: "プロンプト",
        reading: "ぷろんぷと",
        desc: "AIに指示を出す文。具体性が高いほど精度が上がります。",
        tags: ["AI"],
      },
      {
        id: "rag",
        term: "RAG",
        reading: "らぐ",
        desc: "社内データなどを検索してAIの回答に反映する仕組み。",
        tags: ["AI", "検索"],
      },
      {
        id: "hallucination",
        term: "ハルシネーション",
        reading: "はるしねーしょん",
        desc: "AIが事実と違う内容をそれらしく答える現象。",
        tags: ["AI"],
      },
      {
        id: "token",
        term: "トークン",
        reading: "とーくん",
        desc: "AIが処理する文字の単位。コストや制限に影響します。",
        tags: ["AI"],
      },
      {
        id: "fine-tuning",
        term: "ファインチューニング",
        reading: "ふぁいんちゅーにんぐ",
        desc: "特定のデータでAIを追加学習させる方法。",
        tags: ["AI"],
      },
      {
        id: "automation-ai",
        term: "AI自動化",
        reading: "えーあいじどうか",
        desc: "AIを使って文章作成や分類などの作業を自動化すること。",
        tags: ["AI", "自動化"],
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
