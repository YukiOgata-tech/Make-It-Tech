import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { DiagnosisForm } from "@/components/forms/diagnosis-form";

export const metadata: Metadata = {
  title: "業務診断・制作相談フォーム",
  description:
    "業務診断やWEB制作/LP/EC相談のための専用フォームです。現状・課題・制約を整理し、最適な提案につなげます。",
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
              相談フォーム
            </Badge>
            <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
              所要時間 15分以内
            </Badge>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
            業務診断・制作相談のヒアリング
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            業務診断やWEB制作/LP/ECの相談に対応したフォームです。簡易相談はお問い合わせまたはLINEをご利用ください。
          </p>
        </div>

        <DiagnosisForm />
      </div>
    </div>
  );
}
