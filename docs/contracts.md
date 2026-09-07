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

## Wordテンプレート共通

管理画面の新規契約ページでは、認証済み管理者が登録済みテンプレートを選び、そのテンプレート固有の空欄へ入力します。V1では`nda-standard-v1`、`data-handling-addendum-standard-v1`、`fde-master-standard-v1`を選択できます。サーバーは入力済みWordを生成して非公開のGotenbergへ渡し、確認用PDFをブラウザへ返します。空のWordは配布しません。テンプレートは公開ディレクトリへ置かず、Route HandlerがファイルのSHA-256を検証してから読み込みます。

V1ではWordファイル自体を原本登録または署名対象にしません。次の手順で使用します。

## NDA Wordテンプレート

1. 契約テンプレート一覧から「秘密保持契約書 NDA 標準テンプレート」を選ぶ
2. 契約先の法人名、所在地、代表者の役職・氏名、契約発効日を入力
3. 必要に応じて契約目的、契約期間、終了通知期限、自動更新期間、秘密保持義務の存続期間を入力
4. 紙契約用の締結文言と押印欄を電子締結用へ置き換えることを確認し、確認用PDFを生成
5. 内容確認画面でPDF全文、当事者情報、契約条件を確認
6. 確認したPDFをそのまま原本登録
7. 契約詳細画面で管理情報とPDF内の当事者・署名者情報が一致していることを確認して原本ロック

自動生成時は、甲の名称、所在地、法人名・商号、代表者、契約発効日を差し込みます。任意の契約目的は第1条へ、各期間条件は第15条へ反映します。また、末尾の「本書2通・記名押印」の文言を電磁的記録による締結・保管の文言へ置き換え、甲乙の「印」欄を削除します。この置き換えは管理画面の確認チェックを必須とします。

生成したWordと登録前の確認用PDFはサーバーへ保存しません。PDF登録時にはテンプレートID、版、テンプレート原本SHA-256を契約とAudit Logへ保存します。署名対象として固定されるのは内容確認後に登録したPDFのSHA-256です。必要な場合は、確認画面から同じ入力内容のWordも補助ファイルとしてダウンロードできます。

## 個人情報・データ取扱特約 Wordテンプレート

`data-handling-addendum-standard-v1`では、甲の法人名、所在地、代表者の役職・氏名、契約発効日を必須入力としてWordへ反映します。別紙の次のデータ条件も、契約条件を確定するためすべて必須入力です。

- 対象データ、利用目的・処理内容、対象者
- 要配慮個人情報、特定個人情報
- 利用システム、保存場所・地域、保存期間、アクセス権限
- 再委託先、第三者サービス、国外利用
- 事故時の連絡、終了時の取扱い、追加セキュリティ要件、特記事項

該当しない項目も「なし」「対象外」「特段の定めなし」など、契約条件として意味のある値を入力します。別紙の編集用見出し・案内文と全項目の記入例は生成時に除去され、確定値へ置き換わります。末尾の紙契約用締結文言と押印欄は、管理画面での確認を必須にした上で電子締結用へ置き換えます。生成後は管理者がPDF内容確認画面で本文と別紙を最終確認して原本登録します。

保存期間、アクセス範囲、事故報告、終了時の返却・削除、追加セキュリティ要件、特記事項には変更可能な標準初期値を表示します。対象データ、利用目的、対象者、要配慮・特定個人情報、利用システム、保存地域、再委託先、第三者サービス、国外利用は案件の事実に依存するため自動入力しません。

## FDE業務委託基本契約 Wordテンプレート

`fde-master-standard-v1`では、甲の法人名、所在地、代表者の役職・氏名、契約発効日に加え、原本で空欄になっている次の契約条件を必須入力としてWordへ反映します。

- 遅延損害金率、秘密保持義務の存続期間
- 業務停止の対象となる支払遅延日数、契約違反の是正期間
- 契約終了後の引渡し期限、データ削除期限
- 基本契約の有効期間、自動更新の通知期限と更新期間、任意解約の通知期限
- 専属的合意管轄となる地方裁判所・簡易裁判所の地域名

数値欄は、遅延損害金14.6%、秘密保持5年、支払遅延30日、是正14日、引渡し30日、データ削除30日、契約期間1年、更新停止通知30日前、自動更新1年、任意解約通知30日前を初期値として表示します。いずれも入力画面で案件ごとに変更できます。管轄地域は当事者や所在地により決めるため、自動入力しません。

委託料、業務内容、納期その他の案件固有条件は基本契約へ挿入せず、個別契約で定める運用を維持します。末尾の紙契約用締結文言と押印欄は、管理画面での確認を必須にした上で電子締結用へ置き換えます。

## データ構造

### `contracts/{contractId}`

主なフィールド:

- `contractNumber`: `MIT-C-YYYY-00001`形式の管理番号
- `title`, `type`, `internalMemo`
- `status`: 状態
- `company`: 法人名、法人番号、所在地
- `signer`: 氏名、役職、メールアドレス
- `verificationMethod`: V1は`company_email_link`
- `effectiveDate`: 契約書に記載する契約発効日。電子署名・締結完了日時とは別管理
- `document`: 原本のversion、Storageパス、SHA-256、サイズ、ページ数、原ファイル名、ロック日時
- `acceptance`: 本人・権限・内容確認・同意、文言バージョン、確認方法、接続証跡
- `executedDocument`, `certificateDocument`: 生成物のStorageパスとSHA-256
- `documentAccessTokenHash`, `documentAccessExpiresAt`: 締結書類取得専用トークンのHashと期限
- `auditLastHash`, `auditSequence`: Auditチェーン末尾
- `signedAt`, `completedAt`: システムが記録する実際の電子署名日時・電子締結完了日時
- その他の各種UTC Timestamp

