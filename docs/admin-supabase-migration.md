# Admin Console の Supabase 移行方針

> 移行時の計画記録です。現在のサイト実行時のデータとファイル保存先は Supabase です。Firebase は移行・照合スクリプトの入力元としてのみ使用します。現行構成は `README.md` を参照してください。

## 移行当時の構成

- 認証と管理画面のアクセス判定は Supabase Auth と `mit` スキーマを使用する。
- 記事、契約、問い合わせ、NFC、My Life などの既存データ処理は引き続き Firestore / Firebase Storage を使用する。
- Firestore の `adminUsers` は移行前データとして保持するが、アクセス判定には使用しない。
- 管理画面の全機能は当面 `owner` と `admin` に限定する。

## 権限モデル

| ロール | 想定する権限 |
| --- | --- |
| `owner` | 組織全体、権限管理、重要設定、すべての業務操作 |
| `admin` | 現在の管理画面機能と日常的な管理操作 |
| `staff` | 担当業務の作成・更新。権限管理や重要設定は不可 |
| `viewer` | 閲覧のみ |

`requireAdmin()` は `owner` と `admin` だけを許可する。スタッフ向け機能を追加するときは、対象ルートで `requireMitRole(["owner", "admin", "staff"])` のように許可ロールを明示する。

## データ構造

- `mit.app_users`: Supabase Auth のユーザーと業務アカウント状態を管理する。
- `mit.entity_memberships`: 事業体ごとの所属、ロール、利用状態を管理する。
- `mit.entities`: Make It Tech を含む事業体を管理する。業務データは `entity_id` で分離する。
- `public.get_mit_admin_access()`: ログイン中の本人について、Make It Tech の有効な所属だけを返す。ユーザーIDを引数では受け取らない。

## 移行順序

1. Supabase Auth と所属権限へ管理画面の入口を移す。
2. Firestore の各コレクションに対応する Supabase テーブルを業務単位で追加する。
3. 対象機能ごとにバックフィル、件数・内容の照合、読み取り先の切り替えを行う。
4. 安定期間後に書き込み先を Supabase に一本化する。
5. Firebase Auth と移行済み Firestore コレクションを停止する。

機能単位で切り替えることで、移行中も既存管理画面を利用できる状態を維持する。
