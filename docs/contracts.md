# Make It Tech 電子契約 V1 技術・運用仕様

## 目的と対象

Make It Techと取引先法人の間で、完成済みPDFを原本としてNDA、FDE基本契約、FDE個別契約、Web制作契約、システム開発・業務委託契約、その他契約を締結・管理する内部業務システムです。

V1は認定電子署名サービスや外部認証局を再現するものではありません。署名画像ではなく、契約当事者、固定したPDF、本人確認方法、権限表明、明示的同意、サーバー時刻、接続情報、Audit Logを契約IDへ結び付けて保存します。

## 画面とルーティング

- 管理画面: `admin-console.make-it-tech.com/contracts`
- 署名画面: `sign.make-it-tech.com/c/{token}`
- ローカル管理画面: `/sub/admin-console/contracts`
- ローカル署名画面: `/sub/sign/c/{token}`
- `proxy.ts`が`sign.make-it-tech.com`を`/sub/sign`へリライトします。
- `/api`はサブドメインリライト対象外で、同一のRoute Handlerを利用します。

署名サイトは`noindex`とし、専用の`robots.txt`でも全クロールを拒否します。

## NDA Wordテンプレート

管理画面の新規契約ページから、認証済み管理者だけが`nda-standard-v1`を使用できます。空のテンプレートのダウンロードと、フォーム入力を反映したWordの生成に対応します。テンプレートは公開ディレクトリへ置かず、Route HandlerがファイルのSHA-256を検証してから読み込みます。

V1ではWordファイル自体を原本登録または署名対象にしません。次の手順で使用します。

1. 「NDA自動作成を使用」を選ぶ
2. 契約先の法人名、所在地、代表者の役職・氏名、契約書記載日を入力
3. 必要に応じて契約目的、契約期間、終了通知期限、自動更新期間、秘密保持義務の存続期間を入力
4. 紙契約用の締結文言と押印欄を電子締結用へ置き換えることを確認し、入力済みWordを生成
5. Word上で当事者情報と条文を最終確認し、必要な個別修正を行ってPDFへ書き出す
6. そのPDFを新規契約画面の原本欄へ登録
7. 管理画面情報とPDF内の当事者・署名者情報が一致していることを確認して原本ロック

自動生成時は、甲の名称、所在地、法人名・商号、代表者、契約書記載日を差し込みます。任意の契約目的は第1条へ、各期間条件は第15条へ反映します。また、末尾の「本書2通・記名押印」の文言を電磁的記録による締結・保管の文言へ置き換え、甲乙の「印」欄を削除します。この置き換えは管理画面の確認チェックを必須とします。

生成したWord自体はサーバーへ保存しません。PDF登録時にはテンプレートID、版、テンプレート原本SHA-256を契約とAudit Logへ保存します。これは使用した雛形の申告記録であり、WordからPDFへの編集差分を自動証明するものではありません。署名対象として固定されるのは登録したPDFのSHA-256です。

## データ構造

### `contracts/{contractId}`

主なフィールド:

- `contractNumber`: `MIT-C-YYYY-00001`形式の管理番号
- `title`, `type`, `internalMemo`
- `status`: 状態
- `company`: 法人名、法人番号、所在地
- `signer`: 氏名、役職、メールアドレス
- `verificationMethod`: V1は`company_email_link`
- `document`: 原本のversion、Storageパス、SHA-256、サイズ、ページ数、原ファイル名、ロック日時
- `acceptance`: 本人・権限・内容確認・同意、文言バージョン、確認方法、接続証跡
- `executedDocument`, `certificateDocument`: 生成物のStorageパスとSHA-256
- `auditLastHash`, `auditSequence`: Auditチェーン末尾
- 各種UTC Timestamp

### `contracts/{contractId}/events/{eventId}`

append-onlyのAudit Logです。`sequence`、`eventType`、`occurredAt`、`actorType`、匿名化した`actorId`、IP、User-Agent、requestId、metadata、`previousHash`、`eventHash`を保存します。

### `contractTokens/{tokenHash}`

署名URLトークンのSHA-256をドキュメントIDとして利用します。平文トークンは保存しません。契約ID、状態、作成日時、有効期限、使用・失効日時を保持します。

### `counters/contracts-{year}`

契約番号の年別カウンターです。Firestore Transactionで更新し、競合時にも重複しません。年は採番時のAsia/Tokyoで決定します。

## Storage構造

```text
contracts/{contractId}/original.pdf
contracts/{contractId}/executed.pdf
contracts/{contractId}/certificate.pdf
```

すべて`ifGenerationMatch: 0`の作成時条件で保存し、既存オブジェクトを上書きしません。原本は登録時にPDFヘッダー、Content-Type、サイズ、暗号化有無、ページ数を検査します。上限は4MBです。

署名者・管理者ともFirebase Storageへ直接アクセスせず、認証・トークン検証を行うRoute Handlerから配信します。

## ステータス遷移

```text
draft
  -> ready       Make It Tech承認・原本ロック
  -> void

ready
  -> sent        署名URL発行・メール送信
  -> void

sent
  -> viewed      署名ページ初回表示
  -> expired
  -> void

viewed
  -> signed      同意と証跡をatomicに確定
  -> expired
  -> void

signed
  -> completed   PDF生成後に最終Auditイベントを確定

completed
  -> void        元データとPDFを保持したまま失効記録を追加
```

