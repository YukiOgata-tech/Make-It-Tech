import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import {
  glossaryDiagnosisDeliverables,
  glossaryDiagnosisSteps,
  glossaryGroups,
} from "@/content/pages/glossary";
import { GlossaryExplorer } from "@/components/sections/glossary-explorer";

export const metadata: Metadata = {
  title: {
    absolute: "IT・技術用語集 分かりやすい 解説 新潟",
  },
  description:
    "非エンジニア向けに、業務改善・DX・Web制作・IT導入でよく出る用語を整理した辞書ページ",
  keywords: [
    "用語集", "LLM", "AI", "人工知能", "生成AI",
    "DX", "IT", "Web制作", "LP制作", "IT導入", "非エンジニア",
  ],
};

export default function GlossaryPage() {
  const lineUrl = site.line?.surveyUrl ?? "https://lin.ee/8uHdH0Y";

  return (
    <div className="py-6 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Badge variant="secondary" className="rounded-lg px-2 py-0 text-[10px] sm:rounded-xl sm:text-xs">
            用語集
          </Badge>
          <Badge variant="outline" className="rounded-lg border-primary/30 px-2 py-0 text-[10px] text-primary sm:rounded-xl sm:text-xs">
            非エンジニア向け
          </Badge>
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:mt-4 sm:text-4xl">
          まずは“言葉の壁”をなくすために
        </h1>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
          相談の場でよく出る言葉を、現場目線でわかりやすく整理しています。
          必要に応じて増やしていけるよう、カテゴリ別にまとめています。
        </p>

        <GlossaryExplorer
          groups={glossaryGroups}
          diagnosisSteps={glossaryDiagnosisSteps}
          diagnosisDeliverables={glossaryDiagnosisDeliverables}
          lineUrl={lineUrl}
        />
      </div>
    </div>
  );
}
