import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { faqCategoryMeta, faqItems } from "@/content/sections/faq-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";

export function FAQSection({ className }: { className?: string }) {
  const previewFaqs = faqItems.slice(0, 4);
  const moreFaqs = faqItems.slice(4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <section className={cn("py-6 sm:py-18", className)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary/80">-FAQ</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
              不安になりやすいポイントを先に解消します
            </h2>
            <p className="mt-0.5 sm:mt-3 max-w-2xl text-md sm:text-base text-muted-foreground">
              “何でもできます”の不透明さをなくすために、範囲・進め方・料金の考え方を明確にします。
            </p>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-4 sm:mt-8 grid gap-3 sm:gap-4 md:grid-cols-4">
          {faqCategoryMeta.map((c, index) => (
            <FadeIn key={c.key} delay={0.05 * index}>
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-3 py-1 sm:py-2 sm:px-4">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-primary/0 bg-primary/10 text-primary sm:h-9 sm:w-9">
                  <c.icon className="h-4 w-4" />
                </div>
                <div className="grid gap-0.5">
                  <p className="text-sm font-medium">{c.key}</p>
                  <p className="text-xs leading-snug text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <Separator className="my-4 sm:my-10" />

        {/* Accordion */}
        <div className="hidden md:block">
          <Accordion type="single" collapsible className="w-full gap-1">
            {faqItems.map((f, idx) => (
              <AccordionItem key={`${f.category}-${idx}`} value={`item-${idx}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-xl">
                      {f.category}
                    </Badge>
                    <span className="font-medium">{f.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="grid gap-2 md:hidden">
          <Accordion type="single" collapsible className="w-full">
            {previewFaqs.map((f, idx) => (
              <AccordionItem key={`${f.category}-${idx}`} value={`item-${idx}`} className="py-0">
                <AccordionTrigger className="text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-xl">
                      {f.category}
                    </Badge>
                    <span className="pb-0 font-medium text-sm">{f.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2 pt-0 text-xs leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {moreFaqs.length ? (
            <MobileDisclosure summary="FAQをもっと見る">
              <Accordion type="single" collapsible className="w-full">
                {moreFaqs.map((f, idx) => (
                  <AccordionItem
                    key={`${f.category}-more-${idx}`}
                    value={`item-more-${idx}`}
                  >
                    <AccordionTrigger className="text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-xl">
                          {f.category}
                        </Badge>
                        <span className="font-medium">{f.q}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </MobileDisclosure>
          ) : null}
        </div>

        {/* Bottom CTA */}
        <div className="mt-4 sm:mt-10 rounded-3xl border border-primary/20 bg-secondary/40 px-4 p-4 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <p className="text-sm font-medium">迷ったら、まず“現状”だけでOK</p>
              <p className="mt-2 text-sm text-muted-foreground">
                相談時点で要件が固まっていなくても問題ありません。
                「困っていること」「理想」「制約」を整理して、最短の改善案を作ります。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild className="rounded-xl">
                <Link href="/contact">
                  無料相談へ <ArrowRight className="sm:ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/survey">LINEで相談</Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-3 sm:mt-6 text-xs text-muted-foreground">
          ※ 内容は案件により異なります。対応範囲・費用・納期は事前に合意して進行します。
        </p>
      </div>
    </section>
  );
}
