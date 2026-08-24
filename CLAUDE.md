# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

新潟県内の中小事業者・個人事業主向けDX支援サイト。Next.js 16（App Router）、React 19、TypeScript、Tailwind CSS 4、Shadcn UI で構成。

公開 LP に加えて、以下の機能を持つ多機能アプリに拡大している：
- **CMS**：ブログ / お知らせ / ニュース / my-life を Firebase（Firestore + Storage）で管理し、管理画面（admin-console サブドメイン）から編集
- **Web ツール集**：画像・PDF 変換、QR、Base64 等のクライアント完結ユーティリティ（tools サブドメイン）
- **外部連携**：LINE Messaging API、各種お問い合わせ / 申込 API

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
- `content/pages/` - ページ用コンテンツ（about.ts, services.ts, survey.ts 等）
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

### バックエンド・データ層（Firebase）

Firebase を使用（`firebase-admin`：Auth / Firestore / Storage、`firebase` クライアント）。

- サーバー初期化：`lib/firebase-admin.ts`（env：`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_STORAGE_BUCKET`）。`FIREBASE_PRIVATE_KEY` は `\n` をエスケープ解除して使用。
- クライアント初期化：`lib/firebase-client.ts`
- 管理者認証：`lib/admin-auth.ts`。`admin_session` クッキー（セッションクッキー）を検証し、Firestore `adminUsers` の `enabled` か `ADMIN_ALLOWED_EMAILS`（カンマ区切り許可リスト）で認可。`requireAdmin()` で保護ページをガード。
- データ取得：`lib/blog.ts`・`lib/blog-data.ts`、`lib/announcements*.ts`、`lib/my-life-data.ts` 等が Firestore からコンテンツを取得。

### CMS とコンテンツ描画

- 編集は admin-console サブドメイン（`app/sub/admin-console/`）。エディタは `@mdxeditor/editor`。
- 公開側（`/blog`、`/news` 等）は Markdown を `react-markdown` + remark/rehype プラグイン群で描画（`lib/markdown.ts`、`lib/markdown-toc.ts`）。
- RSS / Atom フィード、サイトマップ、robots は `app/` 配下の route / 関数で動的生成。

### ブログ画像の方針

- **Vercel の画像最適化は使わない。** 配信するファイルそのものを最終寸法・最終品質で用意する。ブログの `next/image` には `unoptimized` を付けている。
- ラスター画像は **WebP に統一**する（`sharp` で変換）。PNG / JPG は置かない。
- カバー画像は `public/images/blog/<slug>-cover.webp`、**1200×630 / q82**。この寸法は OGP と揃えてある。
- カバーはそのまま OG画像になる（`lib/seo.ts` の `resolveOgImage`）。**SVG は主要SNSで描画されない**ため、SVGを指定した場合は既定のOG画像へ自動でフォールバックする。
- 図解は SVG のままでよい。ベクターなので拡大に強く、`MarkdownImage` が素の `<img>` で描画するため最適化を経由しない。
- `coverImage.alt` は管理画面API（`z.string().max(140)`）に合わせ **140字以内**にする。

### スタイリング規約

- Tailwind CSS + CSS変数によるテーマ管理
- クラス結合：`@/lib/utils` の `cn()` を使用（clsx + tailwind-merge）
- Shadcn UI：new-york スタイル、neutral ベースカラー、CSS変数有効
- フォント：Outfit（見出し用、--font-display）、Zen Kaku Gothic New（本文用、--font-body）

### ルーティング

- `app/` - メインルート（/, /services, /contact, /about, /privacy, /terms, /survey, /blog, /news, /works, /apps, /flyer 等）
- `app/sub/` - サブドメイン用ページ（lp, admin-console, tools, nfc）
- `app/api/` - API ルート（contact, hp-lp-request, intake, niigata-contact, line/webhook, admin/* の CRUD・画像アップロード・メール送信・セッション）

### サブドメインルーティング（proxy.ts）

Next.js 16 では `middleware` ではなく **`proxy.ts` の `proxy()` 関数**を使用。ホスト名で `app/sub/*` にリライトする：

- `lp.make-it-tech.com` → `/sub/lp`
- `tools.make-it-tech.com` → `/sub/tools`（画像/PDF 変換・圧縮、QR、Base64、Favicon、JSON→表、Markdown プレビュー等のクライアント完結ツール）
- `nfc.make-it-tech.com` → `/sub/nfc`（NFC 事業の LP・カスタマイズ）
- `admin-console.*`（プレフィックス一致） → `/sub/admin-console`（管理画面 CMS）

`api` / `_next/static` / `_next/image` / `favicon.ico` は matcher で除外。

robots.txt / sitemap.xml / ads.txt は `siteFileRoutes` で**サブドメインごとにファイル単位**で管理する。登録があるものだけサブドメイン配下へリライトし、無いものは本体のルートハンドラに素通しする（例：nfc は robots.txt / sitemap.xml を自前で持ち、ads.txt は本体のものを返す）。サブドメインに新しいサイトファイルを追加したら `siteFileRoutes` にも追記する。

### NFC 事業サブドメイン（app/sub/nfc）

- 設定の単一情報源は `content/nfc/site.ts`。ホスト名、Shopify の URL、OG 情報、サイトマップ対象ルートをここに集約している。
- `nfcSite.indexable` で noindex を制御する。LP の中身が揃うまで `false`。layout の metadata と `robots.txt` の両方がこの値を見る。
- `nfcLinks.shopUrl` は Shopify 公開まで空文字。`isShopReady` が false の間、CTA は問い合わせ導線にフォールバックする。
- 本体の `app/robots.ts` は `/sub/nfc` を disallow している（本体ドメイン経由での重複クロール防止）。
- セクションコンポーネントは `app/sub/nfc/_components/` に置く。LP のコピーは `content/nfc/lp.ts` に下書き済み（未接続）。
- 配色はテーマ変数を使わず直接指定する。本体（クリーム基調）と分離し、next-themes の切り替えの影響を受けないようにするため。tools サブドメインと同じ方針。

### ファイル命名規則

- コンポーネントファイル：kebab-case（faq-section.tsx）
- コンポーネントexport：PascalCase（FAQSection）
- パスエイリアス：`@/` でルートからインポート

## 主要な依存関係

- firebase / firebase-admin - 認証・Firestore・Storage（CMS のバックエンド）
- @line/bot-sdk - LINE Messaging API（`app/api/line/webhook`）
- react-hook-form + zod - フォーム管理とバリデーション
- react-markdown + remark/rehype 各種 - Markdown 描画、@mdxeditor/editor - 管理画面エディタ
- pdf-lib / pdfjs-dist / exceljs / papaparse / jszip / browser-image-compression / qrcode - tools のファイル処理
- framer-motion - アニメーション、lenis - スムーススクロール
- lucide-react / react-icons - アイコン
- next-themes - ダーク/ライトモード

## 環境変数

`.env` で管理しコミットしない。クライアント公開は `NEXT_PUBLIC_` 始まり。

- Firebase（サーバー）：`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`
- 管理者認可：`ADMIN_ALLOWED_EMAILS`（カンマ区切り）
- Firebase（クライアント）・LINE・メール送信系は `lib/firebase-client.ts` / 各 API ルートを参照

## ビルド注意

`npm run build` は `--webpack` 指定（Turbopack ではなく Webpack でビルド）。
