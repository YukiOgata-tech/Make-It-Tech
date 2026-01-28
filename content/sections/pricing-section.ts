import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Timer, Wallet } from "lucide-react";

export type PricingPrinciple = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export type PriceItem = {
  title: string;
  range: string;
  desc: string;
  tags: string[];
  includes: string[];
  note?: string;
};

export const pricingPrinciples: PricingPrinciple[] = [
  {
    icon: ShieldCheck,
    title: "範囲を先に決める",
    desc: "“何をやる/やらない”を最初に合意して、ムダな工数を防ぎます。",
  },
  {
    icon: Timer,
    title: "小さく始めて検証",
    desc: "最小構成でまず動かし、効果を見て拡張します。",
  },
  {
    icon: Wallet,
    title: "柔軟な見積もり",
    desc: "予算・期間・体制に合わせて、最も効果が高い案から提案します。",
  },
];

export const pricingItems: PriceItem[] = [
  {
    title: "LP制作（1ページ）",
    range: "目安：¥80,000〜¥300,000",
    desc: "構成・コピー整理〜デザイン実装まで。問い合わせ導線を重視します。",
    tags: ["構成", "導線", "改善"],
    includes: ["ヒアリング", "構成案", "デザイン実装", "基本SEO", "軽微な修正（範囲内）"],
    note: "内容量、素材提供の有無、アニメーション量で変動します。",
  },
  {
    title: "店舗Webサイト（3〜6ページ程度）",
    range: "目安：¥150,000〜¥600,000",
    desc: "メニュー/アクセス/予約など、現場で更新できる形に整えます。",
    tags: ["店舗", "更新性", "SEO"],
    includes: ["ページ設計", "デザイン実装", "スマホ最適化", "基本SEO", "運用の型づくり"],
    note: "撮影・文章作成・ロゴ等は必要に応じて追加対応。",
  },
  {
    title: "フォーム＋管理シートの仕組み化",
    range: "目安：¥30,000〜¥150,000",
    desc: "問い合わせ/予約/応募などを一元化。通知や集計まで整備できます。",
    tags: ["低コスト", "現場運用", "仕組み化"],
    includes: ["入力項目設計", "フォーム作成", "スプレッドシート整備", "通知設定（必要に応じて）"],
    note: "既存運用の複雑さ・分岐条件により変動。",
  },
  {
    title: "自動化（通知・集計・連携）",
    range: "目安：¥50,000〜¥250,000",
    desc: "毎日の手作業を削減し、ミスも減らします（例：予約→通知→台帳更新）。",
    tags: ["自動化", "ミス削減", "連携"],
    includes: ["現状整理", "要件定義（軽量）", "自動化の実装", "テスト", "運用手順の簡易ドキュメント"],
    note: "連携先（LINE/メール/Google/外部SaaS）で難易度が変わります。",
  },
  {
    title: "業務改善・DX伴走（運用改善）",
    range: "目安：月額 ¥20,000〜（要相談）",
    desc: "導入して終わりにせず、KPIと現場の声で改善サイクルを回します。",
    tags: ["伴走", "改善", "運用"],
    includes: ["定例（回数は相談）", "改善案の提示", "優先順位付け", "小修正（範囲内）"],
    note: "支援範囲（Web/業務/自動化）と頻度で調整します。",
  },
];
