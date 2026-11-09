# 受注・決済リンク

管理画面の「顧客対応 → 受注・決済リンク」(`/sub/admin-console/payment-links`) で利用します。
既存のSupabase `site_documents` とそのサーバー専用アダプターを使うため、新しいDBマイグレーションは不要です。

## 設定と検証

まず専用のStripe sandboxで設定します。ローカルの `.env.local`、Vercelではサーバー専用のSensitive環境変数に次を設定してください。キーはチャットやリポジトリへ貼り付けません。

```dotenv
STRIPE_MODE=test
STRIPE_SECRET_KEY_TEST=
STRIPE_SECRET_KEY_LIVE=
STRIPE_WEBHOOK_SECRET_TEST=
STRIPE_WEBHOOK_SECRET_LIVE=
PAYMENT_SITE_URL=http://localhost:3000
```

- `STRIPE_SECRET_KEY_TEST` / `STRIPE_SECRET_KEY_LIVE`: sandbox用の `rk_test_…` と本番用の `rk_live_…` を設定します。Productsの読み取り、PricesとPayment Linksの書き込み、Checkout Sessionsの読み取り・書き込みが必要です。環境ごとに別のキーを使い、同じsandboxに共通商品を登録してください。権限不足はStripeリクエストログで確認します。
- `STRIPE_MODE`: `test` / `live`。未設定時は `VERCEL_ENV=production` のみlive、それ以外（Preview・ローカル・ローカルの本番ビルド）はtestです。本番Vercelでは未設定またはliveにし、上記ローカル例のtestを流用しないでください。選択モードと異なるAPIキーは拒否し、別モードの注文の発行済みリンクは操作しません。
- `STRIPE_WEBHOOK_SECRET_TEST` / `STRIPE_WEBHOOK_SECRET_LIVE`: `/api/stripe/webhook` の署名シークレット（`whsec_…`）。APIキーとは別の値です。テスト/本番それぞれの送信先の値を設定し、署名とイベントのモードを確認します。`whsec_` の文字列からモードは判定できません。
- 旧構成の `STRIPE_SECRET_KEY` は選択モードとキーの接頭辞が一致する場合のみ利用できます。`STRIPE_WEBHOOK_SECRET` はTEST/LIVE別のAPIキーが一つもない旧構成に限り利用します。新構成ではWebhookもTEST/LIVE別名で設定してください。
- `PAYMENT_SITE_URL`: 顧客へ渡すブランドページのオリジン。本番は `https://make-it-tech.com`。Stripeの独自ドメインをここに設定しないでください。
- 既存のSupabase環境変数も必要です。キーなしでも管理者による下書き保存・編集・削除は利用できます。

Webhookの対象イベントは `checkout.session.completed`、`checkout.session.async_payment_succeeded`、`checkout.session.async_payment_failed` です。本番稼働前に必ず登録します。Stripe CLIによるローカル転送例:

