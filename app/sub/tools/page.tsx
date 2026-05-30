import Link from "next/link";
import type { Metadata } from "next";
import { getToolHref, toolCategories, tools, toolsBaseUrl } from "./_data/tools";

export const metadata: Metadata = {
  title: "無料オンライン開発ツール集",
  description:
    "画像圧縮、画像変換、PDF圧縮、PDF結合、PDF分割、PDF並び替え、Base64変換、JSON変換、QRコード生成などを無料で使えるオンラインツール集。多くの処理はブラウザ内で完結します。",
  alternates: {
    canonical: toolsBaseUrl,
  },
  openGraph: {
    title: "無料オンライン開発ツール集 | DevTools",
    description:
      "画像・PDF・テキスト・データ変換に使える無料ツール集。日々の制作、資料作成、開発作業をブラウザで手早く処理できます。",
    url: toolsBaseUrl,
    type: "website",
  },
};

const categoryDescriptions = {
  image:
    "Webサイト掲載、SNS投稿、資料添付の前に画像サイズや形式を整えるためのツールです。",
  pdf:
    "PDFの圧縮、結合、分割、ページ整理、画像変換など、資料作成や提出前の調整に使えるツールです。",
  text:
    "Base64、Markdown、JSON、CSV、QRコードなど、開発や運用でよく使うテキスト・データ処理ツールです。",
};

const faqs = [
  {
    question: "ファイルはサーバーにアップロードされますか？",
    answer:
      "画像、PDF、テキスト変換の多くはブラウザ内で処理されます。処理対象のファイルをMake It Techのサーバーへ保存する設計ではありません。",
  },
  {
    question: "無料で使えますか？",
    answer:
      "このページに掲載しているDevToolsは無料で利用できます。今後、機能追加や広告表示を行う場合でも、基本的な処理を手早く使える状態を重視します。",
  },
  {
    question: "スマートフォンでも使えますか？",
    answer:
      "スマートフォンでも操作できるように、カテゴリ別の横スクロールナビと小さめのカードUIを用意しています。ただし、大容量PDFや多数の画像処理はPCの方が安定します。",
  },
  {
    question: "PDF圧縮で必ずサイズは小さくなりますか？",
    answer:
      "PDFの内容によって圧縮率は変わります。すでに最適化済みのPDFや画像主体のPDFでは、サイズが大きく変わらない場合があります。",
  },
];

