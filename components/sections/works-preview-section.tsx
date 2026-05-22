import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicWorks, workStats } from "@/content/works";
import { WorkCard } from "@/components/works/work-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function WorksPreviewSection() {
  const featured = publicWorks.slice(0, 3);

  return (
    <section className="py-8 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:gap-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="secondary" className="rounded-xl text-[10px] sm:text-sm">
                制作・支援実績
              </Badge>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-3xl">
                事業に合わせて、見せ方と運用を整えます
              </h2>
              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted-foreground sm:mt-3 sm:text-base sm:leading-7">
                Web制作、LP、業務改善、AI活用まで、必要な範囲に絞って支援しています。
              </p>
            </div>
            <Button asChild size="sm" className="h-9 rounded-xl sm:h-10">
              <Link href="/works">
                実績を見る <ArrowRight className="ml-1 size-3.5 sm:size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {workStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/60 bg-background/75 p-2 sm:rounded-3xl sm:p-4">
                <p className="text-[9px] font-semibold text-muted-foreground sm:text-xs">{stat.label}</p>
                <p className="mt-0.5 text-lg font-semibold sm:text-3xl">{stat.value}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground sm:text-sm">{stat.note}</p>
              </div>
            ))}
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
            {featured.map((work) => (
              <div key={work.id} className="min-w-[74vw] snap-center sm:min-w-0">
                <WorkCard work={work} compact />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

