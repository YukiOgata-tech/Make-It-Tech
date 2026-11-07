# Make It Tech タスク管理

## 概要

Admin Console の `/tasks` で、事業・事業部・複数カテゴリ・担当者・ステータス・優先度・期限を管理します。

- 事業 = `mit.task_businesses`。NFC、Web制作、システム開発などの事業ラインを表し、法的な事業体 `mit.entities` とは分離します。
- 事業部 = `mit.task_departments`。1つの事業の下に所属します。
- カテゴリ = `mit.task_categories`。事業を横断して使用でき、`mit.task_category_links` で1タスクに複数付与できます。
- タスク = `mit.tasks`。認証ユーザー、会社・事業体、分類、状態、優先度、担当者、期日を保持します。

## 期限

`due_date` は日付、`due_time` は任意の時刻、`due_timezone` は `Asia/Tokyo` に固定します。期限日だけを入力した場合はその日全体が期限であり、時刻を入力した場合は指定時刻が期限です。JSTの今日・期限超過を表示します。通知・繰り返しタスク・外部カレンダー同期は未実装です。

## 認証・保存

Supabase Auth + `mit.entity_memberships` によって、アクセスできる事業体を制御します。現在の管理画面入口では `owner/admin` のみ利用できます。RLSは閲覧を所属メンバー、書き込みを `owner/admin/staff` に限定します。

データは `mit` スキーマへ保存し、`public.mit_task_*` の `security_invoker=true` ビューから取得します。タスクとカテゴリリンクは `public.mit_save_task` RPCで一つのトランザクションとして保存します。担当者候補は `public.get_mit_task_members` で同じMake It Tech事業体の有効ユーザーだけを返します。

## 導入

1. `supabase/migrations/20261107120000_add_task_management.sql` をマイグレーションとして適用する。
2. `npm run typecheck` / `npm run lint` / `npm run build` を実行する。
3. 管理画面 `https://admin-console.make-it-tech.com/tasks` から分類を登録し、タスクを作成する。
4. 日付のみ・時刻あり・複数カテゴリ・担当者・完了状態・分類不一致の拒否を検証する。

## 運用上の制限（V1）

- タスク一覧は新着の最大1,000件を読み込み、画面上で検索・並び替えます。1,000件を超える運用ではサーバー検索・ページネーションへ拡張してください。
- 分類は追加のみをUIで提供します。既存の分類の名称変更、無効化、削除は次の段階で追加します。
- 添付、サブタスク、繰り返し、通知、カレンダー同期、活動履歴は未実装です。
