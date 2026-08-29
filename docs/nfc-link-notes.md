# NFCリンク 開発メモ

最終更新：2026年8月29日

事業の全体像は `make_it_tech_nfc_business_master.md` を参照。
このファイルは**コードを読んでも分からないこと**（なぜそうしたか・触るときの決まり）だけを書く。

---

## 1. 置き場所

| 場所 | 役割 |
|---|---|
| `content/nfc/site.ts` | ホスト名・Shopify URL・OG・サイトマップ対象。**設定の唯一の情報源** |
| `content/nfc/redirects.ts` | 中間URLのリンク定義（時間帯ルール等） |
| `lib/nfc-managed-links.ts` | Firestoreで管理する契約者向けリンクの取得・URL検証 |
| `content/nfc/stamp.ts` | スタンプカードの設定と文言 |
| `content/nfc/lp.ts` | LPの文言・価格 |
| `app/sub/nfc/_components/` | セクション部品 |
| `app/sub/nfc/_lib/stamp.ts` | Cookie の読み書き |
| `app/sub/nfc/nfc-theme.css` | 配色・書体・アニメーション |

**文言と価格はコードに直接書かない。** すべて `content/nfc/` に置く。

---

## 2. ルーティングの決まり（重要）

```
app/sub/nfc/
  layout.tsx        配色・書体・背景。metadataのみ。ヘッダーは持たない
  (site)/           ← ヘッダー・フッターが付く
    page.tsx        LP
    demo/           事例集
    card/           スタンプ表示
  r/[slug]/         中間URL（シェルなし）
  [slug]/            管理画面で遷移先を変えるリンク（シェルなし）
  mit-google/         初回レビュー案内・2回目以降クーポン（シェルなし）
  tap/route.ts      スタンプの入口（シェルなし）
  not-found.tsx     404（シェルなし）
```

**かざした直後に一瞬だけ表示されるページは `(site)` の外に置く。**
ヘッダー・フッターが一瞬でも見えるのは邪魔だという指摘を受けての構成。
今後の中間URLも必ず `(site)` の外に作ること。

### 本体サイトのレイアウトについて

`app/(main)/` に本体ページをまとめ、そこでのみヘッダーを付けている。
以前はルートレイアウトで適用しパス名で除外していたが、**proxy でリライトされる
サブドメインはブラウザ上のパスが `/sub/...` にならず、動的レンダリングのページで
除外が効かなかった**ため。パス判定に戻さないこと。

### ローカルとの差

本番は `nfc.make-it-tech.com/xxx`、ローカルは `localhost:3000/sub/nfc/xxx`。
リンクは `nfcHref()` を使う。リダイレクト先を作るときは Host ヘッダーで分岐する
（`tap/route.ts` が実例）。

---

## 3. 新しい中間URLを足すとき

### 管理画面で遷移先を変えるリンク

`nfcManagedLinks/{slug}` に保存した設定は `app/sub/nfc/[slug]/page.tsx` が読み込む。
最初の開発者確認用リンクは `https://nfc.make-it-tech.com/custom-test`。

- 設定画面：`/sub/admin-console/nfc-links`
- 設定変更は既存の管理者認証で保護する
- 公開URLは固定し、Firestoreの `destinationUrl` だけを変更する
- 遷移前にNFC専用のローディング画面を表示する
- 遷移先は `https://` のみ許可し、NFCサイト自身への循環は拒否する
- `organizationId` と `ownerId` は将来の契約者・組織単位の権限管理用

公開側も管理画面側も Admin SDK からFirestoreを読むため、クライアントへ
Firebaseの書き込み権限を開放しない。

### コードで条件分岐するリンク

1. `content/nfc/redirects.ts` の `nfcLinkRegistry` に追加
2. 表示を伴うなら `(site)` の外にページを作る
3. サイトマップに載せるなら `content/nfc/site.ts` の `nfcRoutes` に追記

**タグに書き込むのは最終URLではなく中間URL。** 行き先はサーバー側で決める。
これによりタグを書き換えずにリンク先を変更できる。

---

## 4. 技術的な決まりと理由

**時刻判定はサーバー側のJST固定**
端末のローカル時刻を使わない。時計がずれた端末や旅行者の端末で
店舗の意図と違う動きになるため。Vercel は UTC なのでタイムゾーンを明示する。

