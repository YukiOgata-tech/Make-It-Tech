/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicWorks, workCapabilities, workStats } from "@/content/works";
import { WorkCard } from "@/components/works/work-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "制作・支援実績",
  description:
    "Make It TechのWeb制作、LP制作、業務改善、AI活用支援の実績紹介ページです。",
  keywords: ["制作実績", "Web制作", "LP制作", "DX支援", "新潟", "業務改善"],
};

export default function WorksPage() {
  const digishiftWork = publicWorks.find((work) => work.id === "digishift");

  return (
    <div className="py-8 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:gap-8">
          <div className="grid gap-3 sm:gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-xl text-[10px] sm:text-sm">
                Works
              </Badge>
            </div>
            <div className="grid gap-2 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                  制作・支援実績
                </h1>
                <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground sm:text-base sm:leading-7">
                  企業サイト、LP、業務改善、AI活用まで、事業の状況に合わせて必要な範囲を整理し、実装と運用につなげています。
                </p>
              </div>
              <Button asChild className="h-9 rounded-xl sm:h-11 lg:justify-self-end">
                <Link href="/contact">
                  似た課題を相談する <ArrowRight className="ml-1 size-3.5 sm:size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {workStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/60 bg-background/75 p-2 sm:rounded-3xl sm:p-5">
                <p className="text-[9px] font-semibold text-muted-foreground sm:text-xs">{stat.label}</p>
                <p className="mt-0.5 text-xl font-semibold sm:text-4xl">{stat.value}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground sm:text-sm">{stat.note}</p>
              </div>
            ))}
          </div>

          {digishiftWork ? (
            <section className="rounded-2xl border border-border/60 bg-background/75 p-3 sm:rounded-3xl sm:p-5">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-4">
                <div>
                  <Badge variant="secondary" className="rounded-xl text-[10px] sm:text-sm">
                    Featured case
                  </Badge>
                  <div className="mt-2 flex min-h-9 items-center gap-2 sm:gap-3">
                    {digishiftWork.logoUrl ? (
                      <img
                        src={digishiftWork.logoUrl}
                        alt={`${digishiftWork.companyName} ロゴ`}
                        className="h-8 w-auto max-w-[128px] object-contain sm:h-11 sm:max-w-[180px]"
                        loading="lazy"
                      />
                    ) : null}
                    <h2 className="text-base font-semibold tracking-tight sm:text-2xl">
                      {digishiftWork.companyName}
                    </h2>
                  </div>
                  <p className="mt-1.5 max-w-3xl text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                    飲食店や学童保育施設向けに、シフト希望の回収から作成・共有・打刻までを一元化したWebシステムです。
                  </p>
                </div>
                <Link
                  href={digishiftWork.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center justify-center rounded-xl border border-border/70 px-3 text-[10px] font-semibold transition hover:bg-muted sm:h-10 sm:text-sm"
                >
                  サイトを見る <ArrowRight className="ml-1 size-3.5 sm:size-4" />
                </Link>
              </div>
            </section>
          ) : null}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
            {workCapabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 p-2 sm:p-3">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground sm:size-9">
                    <Icon className="size-3.5 sm:size-4" />
                  </span>
                  <span className="text-[10px] font-semibold sm:text-sm">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            {publicWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}






