# Mobile Responsive UI Prompt

このドキュメントは、デジシフのモバイルレスポンシブ修正を他のエージェントへ依頼する際に使うための指示プロンプトです。特に「スマホアプリのような密度感」「縦に長くなりすぎないUI」を再現することを目的とします。

## Copy Prompt

あなたはデジシフのUIを改善するフロントエンドエンジニアです。対象ページまたは対象コンポーネントのモバイルレスポンシブを、一般的なWebページではなく「スマホアプリの画面」の密度感に近づけてください。

以下の方針を必ず守ってください。

- モバイルでは余白を大きく取りすぎない。`p-4` や `gap-4` を安易に使わず、基本は `p-2`〜`p-3`、`gap-1.5`〜`gap-2` を優先する。
- 文字サイズはモバイルで小さめにする。補足文は `text-[10px]`〜`text-[11px]`、ラベルは `text-[9px]`〜`text-[10px]`、本文は `text-xs` を基準にする。
- 見出しもモバイルでは圧縮する。大見出しは `text-2xl` 程度、カード見出しは `text-sm`〜`text-base` 程度を基準にする。
- カードの角丸・影・余白をPCと同じ大きさにしない。モバイルは `rounded-xl`〜`rounded-2xl`、PCは `sm:rounded-[2rem]` などで広げる。
- モバイルで縦積みが続きすぎる場合は、内容を2列化できないか検討する。料金カード・小型ステータス・設定項目などは `grid-cols-2` を積極的に使う。
- PCの情報量をそのままモバイルに持ち込まない。説明文は短くし、詳細説明はヘルプページや補足リンクに逃がす。
- CTAボタンはモバイルで `h-9` 程度に抑える。横幅いっぱいにする場合も、上下余白を増やしすぎない。
- アイコンはモバイルで `size-3.5`〜`size-4` を基準にし、PCのみ `sm:size-5` 以上へ拡大する。
- 背景装飾やアニメーションは残してよいが、モバイルで視認性や高さを邪魔しないようにサイズを落とす。
- `sm:` 以上でPC/タブレット向けに余白・文字・カードサイズを戻す。モバイル基準で書き、`sm:` 以降で拡張する。

品質基準:

- スマホで1画面あたりの情報量が少なすぎないこと。
- スクロール量が不要に増えていないこと。
- タップ領域は確保しつつ、ボタンやカードが大きすぎないこと。
- 重要な操作・料金・状態が小さくなりすぎず、視線移動で理解できること。
- PC表示の見栄えを壊さないこと。

実装後は、対象ファイルを確認し、必要なら `npx tsc --noEmit` で型チェックしてください。小さなCSS調整のみの場合はビルドまでは不要です。

## Reference Values

| 用途 | Mobile | Desktop |
| --- | --- | --- |
| セクション余白 | 〜`py-8` | `sm:py-16`〜`sm:py-20` |
| コンテナ横余白 | `px-4` | `sm:px-8` |
| カード余白 | `p-1.5`〜`p-3` | `sm:p-5`〜`sm:p-6` |
| カード間隔 | ～`gap-1.5` | `sm:gap-4`〜`sm:gap-6` |
| 補足テキスト | `text-[10px]`〜`text-[11px]` | `sm:text-sm` |
| 本文 | `text-xs` | `sm:text-sm`〜`sm:text-base` |
| 小見出し | `text-sm`〜`text-base` | `sm:text-xl`〜`sm:text-2xl` |
| CTA高さ | `h-9`〜`h-10` | `sm:h-11`〜`sm:h-12` |
| アイコン | `size-3.5`〜`size-4` | `sm:size-5`〜`sm:size-6` |

## Bad Patterns

- モバイルでカードがすべて1列になり、1画面に1〜2項目しか表示されない。
- `p-6`、`gap-6`、`text-lg` をモバイルに直接使う。
- PC用の説明文をそのままスマホにも表示し、スクロール量が増える。
- ボタンやトグルがモバイルアプリの設定画面としては大きすぎる。
- 背景グラデーションや装飾が主張しすぎて、コンテンツが狭くなる。

## Preferred Pattern

モバイルを先に最適化し、PCは `sm:` / `lg:` で拡張してください。

```tsx
<section className="py-8 sm:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-8">
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
      <article className="rounded-2xl p-2 shadow-lg sm:rounded-4xl sm:p-5">
        <p className="text-[9px] font-black sm:text-xs">LABEL</p>
        <h3 className="mt-1 text-sm font-bold sm:text-xl">タイトル</h3>
        <p className="mt-1 text-[10px] leading-4 text-slate-600 sm:text-sm sm:leading-6">
          補足説明
        </p>
      </article>
    </div>
  </div>
</section>
```
