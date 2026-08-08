# DX推進・業務改善支援 Webサイト

本リポジトリは、新潟県内を中心とした中小事業者・個人事業主向けに提供する  
**DX推進・業務改善支援事業**の内容を紹介するためのWebサイトです。

Next.js を用いて、事業内容・対応可能業務・支援方針・問い合わせ方法などを
分かりやすく整理・発信することを目的としています。

---

## 開発手順

```bash
npm install
npm run dev
```

- ローカル起動: `http://localhost:3000`
- 本番ビルド: `npm run build`（Turbopack ではなく Webpack でビルド）
- 本番起動: `npm run start`
- Lint: `npm run lint`
- 型チェック: `npm run typecheck`
- GA 運用スクリプト: `npm run ga:admin`

環境変数は `.env.example` を `.env.local` にコピーして設定してください。

---

## 事業概要

本事業は、業務の非効率化・属人化・アナログ運用といった課題を整理し、  
ITツールや簡易システムを活用して「現場で実際に使える形」に落とし込む  
**実務寄りのDX支援**を行うものです。

一般的なDXコンサルティングに留まらず、

- 既存ツール（LINE公式・フォーム・スプレッドシート等）の活用
- 必要に応じた簡易システムの構築
- 導入後の運用・改善支援

まで一貫して対応します。

---

## 主な対象

- 新潟県内の中小事業者・個人事業主
- 飲食店、美容室・サロン、小規模サービス業
- 従業員数 1〜30 名程度
- IT専任担当者がいない、または兼任している事業者

---

## 提供サービス例

- 初回相談・ヒアリング
- 業務診断（条件により無料）
- 業務フローの整理・見える化
- 属人化・非効率ポイントの洗い出し
- LINE公式アカウント、フォーム、管理シートの導入
- 簡易システム・自動化の構築
- 導入後の運用サポート・改善提案

---

## 見積もり方針

- 案件ごとに必要な範囲を整理して個別に見積もり
- 対応範囲と費用の合意後に着手
- 必要に応じて単発対応・継続支援を提案

※ 事業者側のリスクを最小限に抑える設計を重視しています。

---

## Webサイトで扱う主なページ

- トップページ（事業概要・業務診断の導線）
- サービス内容紹介
- 契約・見積もりに関する注意事項
- LINEで相談（LINE）
- お問い合わせ / HP・LP 制作依頼 / 業務診断フォーム
- 事業所概要
- ブログ・お知らせ（Firebase 管理の CMS で更新）
- 制作実績、提供アプリの案内
- プライバシーポリシー
- 注意事項（利用規約）、セキュリティポリシー

---

## 技術スタック

- Next.js 16（App Router）/ React 19
- TypeScript
- Tailwind CSS 4 + Shadcn UI（Radix UI ベース）
- Framer Motion / Lenis / Lottie
- Firebase（Auth・Firestore・Storage）: CMS とフォーム回答の保存先
- React Hook Form + Zod: フォーム管理とバリデーション
- react-markdown + remark/rehype: 公開側の Markdown 描画
- @mdxeditor/editor: 管理画面のエディタ
- Resend: メール送信 / LINE Messaging API: LINE 連携
- Vercel: ホスティング（`proxy.ts` によるサブドメイン運用）

---

## ディレクトリ構成（主要）

- `app/`: ルートセグメント、ページ、`layout.tsx`、`globals.css`
- `app/api/`: API ルート（問い合わせ・申込・LINE Webhook・管理画面の CRUD）
- `app/sub/`: サブドメイン用ページ（`lp` / `tools` / `admin-console`）
- `components/`: 共通UI、セクション、レイアウト部品
- `components/ui/`: ベースUI部品
- `components/providers/`: アプリ全体のProvider
- `content/`: 本文データ（`privacy.ts`, `terms.ts` など）
- `lib/`: ユーティリティ、Firebase 初期化、管理者認証、Markdown 処理
- `proxy.ts`: ホスト名によるサブドメインリライト
- `scripts/`: 運用スクリプト
- `public/`: 静的アセット（画像、アイコン）
- `firestore.rules` / `storage.rules`: Firebase セキュリティルール

---

## データ保存・クッキー

- クッキー同意モーダルを表示し、同意状態はクッキーに保存します。
- お問い合わせフォームの入力内容は一時保存（localStorage）に対応し、保存期間はユーザーが変更可能です。

---

## サブドメイン運用方針

`make-it-tech.com` を正規ドメインとし、将来的なサブドメインは
同一リポジトリ内で `app/sub/` 配下に配置して管理します。

- 例: `app/sub/lp/page.tsx`, `app/sub/tools/page.tsx`
- Next.js 16 では `middleware.ts` ではなく **`proxy.ts` の `proxy()` 関数**でリライトします
- 現在の割り当て:
  - `lp.make-it-tech.com` → `/sub/lp`
  - `tools.make-it-tech.com` → `/sub/tools`（画像・PDF 変換等のクライアント完結ツール集）
  - `admin-console.*` → `/sub/admin-console`（管理画面 CMS）
- Vercel の Domains にサブドメインを追加して運用

---

## 注意事項

- 本サイトは契約を保証するものではありません
- 対応範囲・内容は案件ごとに相談のうえ決定します
- 法的文言については必要に応じて専門家確認を行います

---

## 開発目的

- 事業内容を分かりやすく言語化・可視化する
- 問い合わせ前に事業者側の理解を揃える
- DX支援を「難しいもの」ではなく「身近な改善」として伝える
