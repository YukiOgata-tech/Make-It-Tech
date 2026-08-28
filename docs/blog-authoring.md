# ブログ記事の入稿フォーマット

外部で書いた記事を zip で渡せば、そのまま公開できるようにするための取り決め。
受け取り側は `scripts/publish-article.mjs` が処理する。

## 全体の流れ

1. 外部のAIなどで記事（Markdown）と画像を作る
2. 下の構成で zip にまとめる
3. zip を渡す（保存先のパスを伝えれば読み込める）
4. こちらで検証 → 画像をWebPに正規化 → Firestore へ登録
5. 画像をコミットしてプッシュ → デプロイ後に再検証

記事の本文は Firestore の `blogPosts` にあり、画像だけが `public/images/blog/` に置かれる。
この二重管理を吸収するのがスクリプトの役目なので、渡す側は相対パスだけ意識すればよい。

## zip の中身

```
article.md          メタ情報＋本文（ファイル名は何でもよい。.md が1つあればよい）
images/
  cover.png         カバー画像（サイズ自由。1200x630 に自動で切り出す）
  scope.svg         本文中の図解
  photo.jpg         本文中の写真
```

zip の中でフォルダが1階層深くなっていても構わない（自動で外す）。

## article.md の書式

先頭に `---` で囲んだメタ情報を置き、その後に本文を書く。

```markdown
---
title: 補助金でホームページは作れる？使える補助金と、通らないケース
slug: subsidy-website
category: subsidy
tags: 補助金, 小規模事業者持続化補助金, ホームページ制作, Web制作
summary: ホームページ制作に補助金を使えるか迷う小規模事業者向けに、使い方と通らない理由を整理します。第20回の締切と、申請前に決めておくべきことも解説します。
cover: images/cover.png
coverAlt: 補助金でホームページは作れるのかを解説する記事のカバー画像
status: published
---

## 最初のH2から本文が始まる

本文…
```

| キー | 必須 | 決まり |
| --- | --- | --- |
| `title` | ○ | ページの `<h1>` になる。本文に同じ見出しを書かない |
| `slug` | ○ | 英小文字・数字・ハイフンのみ。URL は `/blog/<slug>`。**後から変えるとリンクが切れる** |
| `category` | ○ | `improvement` / `automation` / `web` / `subsidy` / `case` / `other` のいずれか |
| `tags` | ○ | カンマ区切り。**既存記事と重なるタグを最低1つ入れる**（後述） |
| `summary` | ○ | **80〜160字**。meta description になる |
| `cover` | ○ | zip 内の相対パス |
| `coverAlt` | ○ | 140字以内 |
| `status` | | `published`（既定）か `draft` |

## 本文のルール

- **`#`（H1）を使わない。** ページ側が `<h1>` を出すので二重になる
- **`##`（H2）を2つ以上置く。** 2つ未満だと目次が出ない
- **段落は必ず空行で区切る。** 単一改行は `<br>` になる
- 画像は zip 内の相対パスで書く
  `![説明](images/scope.svg "preset:full-center")`
  プリセットは `full-center` / `md-right` / `sm-left` など（`lib/markdown-image.ts` に8種）
- 他の記事へのリンクは `[記事タイトル](/blog/<slug>)`。**存在しない slug を書くとエラーで止まる**
- サイト内の他ページは `/services` `/works` `/contact` など
- 外部リンクは自動で別タブになる
- 表・コードブロック・引用はそのまま使える（GFM）

### タグを重ねる理由

記事下部の「あわせて読みたい」は、タグ一致 → カテゴリ一致 → 新着順で選ばれる
（`lib/blog-related.ts`）。既存記事と重なるタグが1つも無いと、内容に関係なく
新着3本で埋まる。1つでも重ねておけば、意図した記事が関連に並ぶ。

## 画像のルール

| 種類 | 形式 | 備考 |
| --- | --- | --- |
| カバー | PNG / JPG / WebP なんでも | **1200x630 に自動で切り出す**ので、その比率で作ると切れない |
| 図解 | **SVG 推奨** | ベクターのまま配信する。拡大に強く、変換もかからない |
| 写真 | PNG / JPG / WebP | 幅1600pxを上限に縮小して WebP 化（拡大はしない） |

- 変換後のファイル名は `<slug>-<元の名前>.webp` になる（カバーは `<slug>-cover.webp`）
- カバーはそのまま OGP 画像になる。**SVG をカバーにしない**（SNSで表示されない）
- 制度の金額や年度など、**変わりやすい数値を画像に焼き込まない**。差し替えが必要になる

