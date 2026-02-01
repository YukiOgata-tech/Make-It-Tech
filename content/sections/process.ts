import {
  ClipboardList,
  Compass,
  Hammer,
  LineChart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export type ProcessStep = {
  step: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  outputs: string[];
  decision?: {
    label: string;
    note: string;
  };
};

export type ProcessGuarantee = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

export const processSteps: ProcessStep[] = [
  {
    step: "STEP 01",
    title: "ヒアリング&現状整理",
    icon: ClipboardList,
    desc:
      "現状の困りごと･理想･制約(予算/期間/担当者)を整理し、ゴールと優先順位を明確にします。",
    outputs: ["課題の言語化(箇条書き)", "優先順位の決定", "対応範囲の合意(やる/やらない)"],
    decision: {
      label: "ここで決める",
      note: "“何を作るか”より先に、“何を作らないか”を決めます。",
    },
  },
  {
    step: "STEP 02",
    title: "設計(構成の提案)",
    icon: Compass,
    desc:
      "既存ツールで解決できるなら開発しません。最小構成で効果が出る案を設計します。",
    outputs: ["最小構成の提案(ツール/導線/運用)", "見積もりレンジ(目安)", "2~4週間の実行プラン"],
    decision: {
      label: "ここで判断",
      note: "開発が必要かどうか/先にやるべき改善を判断します。",
    },
  },
  {
    step: "STEP 03",
    title: "実装(早く動かす)",
    icon: Hammer,
    desc:
      "LP/店舗サイト/フォーム/自動化/簡易システムなど、必要な範囲で実装。まず動く状態を作ります。",
    outputs: ["初期版の公開(最小機能)", "運用手順(ドキュメント)", "計測/改善の土台(導線･数字)"],
  },
  {
    step: "STEP 04",
    title: "運用&改善",
    icon: LineChart,
    desc:
      "導入して終わりにしない。現場の声と数字をもとに改善サイクルを回し、成果に寄せます。",
    outputs: ["改善案(優先順位付き)", "運用改善(ルール/入力/集計)", "導線改善(CV/予約/問い合わせ)"],
  },
];

export const processGuarantees: ProcessGuarantee[] = [
  {
    icon: ShieldCheck,
    title: "範囲を明確にします",
    desc: "対応範囲と優先順位を合意して進行。無限対応にならないよう設計します。",
  },
  {
    icon: Sparkles,
    title: "最小実装を優先します",
    desc: "小さく作って検証→拡張。ムダな開発を避け、最短で効果に近づけます。",
  },
];
