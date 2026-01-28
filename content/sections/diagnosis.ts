import { Calculator, FileSearch, ListChecks, Sparkles } from "lucide-react";

export const diagnosisOutcomes = [
  {
    title: "現状を深く把握",
    desc: "業務フロー･担当者･使用ツールを棚卸しし、課題の構造を明確にします。",
    icon: FileSearch,
  },
  {
    title: "改善余地を可視化",
    desc: "詰まりやすい工程や二重入力など、コストが高いポイントを洗い出します。",
    icon: ListChecks,
  },
  {
    title: "推奨ITの提案",
    desc: "必要最小限のIT導入で回る形を設計し、選定理由まで提示します。",
    icon: Sparkles,
  },
  {
    title: "概算見積まで提示",
    desc: "範囲と優先順位を合意したうえで、概算費用と進行イメージを示します。",
    icon: Calculator,
  },
] as const;

export const diagnosisComparisons = [
  {
    title: "お問い合わせ･無料相談",
    desc: "方向性の整理や相談内容のヒアリングが中心です。",
    items: ["困りごとの共有", "目的や制約の整理", "次の進め方を提案"],
  },
  {
    title: "業務診断(条件により無料)",
    desc: "現状把握･推奨IT･見積まで行う、診断型の支援です。",
    items: ["現状の詳細把握", "改善案と推奨技術の提示", "概算見積･スケジュール提示"],
  },
] as const;

export const diagnosisDeliverables = [
  "診断サマリー(現状/課題/優先順位)",
  "推奨IT･導線の提案",
  "概算見積･進行プラン",
  "次のアクションの提案",
] as const;

export const diagnosisFreeConditions = [
  "初回の診断であること",
  "診断範囲が小規模(オンライン中心･短時間)",
  "支援前提の検討段階であること",
] as const;