export default function ToolsPage() {
  const webApplicationData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "DevTools by Make It Tech",
    url: toolsBaseUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    description:
      "画像、PDF、テキスト、データ変換に使える無料オンラインツール集です。",
    featureList: tools.map((tool) => tool.name),
  };
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="tools-page-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      {/* Hero */}
      <section className="text-center py-3 mb-3 sm:py-8 sm:mb-8">
        <h1 className="text-2xl font-bold mb-1.5 sm:text-3xl sm:mb-3">Dev Tools</h1>
        <p className="text-sm text-neutral-400 sm:text-base">
          開発に必要な各種ツールをブラウザ上で実行
        </p>
        <p className="text-[11px] text-neutral-500 mt-1 sm:mt-2 sm:text-xs">
          ※ すべての処理はローカルで行われます。サーバーへのアップロードはありません。
        </p>
      </section>

      <div className="space-y-5 sm:space-y-8">
        {toolCategories.map((category) => {
          const categoryTools = tools.filter((tool) => tool.category === category.id);

          return (
            <section key={category.id} id={`category-${category.id}`} className="scroll-mt-28 sm:scroll-mt-32">
              <div className="mb-2 flex items-center gap-2 sm:mb-3">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-neutral-900 px-2 text-xs font-semibold text-blue-300 ring-1 ring-neutral-800">
                  {category.icon}
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-neutral-200 sm:text-lg">{category.label}</h2>
                  <p className="mt-0.5 text-[11px] leading-snug text-neutral-500 sm:text-sm">
                    {categoryDescriptions[category.id]}
                  </p>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {categoryTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={getToolHref(tool.id)}
                    className="group flex min-h-20 items-start gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-3 transition-all hover:border-blue-500 hover:bg-neutral-800/50 sm:min-h-28 sm:gap-3 sm:p-5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-xl sm:h-12 sm:w-12 sm:text-3xl">
                      {tool.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="mb-1 text-sm font-semibold transition-colors group-hover:text-blue-400 sm:text-base">
                        {tool.name}
                      </h3>
                      <p className="text-[11px] leading-snug text-neutral-400 sm:text-sm sm:leading-relaxed">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-3 sm:mt-10 sm:p-6">
        <h2 className="text-base font-semibold text-neutral-100 sm:text-xl">
          Make It Tech DevToolsについて
        </h2>
        <div className="mt-2 space-y-2 text-xs leading-6 text-neutral-400 sm:mt-3 sm:space-y-3 sm:text-sm sm:leading-7">
          <p>
            DevTools by Make It Techは、Web制作、資料作成、日々の開発作業で発生しやすい小さな変換作業を、
            ブラウザ上で素早く処理するための無料ツール集です。画像の圧縮や形式変換、PDFの圧縮・結合・分割、
            JSONやCSVの変換、QRコード生成など、業務中に何度も発生する作業をまとめています。
          </p>
          <p>
            多くの処理はお使いのブラウザ内で完結します。ファイルを選択しても、処理対象データをMake It Techの
            サーバーへ保存する設計ではありません。機密性の高い資料を扱う場合は、処理後のファイル内容を必ずご自身で確認してください。
          </p>
        </div>
      </section>

      <section className="mt-3 grid gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-neutral-100">ローカル処理中心</h3>
          <p className="mt-1.5 text-xs leading-5 text-neutral-400 sm:mt-2 sm:leading-6">
            画像、PDF、テキスト変換の多くはブラウザ内で処理されます。アップロード待ちを減らし、短時間で作業できます。
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-neutral-100">無料で利用可能</h3>
          <p className="mt-1.5 text-xs leading-5 text-neutral-400 sm:mt-2 sm:leading-6">
            よく使う変換や整理作業を無料で利用できます。PDF結合や分割など、日常的な資料調整にも対応しています。
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-neutral-100">スマホにも対応</h3>
          <p className="mt-1.5 text-xs leading-5 text-neutral-400 sm:mt-2 sm:leading-6">
            カテゴリ別ナビとコンパクトなカードUIで、スマートフォンからも目的のツールへ移動しやすくしています。
          </p>
        </div>
      </section>

      <section className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 sm:mt-6 sm:p-6">
        <h2 className="text-base font-semibold text-neutral-100 sm:text-lg">利用上の注意</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-6 text-neutral-400 sm:mt-3 sm:space-y-2 sm:pl-5 sm:text-sm sm:leading-7">
          <li>大容量ファイルやページ数の多いPDFは、端末のメモリやブラウザ性能によって処理に時間がかかる場合があります。</li>
          <li>PDF圧縮はPDFの構造や含まれる画像の状態により、必ずサイズが小さくなるとは限りません。</li>
          <li>重要なファイルを処理する前には、元ファイルのバックアップを残してください。</li>
          <li>処理結果はダウンロード後に内容を確認し、提出や公開前に表示崩れがないか確認してください。</li>
        </ul>
      </section>

      <section className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 sm:mt-6 sm:p-6">
        <h2 className="text-base font-semibold text-neutral-100 sm:text-lg">よくある質問</h2>
        <div className="mt-2 divide-y divide-neutral-800 sm:mt-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-2 sm:py-3">
              <summary className="cursor-pointer text-xs font-medium text-neutral-100 sm:text-sm">
                {faq.question}
              </summary>
              <p className="mt-1.5 text-xs leading-6 text-neutral-400 sm:mt-2 sm:text-sm sm:leading-7">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
