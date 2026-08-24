# ブログサムネイル制作ブリーフ（MEO/AIOシリーズ）

画像生成用のまとめ。4本とも公開済み。

## 共通仕様

- **サイズ: 1200 × 630 px**（記事ページのカバーはこの比率で描画される）
- **形式: WebP。** Vercel の画像最適化は使わない方針なので、配信するファイルそのものを
  最終寸法・最終品質で用意する。入稿は PNG / JPG でよく、`sharp` で WebP へ変換して配置する。
  カバー画像はそのまま OG画像（SNS共有時のサムネイル）になるため、
  **SVG は不可**（X・Facebook・LINE で描画されない。SVGの場合は既定のOG画像に自動で差し替わる）
- 配置先: `public/images/blog/`
- ブランド配色: 濃紺 `#1C2C34` / コーラル `#E2673D` / ティール `#2A9D91` / 生成り `#F7F3EA`
- 日本語テキストを画像に入れる場合、生成AIは崩れやすいので短い単語のみ推奨

---

## 1. 柱記事

**タイトル**: MEO対策とAIO対策の答えは、Googleレビューとサイトアクセスです

**slug**: `meo-aio-google-review`

**概要**: MEOもAIOも、対策すべきものは同じ。Googleが公式に「クチコミ数が多く評価の高いビジネスは順位が高くなる」と明言している事実を軸に、店舗が最優先で取り組むべき2つ（口コミとサイトアクセス）を提示する総論記事。

**画像に入れたい要素**: 地図ピン、星評価、スマホ画面。5本の中で最も「入口」らしい印象に。

---

## 2. AIO編

**タイトル**: AIが店を薦めるとき、何を見ているのか｜AIO対策の実際

**slug**: `ai-search-local-recommendation`

**概要**: 生成AIで店を探す人は1年で6%から45%に増加。AIはGoogleビジネスプロフィール・口コミ・自社サイトを読んで店を推薦しており、MEO対策がそのままAIO対策になることを解説する。

**画像に入れたい要素**: チャット風のUI、AIの回答吹き出し、店舗アイコン。4本の中で唯一テック寄りのトーン。

---

## 3. 口コミの集め方

**タイトル**: Googleの口コミを増やす、違反にならない方法

**slug**: `how-to-get-google-reviews`

**概要**: 割引や特典と引き換えの口コミ依頼はGoogleのポリシー違反。禁止事項を確認したうえで、依頼のタイミング、違反にならない言い方、NFC・QRで導線を短くする方法を解説する。

**画像に入れたい要素**: レジ横のスタンド、スマホをかざす手、チェックマークと禁止マークの対比。

---

## 4. サイトアクセス

**タイトル**: サイトへのアクセスを増やすことが、そのままMEO対策になる

**slug**: `site-access-meo`

**概要**: Googleビジネスプロフィールだけでは足りない。プロフィールからのクリックや経路検索といった行動も評価対象であり、店内の接点（レジ横・卓上・入口・カード）をWebの入口に変える導線設計を解説する。

**画像に入れたい要素**: 店舗からWebへの流れ、QR/NFC、矢印。

---

## 現在のカバー画像（差し替え済み）

命名規則は `<slug>-cover.webp`。すべて 1200×630 / WebP q82。

| slug | カバー |
| --- | --- |
| `meo-aio-google-review` | `meo-aio-google-review-cover.webp` |
| `ai-search-local-recommendation` | `ai-search-local-recommendation-cover.webp` |
| `how-to-get-google-reviews` | `how-to-get-google-reviews-cover.webp` |
| `site-access-meo` | `site-access-meo-cover.webp` |
| `what-is-dx` | `what-is-dx-cover.webp` |
| `cms-partial-update-website` | `cms-partial-update-website-cover.webp` |
| `why-i-started` | `why-i-started-cover.webp` |

新しい記事を追加するときも同じ手順で、`public/images/blog/` に WebP を置いてから
`coverImage.url` を設定する。差し替え後は admin-console の「最新に更新」を押すこと。
