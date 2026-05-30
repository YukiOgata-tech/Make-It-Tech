import Link from "next/link";
import { getToolHref, toolCategories, tools } from "./_data/tools";

export default function ToolsPage() {
  return (
    <div className="tools-page-container">
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
                <h2 className="text-sm font-semibold text-neutral-200 sm:text-lg">{category.label}</h2>
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
    </div>
  );
}
