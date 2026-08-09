# DevTools サブドメイン概要

## 概要

`/sub/tools` 配下で提供する無料オンライン開発ツール群。
すべての処理はブラウザ内で完結し、サーバーへのデータ送信は行わない。

## ツール一覧

| ツール | パス | 機能 |
|--------|------|------|
| 画像圧縮 | `/compress` | JPG/PNG/WebP/GIF の品質・サイズ調整圧縮 |
| フォーマット変換 | `/convert` | 画像を JPEG/PNG/WebP に変換 |
| リサイズ | `/resize` | 指定サイズへのリサイズ（プリセット対応） |
| Base64変換 | `/base64` | 画像 ↔ Base64 の相互変換 |
| Favicon生成 | `/favicon` | 各種サイズの favicon を一括生成 |
| Markdownプレビュー | `/markdown` | GFM対応リアルタイムプレビュー |
| 拡張子変換 | `/extension` | テキストファイルの拡張子変更 |
| JSON変換 | `/json` | JSON ↔ CSV/Excel の相互変換 |
| QRコード生成 | `/qr` | URL/テキストからQRコード生成 |

## ディレクトリ構成

```
app/sub/tools/
├── layout.tsx              # メタデータ定義（サーバーコンポーネント）
├── page.tsx                # ツール一覧ページ
├── components/
│   ├── tools-shell.tsx     # 共通レイアウト（ヘッダー/フッター/ナビ）
│   ├── cookie-consent.tsx  # Cookie同意モーダル
│   ├── image-history.tsx   # 履歴表示UI
│   ├── image-compressor.tsx
│   ├── image-converter.tsx
│   ├── image-resizer.tsx
│   ├── base64-converter.tsx
│   ├── favicon-generator.tsx
│   ├── markdown-preview.tsx
│   ├── file-extension-converter.tsx
│   ├── json-to-table.tsx
│   └── qr-generator.tsx
├── hooks/
│   ├── use-image-history.ts  # 画像履歴管理（24時間保持）
│   └── use-text-history.ts   # テキスト履歴管理（24時間保持）
└── [tool]/page.tsx         # 各ツールのルートページ
```

## 主要機能

### 履歴管理
- localStorage を使用したローカル履歴
- 24時間経過で自動削除
- Cookie同意が必要（機能性Cookie）

### 画像ツール共通仕様
- ファイル選択後、設定調整 → 開始ボタンで処理
- 複数ファイル一括処理対応
- ZIP形式での一括ダウンロード

### プライバシー
- 全処理がブラウザ内完結
- ヘッダーに「ローカル処理」バッジ表示
- フッターにプライバシー説明

## 技術スタック

- Next.js App Router
- browser-image-compression（画像圧縮）
- xlsx（Excel/CSV変換）
- qrcode（QRコード生成）
- react-markdown + remark-gfm（Markdownプレビュー）
- JSZip（ZIP生成）
