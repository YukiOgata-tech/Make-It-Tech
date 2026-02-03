import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { DiagnosisForm } from "@/components/forms/diagnosis-form";

export const metadata: Metadata = {
  title: "業務診断フォーム",
  description:
    "本格的な業務診断のための専用フォームです。現状・課題・制約を整理し、診断と提案につなげます。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function IntakePage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">
              業務診断フォーム
            </Badge>
            <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
              所要時間 15分以内
            </Badge>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
            業務診断のためのヒアリング
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            本格的な診断を想定したフォームです。簡易相談はお問い合わせまたはLINEをご利用ください。
          </p>
        </div>

        <DiagnosisForm />
      </div>
    </div>
  );
}
