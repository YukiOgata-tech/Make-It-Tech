import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PricingLinkSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-6 sm:py-16", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-3xl border border-border/60 bg-background/80 p-4 sm:gap-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <Badge variant="secondary" className="rounded-xl">
              料金ページへ
            </Badge>
            <h2 className="mt-3 text-md font-semibold tracking-tight sm:text-2xl">
              料金はページ内でまとめて確認できます
            </h2>
            <ul className="mt-2 sm:mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                "料金の考え方と範囲の目安",
                "見積もりの前提条件",
                "支払いや契約に関する注意点",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className=" border-y border-border/60 bg-background/70 p-3 sm:p-6">
            <p className="text-sm sm:text-lg font-medium">-「料金ページ」で詳しく見る</p>
            <div className="mt-4 flex flex-nowrap items-center gap-2 sm:flex-wrap">
              <Button asChild size="sm" className="rounded-lg sm:rounded-xl">
                <Link href="/pricing">
                  料金ページへ <ArrowRight className="sm:ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-lg sm:rounded-xl">
                <Link href="/contact">相談して決める</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
