import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { HpLpRequestForm } from "@/components/forms/hp-lp-request-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "HP/LP制作 相談フォーム",
  description:
    "ホームページ・LP制作の相談フォームです。事業内容や掲載したい情報をもとに、構成・デザイン・導線を提案します。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HpLpRequestPage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">
              HP/LP制作
            </Badge>
            <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
              おまかせ相談
            </Badge>
          </div>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                HP/LP制作の相談フォーム
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                細かいデザインや構成が決まっていなくても大丈夫です。事業内容、掲載したい情報、伝えたい強みをもとに、
                構成・デザイン・導線をこちらで整理して試作します。
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/files/hp-lp-simple-request-form.pdf" target="_blank">
                <FileText className="mr-2 h-4 w-4" />
                手書き用PDF
              </Link>
            </Button>
          </div>
        </div>

        <HpLpRequestForm />
      </div>
    </div>
  );
}