## 実行

```bash
node scripts/publish-article.mjs <zipかフォルダのパス> --dry-run   # 検証だけ
node scripts/publish-article.mjs <zipかフォルダのパス>             # 登録
node scripts/publish-article.mjs <zipかフォルダのパス> --update    # 既存記事の上書き
```

検証で止まる項目（ここを直せば通る）:

- summary の字数、H1 の有無、H2 の数
- category / slug の書式、slug の重複
- 同梱されていない画像を本文が参照している
- 存在しない記事への内部リンク

警告だけで止まらない項目: 使われていない画像、タグの重なりが無いこと。

## 自動化できないこと

スクリプトは**書式しか見ない**。次はこちらで確認する。

- **事実の裏取り。** 制度の要件・金額・日付・統計は、外部AIが平気で古い値を書く。
  実際に2026年の持続化補助金は「ウェブ関連費は交付申請額の1/4まで」というルールが
  廃止されていて、記憶だけで書くと間違える。公式（中小企業庁・各事務局）で取り直す
- 文体が既存記事とそろっているか
- 内部リンクの置き場所が自然か、CTA が記事の流れに合っているか
- カバー画像の日本語が崩れていないか

## 外部AIに渡すプロンプト

```
新潟県の中小事業者・個人事業主向けDX支援サイト「Make It Tech」のブログ記事を書いてください。

【テーマ】（ここに書く）

【形式】
先頭に --- で囲んだメタ情報、その後に本文のMarkdown。

---
title: （30〜45字程度。検索されうる言葉を前half に入れる）
slug: （英小文字とハイフン）
category: （improvement / automation / web / subsidy / case / other から1つ）
tags: （5〜7個、カンマ区切り）
summary: （80〜160字。記事の要点。定型句を使わない）
cover: images/cover.png
coverAlt: （140字以内）
status: published
---

【本文のルール】
- 見出しは ## から始める。# は使わない
- ## を5個以上、必要なら ### を添える
- 段落は必ず空行で区切る。単一改行は使わない
- ですます調。ただし言い切る。「〜かもしれません」で逃げない
- 3500〜5500字
- 数値や制度を書くときは出典を明記し、いつ時点の情報かを本文末に書く
- 読者は新潟県の小規模事業者。専門用語は初出で言い換える
- 最後に相談導線として /contact と /services へのリンクを置く

【図解】
本文中に入れたい図解があれば ![説明](images/〇〇.svg "preset:full-center") と書き、
その図が何を示すかを記事の最後に「## 図解の指示」として箇条書きで添えてください。
```


# 既存の記事
- /blog/subsidy-website
  補助金でホームページは作れる？使える補助金と、通らないケース
  category: subsidy / tags: 補助金, 小規模事業者持続化補助金, デジタル化・AI導入補助金, ホームページ制作, Web制作, 販路開拓, 新潟
- /blog/meo-aio-google-review
  MEO対策とAIO対策の答えは、Googleレビューとサイトアクセスです
  category: improvement / tags: MEO, AIO, Googleレビュー, ローカルSEO, 店舗集客, 口コミ
- /blog/ai-search-local-recommendation
  AIが店を薦めるとき、何を見ているのか｜AIO対策の実際
  category: web / tags: AIO, AI検索, ChatGPT, Gemini, AI Overviews, LLMO, 店舗集客
- /blog/how-to-get-google-reviews
  Googleの口コミを増やす、違反にならない方法
  category: improvement / tags: Googleレビュー, 口コミ, 店舗運営, NFC, QRコード, Googleビジネスプロフィール
- /blog/site-access-meo
  サイトへのアクセスを増やすことが、そのままMEO対策になる
  category: web / tags: MEO, Webサイト, 導線設計, 店舗集客, アクセス解析, NFC
- /blog/what-is-dx
  DXとは？意味やIT化との違いをわかりやすく解説
  category: improvement / tags: DX, デジタルトランスフォーメーション, IT化, 業務改善, 中小企業
- /blog/cms-partial-update-website
  ホームページは必要？自分で更新できるCMS型サイトという選択肢
  category: web / tags: CMS, Web制作, ホームページ更新, WordPress, 店舗サイト, SEO
- /blog/why-i-started
  自己紹介と現代ITとの向き合い方について
  category: other / tags: DX, IT, WEB, LP, プログラミング