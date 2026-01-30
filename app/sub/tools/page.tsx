"use client";

import { ImageCompressor } from "./components/image-compressor";
import { ImageConverter } from "./components/image-converter";
import { ImageResizer } from "./components/image-resizer";
import { Base64Converter } from "./components/base64-converter";
import { FaviconGenerator } from "./components/favicon-generator";
import { MarkdownPreview } from "./components/markdown-preview";
import { FileExtensionConverter } from "./components/file-extension-converter";
import { JsonToTable } from "./components/json-to-table";
import { QRGenerator } from "./components/qr-generator";

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-3xl font-bold mb-3">
          画像ツール
        </h1>
        <p className="text-neutral-400">
          画像の圧縮・変換・リサイズなど、開発に必要な画像処理をブラウザ上で実行
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          ※ すべての処理はローカルで行われます。サーバーへのアップロードはありません。
        </p>
      </section>

      {/* Tools */}
      <section id="compress">
        <ImageCompressor />
      </section>

      <section id="convert">
        <ImageConverter />
      </section>

      <section id="resize">
        <ImageResizer />
      </section>

      <section id="base64">
        <Base64Converter />
      </section>

      <section id="favicon">
        <FaviconGenerator />
      </section>

      <section id="markdown">
        <MarkdownPreview />
      </section>

      <section id="extension">
        <FileExtensionConverter />
      </section>

      <section id="json">
        <JsonToTable />
      </section>

      <section id="qr">
        <QRGenerator />
      </section>
    </div>
  );
}
