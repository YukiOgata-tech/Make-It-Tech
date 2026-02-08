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
  title: "用語集",
  description:
    "非エンジニア向けに、業務改善・DX・Web制作・IT導入でよく出る用語を整理した簡易辞書です。",
  keywords: [
    "用語集",
    "業務改善",
    "DX",
    "IT",
    "Web制作",
    "新潟",
    "非エンジニア",
    "業務診断",
  ],
};

export default function GlossaryPage() {
  const lineUrl = site.line?.surveyUrl ?? "https://lin.ee/8uHdH0Y";

  return (
    <div className="py-8 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-xl">
            用語集
          </Badge>
          <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
            非エンジニア向け
          </Badge>
        </div>

        <h1 className="mt-4 text-xl font-semibold tracking-tight sm:text-4xl">
          まずは“言葉の壁”をなくすために
        </h1>
        <p className="mt-1 sm:mt-3 max-w-3xl text-xs sm:text-base text-muted-foreground">
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
