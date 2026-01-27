# Gemini コンテキストファイル (GEMINI.md)

このファイルは、Gemini AI エージェントが本プロジェクトで作業する際のコンテキスト（文脈）を提供するためのものです。

## プロジェクト概要

**名称:** dx-support-site (Make It Tech)
**説明:** 新潟県内の中小事業者・個人事業主をターゲットとした、DX推進および業務改善支援サービスの公式サイト。サービス内容、料金体系、問い合わせ方法を可視化することを目的としています。
**主な目標:**
*   事業内容と効率的な業務フローの可視化。
*   非エンジニアの経営者層にも分かりやすい情報提供。
*   問い合わせや相談のプラットフォーム化（LINE連携、フォーム）。

## 技術スタック

*   **フレームワーク:** Next.js 16.1.4 (App Router)
*   **言語:** TypeScript
*   **スタイリング:** Tailwind CSS 4, CSS 変数
*   **UI コンポーネント:** Shadcn UI (Radix UI プリミティブ), Lucide React (アイコン)
*   **アニメーション:** Framer Motion
*   **フォーム管理:** React Hook Form + Zod
*   **フォント:** Google Fonts (Outfit, Zen Kaku Gothic New)
*   **デプロイ:** Vercel (middleware によるサブドメイン運用)

## 主要なディレクトリとファイル

*   `app/`: アプリケーションソースコード (App Router)。
    *   `app/layout.tsx`: 共通レイアウト。ThemeProvider、ヘッダー、フッター、SEOメタデータの設定。
    *   `app/page.tsx`: トップページ。Hero, Diagnosis, Offer, FAQ などのセクションで構成。
    *   `app/sub/`: サブドメイン用ページ（`lp`、`admin` など）。middleware でのリライトにより制御。
    *   `app/api/`: API ルート（例: `contact/route.ts`）。
*   `components/`: React コンポーネント。
    *   `ui/`: Shadcn UI の基本コンポーネント。
    *   `*-section.tsx`: ページ内の特定セクション用コンポーネント。
*   `lib/`: ユーティリティ関数。
    *   `site.ts`: サイト全体の共通設定と定数。
    *   `utils.ts`: ヘルパー関数 (clsx, twMerge)。
*   `content/`: 静的コンテンツ（プライバシーポリシー、利用規約など）。
*   `middleware.ts`: サブドメインのルーティング制御（`*.make-it-tech.com` を `/sub/*` へリライト）。
*   `components.json`: Shadcn UI の設定ファイル。

## 開発ワークフロー

### コマンド

*   `npm run dev`: 開発サーバーの起動。
*   `npm run build`: 本番用ビルドの作成。
*   `npm run start`: 本番サーバーの起動。
*   `npm run lint`: ESLint による静的解析。

### コーディング規約

*   **スタイリング:** Tailwind CSS のユーティリティクラスを使用。マジックナンバーは避け、テーマ変数を使用すること。
*   **コンポーネント:** 関数型コンポーネントを推奨。ベース部品には Shadcn UI を活用。
*   **型定義:** TypeScript を厳格に使用。フォームには Zod スキーマを定義すること。
*   **SEO:** メタデータは `layout.tsx` および各ページの Metadata API で管理。
*   **サブドメイン:** 新しいサブドメインを追加する場合は、`app/sub/[subdomain]/page.tsx` を作成し、`middleware.ts` のルーティング論理を確認すること。

## 特記事項

*   **フォント:** 表示用 (Display) に `Outfit`、本文用 (Body) に `Zen Kaku Gothic New` を `app/layout.tsx` で設定。
*   **メタデータ:** `lib/site.ts` に集約された設定値を `app/layout.tsx` で参照。
*   **アイコン:** Lucide React を標準アイコンライブラリとして使用。
*   **テーマ:** `next-themes` によるダークモード/ライトモード対応（`components/providers/theme-provider.tsx`）。