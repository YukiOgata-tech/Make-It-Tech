# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

新潟県内の中小事業者・個人事業主向けDX支援サイト。Next.js 16（App Router）、TypeScript、Tailwind CSS 4、Shadcn UI で構成。

## コマンド

```bash
npm run dev      # 開発サーバー起動（localhost:3000）
npm run build    # 本番ビルド（--webpack フラグ使用）
npm run start    # 本番サーバー起動
npm run lint     # ESLint 実行
```

テストフレームワークは未導入。

## アーキテクチャ

### コンテンツとコンポーネントの分離

静的テキストは `content/` に格納し、コンポーネントからインポートして使用：
- `content/sections/` - セクション用コンテンツ（hero.ts, diagnosis.ts, faq-section.ts 等）
- `content/pages/` - ページ用コンテンツ（about.ts, pricing.ts, services.ts 等）
- `content/privacy.ts`, `content/terms.ts` - 法的文書

コンポーネントはインポートでコンテンツを取得（propsではない）：
```tsx
// components/sections/*.tsx でのパターン例
import { heroContent } from "@/content/sections/hero";
```

### コンポーネント構成

- `components/sections/` - ページセクション（hero.tsx, diagnosis-section.tsx, offer-section.tsx 等）
- `components/ui/` - Shadcn UI 基本コンポーネント（button, card, accordion 等）
- `components/layout/` - レイアウト部品（container.tsx, section.tsx, site-footer.tsx）
- `components/navigation/` - ヘッダー、パンくず、モバイルナビ
- `components/providers/` - コンテキストプロバイダー（theme-provider.tsx、next-themes使用）

### サイト設定

`lib/site.ts` - サイト全体の設定（名前、説明、キーワード、ナビゲーション、SNSリンク、連絡先）。layout.tsx でメタデータと構造化データに使用。

### スタイリング規約

- Tailwind CSS + CSS変数によるテーマ管理
- クラス結合：`@/lib/utils` の `cn()` を使用（clsx + tailwind-merge）
- Shadcn UI：new-york スタイル、neutral ベースカラー、CSS変数有効
- フォント：Outfit（見出し用、--font-display）、Zen Kaku Gothic New（本文用、--font-body）

### ルーティング

- `app/` - メインルート（/, /services, /pricing, /contact, /about, /privacy, /terms, /glossary, /survey）
- `app/sub/` - サブドメイン用ページ（lp, admin）- middleware によるサブドメインルーティング想定
- `app/api/` - APIルート（お問い合わせフォーム）

### ファイル命名規則

- コンポーネントファイル：kebab-case（faq-section.tsx）
- コンポーネントexport：PascalCase（FAQSection）
- パスエイリアス：`@/` でルートからインポート

## 主要な依存関係

- framer-motion - アニメーション
- react-hook-form + zod - フォーム管理とバリデーション
- lucide-react - アイコン
- next-themes - ダーク/ライトモード
- lenis - スムーススクロール