### `contracts/{contractId}/events/{eventId}`

append-onlyのAudit Logです。`sequence`、`eventType`、`occurredAt`、`actorType`、匿名化した`actorId`、IP、User-Agent、requestId、metadata、`previousHash`、`eventHash`を保存します。

### `contractTokens/{tokenHash}`

署名URLまたは書類取得URLのトークンSHA-256をドキュメントIDとして利用します。平文トークンは保存しません。契約ID、用途（`signing` / `documents`）、状態、作成日時、有効期限、使用・失効日時を保持します。旧データで用途がないトークンは署名用として扱います。

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
  （終端状態）
```

`signed`はPDF生成中または生成再開待ちの中間状態です。障害時は同じ署名URLから再実行でき、原本・同意・時刻・Audit Hashは変更されません。

## Token仕様

- Node.js `crypto.randomBytes(32)`による256bit乱数
- URLはbase64url形式
- DBにはSHA-256のみ保存
- 既定期限48時間（2日）、管理画面で1～30日を指定可能
- 締結時にTransaction内で`used`へ変更
- 締結完了時に署名トークンを`consumed`へ変更し、以後の画面表示・PDF取得には利用しない
- 締結完了時に別の256bit書類取得トークンを発行し、締結完了メールと完了画面だけへ返す
- 書類取得トークンは発行から7日間だけ有効で、締結済みPDFと締結証明書だけを取得可能
- 管理画面から失効時は`revoked`
- 期限切れは署名ページ表示時に`expired`としてAudit記録
- 使用済みトークンは再締結に利用できない
- 期限後の書類再取得は管理者へ依頼し、管理画面から提供する

URLは機密情報として扱います。署名URLの平文は発行直後の管理画面に一度だけ表示し、署名者へメール送信します。DBへ保存せず、アプリケーションログへも出力しません。

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
- completedは終端状態とし、voidへの変更も禁止する
- 公開レスポンスから内部メモ、メール全文、IP、User-Agent、トークンHashを除外
- 表示・締結・ダウンロード時にStorage実データと保存済みSHA-256を再照合
- `sign`ホストと`/sub/sign`をGoogle Analytics計測から除外し、署名URLを外部解析へ送らない
- `Cache-Control: private, no-store`と`X-Content-Type-Options: nosniff`を使用
- signサイトとトークン付きAPIへ`Referrer-Policy: no-referrer`を設定

インメモリのレート制限は単一インスタンス単位です。高トラフィックや攻撃耐性が必要になった場合は、Vercel Firewallまたは共有レート制限ストアへ移行してください。

## 運用方法

1. 管理画面の「契約管理」からテンプレートを選び、法人・署名予定者・契約条件を入力
2. 「PDFにして内容確認へ」で自動変換し、確認画面で全文を確認して原本登録
3. 契約詳細画面で法人・署名予定者・原本を再確認し、「Make It Techとして内容を確定」で原本をロック
4. 期限を指定し、「署名URLを発行してメール送信」を実行。発行直後だけ表示されるURLは必要に応じてコピー
5. 一覧・詳細で送信、閲覧、締結状態を確認
6. 締結後は原本、締結済みPDF、締結証明書、Audit Logを確認
7. 締結前に取消・作り直しが必要な場合は旧契約をvoidにし、新しい契約を作成。締結済み契約はvoidへ変更しない

Windowsローカル環境では、`CONTRACT_PDF_CONVERTER_URL`が未指定の場合、PCへインストール済みのMicrosoft Wordを非表示で起動してPDFへ変換します。Dockerや追加の変換サービスは不要です。Windows以外の本番環境では、`CONTRACT_PDF_CONVERTER_URL`へ非公開GotenbergのベースURLを設定します。認証プロキシを利用する場合は`CONTRACT_PDF_CONVERTER_BEARER_TOKEN`も設定します。契約書が第三者へ送られないよう、公開デモや共有変換APIは使用しません。`SIGN_SITE_URL`は任意で、本番未指定時は`https://sign.make-it-tech.com`、開発時は`http://localhost:3000/sub/sign`を使用します。

## V1未対応

- JPKI本番接続
- SMS、電話、顔認証、eKYC
- 手書き署名、印鑑画像
- 外部電子契約サービス、認証局、PAdES、RFC3161
- Blockchain、独自CA
- 法人番号・商業登記の自動照合
- 自由形式の契約本文生成、ブラウザ上での条文エディタ、契約バージョン編集

## 品質確認

Wordテンプレート本体またはWord生成ロジックを追加・変更した場合だけ、契約書テストを実行します。

```bash
npm run test:contracts
```

通常のコード変更では次を実行します。

```bash
npm run typecheck
npm run lint
npm run build
```

Firebase・Resendを使う一連の本番相当E2Eは、有効な環境変数とテスト用Firebaseプロジェクト・メール宛先を用意した環境で実施してください。
