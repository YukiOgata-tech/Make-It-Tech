import { ShieldCheck, Sparkles, Timer } from "lucide-react";

export const heroBullets = [
  "LP/店舗サイト/コーポレート/アプリ制作(導線設計まで)",
  "LINE公式･フォーム･管理シート･自動化",
  "業務の見える化 → 改善案 → 実装 → 運用まで一貫対応",
  "“整理”でも成果に繋がります",
] as const;

export const heroTrust = [
  { icon: ShieldCheck, title: "範囲を明確化", desc: "対応範囲・優先順位を最初に決める" },
  { icon: Timer, title: "小さく始める", desc: "まずは“効く改善”から" },
  { icon: Sparkles, title: "実装から運用まで対応", desc: "ツール導入や開発~管理と運用代行/保守まで" },
] as const;