`signed`はPDF生成中または生成再開待ちの中間状態です。障害時は同じ署名URLから再実行でき、原本・同意・時刻・Audit Hashは変更されません。

## Token仕様

- Node.js `crypto.randomBytes(32)`による256bit乱数
- URLはbase64url形式
- DBにはSHA-256のみ保存
- 既定期限7日、管理画面で1～30日を指定可能
- 締結時にTransaction内で`used`へ変更
- 管理画面から失効時は`revoked`
- 期限切れは署名ページ表示時に`expired`としてAudit記録
- 使用済みトークンは再締結に利用できない
- 締結完了後は同じ秘密URLから成果物を取得できるが、再同意処理は行われない

URLは機密情報として扱い、メール以外で共有しません。アプリケーションログへ平文トークンを出力しません。

## Audit Hash仕様

イベントのキーを再帰的に辞書順へ並べたcanonical JSONを作成し、以下を計算します。

```text
eventHash = SHA-256(canonicalEventPayload including previousHash)
```

イベント追加と契約本体の`auditLastHash`・`auditSequence`更新は同一Firestore Transactionで行います。イベントの削除・更新APIは提供しません。

締結時は次のイベントを一つのTransactionで追加します。

- `VERIFICATION_STARTED`
- `VERIFICATION_SUCCEEDED`
- `AUTHORITY_ACCEPTED`
- `CONSENT_ACCEPTED`
- `CONTRACT_SIGNED`

続く`CONTRACT_COMPLETED`のHashを先に固定してPDFへ記載し、PDF保存後に同じイベントをTransactionで追加します。これにより証明書記載値と契約の最終Audit Hashが一致します。

## 本人確認と同意

V1の`VerificationProvider`は`company_email_link`です。Make It Techが事前登録した会社メール宛ての256bit秘密URLを所持していることを確認手段とします。署名者によるアカウント登録はありません。

以下の4項目をすべて必須とします。

1. 署名予定者本人であること
2. 法人を代表する、または契約権限を付与されていること
3. 契約書を確認したこと
4. 内容に同意して電子的に締結すること

権限表明と同意文言は`lib/contracts/constants.ts`で一元管理し、`v1`を証跡へ保存します。

将来のJPKIは`VerificationProvider`の実装として追加します。V1ではClient IDや利用契約がないため接続処理、callback、JPKIであるかのような表示は実装しません。

## PDF仕様

- `executed.pdf`: 原本ページを変更せず、末尾へ電子契約証跡ページを追加
- `certificate.pdf`: Make It Tech独自の電子契約締結証明書
- 日本語はNoto Sans JPを埋め込み
- 契約ID、当事者、署名者、確認方式、JST締結日時、原本SHA-256、Audit最終Hashを記載
- 外部認証局・認定電子署名サービスの証明書ではない旨を明記

## セキュリティ方針

- Firestore / Storage Rulesは電子契約関連を明示的に`allow false`
- 管理操作は既存Firebase Adminセッションと`requireAdmin()`を使用
- 公開操作は署名トークンをRoute Handlerで検証
- 重要な状態・日時・署名者情報はクライアント入力を採用しない
- 同意確定はFirestore Transactionで一回だけ処理
- 公開POSTは同一Originを要求し、IP・トークンHash単位のレート制限を適用
- PDF固定名、Content-Type検査、サイズ制限、暗号化PDF拒否
- completed後に当事者、原本、締結時刻、Hashを更新するAPIは提供しない
- 公開レスポンスから内部メモ、メール全文、IP、User-Agent、トークンHashを除外
- 表示・締結・ダウンロード時にStorage実データと保存済みSHA-256を再照合
- `sign`ホストと`/sub/sign`をGoogle Analytics計測から除外し、署名URLを外部解析へ送らない
- `Cache-Control: private, no-store`と`X-Content-Type-Options: nosniff`を使用

インメモリのレート制限は単一インスタンス単位です。高トラフィックや攻撃耐性が必要になった場合は、Vercel Firewallまたは共有レート制限ストアへ移行してください。

## 運用方法

1. 管理画面の「契約管理」から新規契約とPDFを登録
2. 法人・署名予定者・原本を再確認
3. 「Make It Techとして内容を確定」で原本をロック
4. 期限を指定して署名依頼メールを送信
5. 一覧・詳細で送信、閲覧、締結状態を確認
6. 締結後は原本、締結済みPDF、締結証明書、Audit Logを確認
7. 取消・作り直しが必要な場合は旧契約をvoidにし、新しい契約を作成

必要な環境変数は既存のFirebase、Resend、管理者設定に加え、任意で`SIGN_SITE_URL`を設定します。本番未指定時は`https://sign.make-it-tech.com`、開発時は`http://localhost:3000/sub/sign`を使用します。

## V1未対応

- JPKI本番接続
- SMS、電話、顔認証、eKYC
- 手書き署名、印鑑画像
- 外部電子契約サービス、認証局、PAdES、RFC3161
- Blockchain、独自CA
- 法人番号・商業登記の自動照合
- 自由形式の契約本文生成、ブラウザ上での条文エディタ、契約バージョン編集
- WordからPDFへのサーバー変換

## 品質確認

```bash
npm run test:contracts
npm run typecheck
npm run lint
npm run build
```

Firebase・Resendを使う一連の本番相当E2Eは、有効な環境変数とテスト用Firebaseプロジェクト・メール宛先を用意した環境で実施してください。
