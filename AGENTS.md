# Repository Guidelines

本リポジトリは Next.js（App Router）、TypeScript、Tailwind CSS で構成された DX 支援サイトです。変更内容を揃え、レビューしやすくするために以下の指針に従ってください。

## Project Structure & Module Organization

- `app/`: ルートセグメント、`layout.tsx`、`page.tsx`、`globals.css`、`contact/`・`pricing/`・`blog/`・`news/` などのルートフォルダ。
- `app/sub/`: サブドメイン用ページ（`lp`・`tools`・`admin-console`）。`proxy.ts` がホスト名でここへリライトする。
- `app/api/`: API ルート（contact / hp-lp-request / intake / niigata-contact / line/webhook / admin の CRUD 等）。
- `components/`: 共通 UI、セクションコンポーネント、レイアウト部品（ファイル名は kebab-case、export は PascalCase）。
- `components/ui/`: ベース UI 部品、`components/providers/`: アプリ全体の Provider、`components/admin/`: 管理画面用。
- `content/`: `privacy.ts`、`terms.ts` などの本文データ。
- `lib/`: 共通ユーティリティ。Firebase 初期化（`firebase-admin.ts` / `firebase-client.ts`）、管理者認証（`admin-auth.ts`）、Firestore データ取得、Markdown 処理を含む。
- `proxy.ts`: サブドメインルーティング（Next.js 16 では middleware ではなく `proxy()` を使用）。
- `public/`: 静的アセット（画像、アイコン、QR、PDF）。
- `.next/`: ビルド成果物（生成物なので編集しない）。

## Build, Test, and Development Commands

- `npm install`: 依存関係のインストール。
- `npm run dev`: ローカル開発サーバー起動（`http://localhost:3000`）。
- `npm run build`: 本番ビルドの生成。
- `npm run start`: 本番ビルドの起動。
- `npm run lint`: ESLint の実行。

## Coding Style & Naming Conventions

- `app/` と `components/` に合わせ、2 スペースインデント、ダブルクォート、セミコロンを使用。
- コンポーネントのファイル名は kebab-case（例: `faq-section.tsx`）、export は PascalCase。
- ルート参照は `@/` のエイリアスを優先。
- Tailwind CSS を基本とし、クラス結合は `clsx` と `tailwind-merge` を使用。

## Testing Guidelines

現時点では自動テスト未導入で、`npm test` スクリプトもありません。導入する場合は `*.test.ts`/`*.test.tsx` または `__tests__/` を使い、`package.json` にテストスクリプトを追加し、ここに実行方法を記載してください。

## Commit & Pull Request Guidelines

- Git 履歴は短い小文字メッセージ（例: "first commit"）が中心です。命令形で、単一変更に絞ったコミットにしてください。
- PR には概要、テスト結果（`npm run lint` / `npm run build`）、UI 変更時のスクリーンショットを含め、関連 Issue があればリンクしてください。

## Backend & External Services

- データ層は Firebase（`firebase-admin`：Auth / Firestore / Storage）。CMS（ブログ・お知らせ・ニュース・my-life）の保存先。
- 管理者認証は `lib/admin-auth.ts`：`admin_session` クッキー検証 + Firestore `adminUsers` か `ADMIN_ALLOWED_EMAILS` で認可。保護ページは `requireAdmin()` を使用。
- 外部連携：LINE Messaging API（`@line/bot-sdk`、`app/api/line/webhook`）。
- 管理画面のエディタは `@mdxeditor/editor`、公開側の描画は `react-markdown` + remark/rehype。

## Security & Configuration Tips

- 秘密情報や設定は `.env` を使用し、コミットしないこと。
- クライアント公開の環境変数は `NEXT_PUBLIC_` で始めること。
- Firebase 関連の必須 env：`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_STORAGE_BUCKET`、管理者認可は `ADMIN_ALLOWED_EMAILS`。