**アプリ起動は必ず中間URLを経由する**
iOS はバックグラウンドNFC読み取りで **HTTPS の URI レコードしか開かない**。
`chatgpt://` のようなカスタムスキームをタグに直接書いても iPhone では無反応。
中間URLを開いてからクライアント側でスキームを試し、1.6秒後に Web版へ落とす。
アプリが起動したら `visibilitychange` で移動を取り消す。

**回数の記録は Cookie をサーバー側で読み書きする**
localStorage だと判定のために一度ページを表示する必要があり、遷移画面が見えてしまう。
Cookie ならリクエストヘッダーで届くので画面を出さずに判定できる。

**`/tap` と `/card` を分けている理由**
Cookie を書けるのは Route Handler / Server Action / proxy に限られる。
加えて、分けておくと `/card` をリロードしても回数が増えない。

**Route Handler へは `<a>` を使う**
`next/link` は App Router のページ遷移用。`/tap` のような Route Handler に
`Link` を使うと壊れる。

---

## 5. 未確定・切り替えが必要なもの

| 場所 | 現状 | いつ変える |
|---|---|---|
| `site.ts` の `indexable` | `false`（noindex） | 商品写真とコピーが揃ったら `true` |
| `site.ts` の `shopUrl` | 仮URL（実在しない） | Shopify のドメイン確定後に実URLへ |
| プレート型の寸法 | 「確定前」表示 | 製造仕様が決まったら |
| 税表記・送料・納期 | 注記で逃げている | 確定したら `lp.ts` の `nfcNotes` を更新 |

---

## 6. スタンプカードはデモ用

`/tap` `/card` は**営業で見せるためのデモ**。実運用に必要な次の3つは
意図的に入れていない。実案件が決まってから足す。

- 同じ日に何度かざしても1回だけ数える（`_lib/stamp.ts` の `advanceStamp` に入れる）
- 特典の使い切り管理（現状は何度でもクーポン画面を出せる）
- Cookie の署名（改ざん検知）

商談中に1→2→3と進められないとデモにならないため、この割り切りをしている。
画面上に `/tap` を開く加算ボタンは置かない。実機のNFCタグに `/tap` を書き込み、
実際にスマートフォンをかざしたときだけ回数が増える体験にする。

### `/mit-google` の回数判定

`https://nfc.make-it-tech.com/mit-google` は、匿名の端末CookieとFirestoreの
`nfcExperiences/mit-google/devices/{deviceId}` でアクセス回数を判定する。

- 初回：Googleレビュー画面へ自動遷移
- 2回目以降：初回から1分経過していればショップ用クーポンを表示
- 2回目が1分未満：残り時間を表示し、経過後に自動でクーポンへ切り替え
- レビューを書いたかどうかは取得・判定せず、クーポン条件にも含めない
- 個人情報や端末フィンガープリントは保存しない

ページの読み込み自体では記録せず、クライアントからPOSTされたときだけ数える。
そのため、メッセージアプリのURLプレビューや検索クローラのGETでは増えない。

### 実運用で必ず問題になること

- **メッセージアプリのURLプレビュー展開やクローラが中間URLを叩き、カウントが増える。**
  回数で分岐する機能を本番に出すなら User-Agent フィルタが必須。
- Cookie は消える（データ削除・機種変更・Safari の保持期間）。高額特典には使えない。
- 店側から「誰が何回来たか」は分からない。端末に持たせているだけ。

---

## 7. デザイン

本体サイト（クリーム地・暖色・角丸）と**意図的に対極**にしている。
黒地・寒色・罫線のみ・角丸なし。ブランドトークン（`--brand-*`）は使わない。

`nfc-theme.css` のトークンは `.nfc-root` にスコープしてあるので本体に影響しない。
色を足したくなったら、まず既存の `--nfc-signal` で足りないか検討すること
（色数を増やすと安っぽくなる）。

動きは `prefers-reduced-motion` で全て止まるようにしてある。追加するときも同様に。

---

## 8. 検証について

- 変更後は `npm run typecheck` と `npx eslint app/sub/nfc content/nfc`
- **push 前に `npm run build` を必ず通す**
- `npm run dev` やブラウザ確認は、依頼されたときだけ行う
