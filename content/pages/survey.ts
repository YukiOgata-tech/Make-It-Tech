import { ClipboardList, MessageCircle, Sparkles } from "lucide-react";

export const surveyBenefits = [
  {
    title: "チャットで気軽に相談",
    desc: "アンケートではなく会話形式。必要な情報だけを短く共有できます。",
    icon: MessageCircle,
  },
  {
    title: "やりとりを一本化",
    desc: "質問や追加確認もLINE内で完結。対応が迷子になりません。",
    icon: ClipboardList,
  },
  {
    title: "資料や画像も送れる",
    desc: "スクショや既存資料があると、診断・提案の精度が上がります。",
    icon: Sparkles,
  },
] as const;

export const surveyPrerequisites = [
  {
    title: "現状の業務と課題",
    items: [
      "誰が・いつ・どの作業をしているか",
      "詰まりやすいポイント（手戻り/二重入力など）",
      "今使っているツールや仕組み",
    ],
  },
  {
    title: "理想の状態・目的",
    items: [
      "どの作業を減らしたいか",
      "達成したいゴール（予約数/対応速度/売上など）",
      "優先順位（今すぐ/あとで）",
    ],
  },
  {
    title: "制約・条件",
    items: [
      "予算感・希望納期",
      "担当できる人数や工数",
      "社内ルールや権限の制約",
    ],
  },
  {
    title: "既存資料・データ",
    items: [
      "既存のフォームやExcel/シート",
      "メニュー・料金・サービス情報",
      "予約/問い合わせの流れが分かる資料",
    ],
  },
] as const;

export const surveyChatOutline = [
  {
    title: "現状と課題",
    items: [
      "今困っている作業や場面",
      "分散している窓口や作業",
      "改善したい理由・背景",
    ],
  },
  {
    title: "理想とゴール",
    items: [
      "こうなったら嬉しい状態",
      "優先したい成果（集客/効率/ミス削減）",
      "最低限必要な機能・条件",
    ],
  },
  {
    title: "制約・条件",
    items: [
      "予算・納期の希望",
      "担当者の稼働可能時間",
      "既存ルールや社内事情",
    ],
  },
  {
    title: "既存ツール・データ",
    items: [
      "今使っているツール（LINE/フォーム/シートなど）",
      "連携したいサービス",
      "データの保管場所",
    ],
  },
  {
    title: "支援範囲のイメージ",
    items: [
      "Web制作のみ / 業務改善のみ / 両方",
      "運用まで継続的に支援してほしいか",
      "まずは小さく試したいか",
    ],
  },
] as const;

export const surveySteps = [
  {
    title: "LINE公式を追加",
    desc: "友だち追加後、すぐにチャット相談を開始できます。",
  },
  {
    title: "チャットで状況共有",
    desc: "現状・理想・制約を短く教えてください。必要なら追加質問します。",
  },
  {
    title: "診断と提案",
    desc: "内容を整理し、無料診断の進め方や概算の方向性をご案内します。",
  },
] as const;