```sh
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

CLIが表示したテスト環境のローカル転送用署名シークレットを `.env.local` の `STRIPE_WEBHOOK_SECRET_TEST` に設定し、開発サーバーを再起動します。本番WebhookにはStripe Dashboardの当該エンドポイントのシークレットを `STRIPE_WEBHOOK_SECRET_LIVE` に設定します。

検証手順:

1. `npm run dev` で起動し、管理画面へログインする。
2. 注文を登録する。Shopify商品ID・variant ID・見積日・見積時EC単価と保存済み価格証跡URLを入力する。価格は固定マスタとして保存せず、注文時点の記録として扱う。既存Stripe商品は「Stripeの既存商品を取得」で選ぶかProduct IDを入力する。
3. 商品、仕様、承認金額、送料・制作費、取引条件を確認して下書きを保存する。下書きは編集でき、MIT注文IDは重複登録できない。削除後も同じ注文IDは再利用しない。
4. テスト環境で発行し、顧客用URLを開く。Stripeで表示する商品名・画像は選択した既存Productの内容なので、顧客向け明細と一致することも確認する。
5. Stripeの公式テスト決済手段で支払い、Webhook受信後に「入金済み」となること、顧客ページで再決済できないことを確認する。sandboxの決済は通常の売上へ転記しない。本番連携については運用開始時に実際の注文で売上下書きへの転記と照合を確認する。
6. 同一Webhookを再送して状態が重複更新されないこと、順序を逆にしても入金済みから戻らないことを確認する。未処理時は500を返しStripeの再送を受ける。
7. 別のテスト注文を発行し、Stripe決済画面を開いたまま管理画面で削除する。顧客ページ、Stripeリンク、未完了セッションが使えなくなることを確認する。
8. 入金照合ボタンでStripe上の完了セッションを再取得できることを確認する。遅延決済の成功・失敗もテストする。

資料に記載されているデモURLは本番の有効なリンクです。検証には使いません。

## 発行・停止と記録

- 共通Productを使い、`price_data.product` で注文ごとの価格を設定します。Productは新規作成しません。JPYの整数金額で、数量固定・完了回数1回のリンクです。
- 税込の承認請求総額をそのまま請求します。Stripe Taxは無効、追加送料・クーポン・数量変更は設定しません。送料や制作費を含む請求単価を管理者が確認します。税額計算・適格請求書の生成機能ではありません。
- 発行後は注文内容を固定します。訂正する場合はリンクを停止・削除し、別注文IDで再登録します。
- 発行には注文IDに基づく冪等性キーとDB上の処理ロックを使用します。通信障害時は同じ注文から再試行します。Stripeの冪等性キー保存期間を越えて再発行しないよう、23時間後は発行を拒否します。「Stripe上の発行結果を照合」で既存リンクを探して保存結果を復旧できます。リンクが見つからないまま23時間を越えた場合はStripeログで未作成を確認し、運用担当が記録を調査してください。処理中のリンクを無確認で再登録しないでください。
- 「削除」はStripeリンクの無効化、未完了Checkout Sessionの終了、顧客用URLの停止、通常一覧からの除外です。途中で失敗した場合は停止処理中として残り、再試行できます。取引記録は保存し、返金は行いません。削除と同時に成立した決済や遅延決済はWebhook・入金照合で記録します。
- 決済状態は署名検証済みWebhookまたは認証済みのStripe照合だけで更新します。完了ページへ戻ったことを入金証明にしません。注文・リンク・通貨・金額・テスト/本番モードを照合します。
- `paymentOrders`、`paymentOrderNumbers`、`paymentOrderTokens`、`paymentWebhookEvents` コレクションを使用します。管理者は自分の `entityId` の注文だけを操作できます。公開ページは256bitランダムトークンを用い、内部顧客名・営業担当・証跡URL・管理メモは公開しません。
- 本番の入金を確認すると、既存の「売上・入金」へ売上下書きを自動作成します。顧客名・タイトル・税込総額・商品明細・MIT注文ID・入金確認日時・Payment Link/Session/PaymentIntent IDを残し、注文一覧の「売上記録を開く」から移動できます。売上計上日・税額は自動確定しません。テスト決済は通常の売上へ転記しません。
- 売上IDは事業体と内部注文IDから決定し、主キーの一意制約で二重作成を防ぎます。通信障害や売上保存後の注文更新失敗でも、同じ注文から再送・入金照合すると復旧します。既存売上の編集内容は上書きしません。転記失敗は注文に表示し、Webhookは500を返して再送を受けます。Supabaseのサーバー専用サービスロールで既存の `public.mit_sales_records` ビューへINSERT/SELECTします。
- 入金証跡は注文と売上メモに保存します。既存の経理入金テーブルは「計上済み」の売上だけに登録できるため、この段階では入金行を追加しません。計上日と内容を確認して売上を確定した後、必要に応じて経理の入金行を登録してください。Stripeでの決済額は手数料差引後の銀行振込額とは異なります。
- Shopifyや手入力で既に登録した売上との自動照合は行いません。同じ取引を別経路で重ねて登録しないでください。報酬式、返金、製造・発送、プラグイン等で別途発行したリンクの自動取り込みは対象外です。

## ブランド表示

案内URLは `https://make-it-tech.com/pay/{推測困難なトークン}` です。Make It Techロゴ、注文タイトル、公開説明、商品明細、税込総額を表示し、Stripeへ進みます。決済後も同じブランドページへ戻ります。顧客ページはnoindex・no-referrerとし、GAとチャットウィジェットを読み込みません。

Stripeの決済画面自体には、Dashboard → Brandingでロゴ・アイコン・ブランド色を設定してください。既存アカウント設定を継承し、アプリから共通設定を変更しません。商品画像は共通Productで管理します。さらにURLも統一する場合はStripeのカスタムドメインを契約・設定できます。これはStripe側でのDNS設定と有料オプションの確認が必要です。

参考: [Payment Linksのカスタマイズ](https://docs.stripe.com/payment-links/customize)、[ブランド設定](https://docs.stripe.com/payments/checkout/customization/appearance)、[カスタムドメイン](https://docs.stripe.com/payments/checkout/custom-domains)。

## 自動検査

`npm run typecheck`、`npm run lint`、`npm run build`。
Stripeへの接続・DB書き込みを含む実環境検証はキー設定後に上記手順で行います。
