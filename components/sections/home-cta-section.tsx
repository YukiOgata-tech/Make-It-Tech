import Link from "next/link";
import { ArrowRight, ClipboardCheck, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ctaItems = [
  {
    title: "業務診断を相談する",
    description: "現状整理や改善案が必要な方はこちら。",
    href: "/survey",
    buttonLabel: "診断の相談へ",
    icon: ClipboardCheck,
  },
  {
    title: "料金の目安を見る",
    description: "制作・支援の費用感を確認したい方はこちら。",
    href: "/pricing",
    buttonLabel: "料金ページへ",
    icon: ReceiptText,
  },
];

export function HomeCtaSection() {
  return (
    <section className="py-5 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="border-y border-border/70 bg-background/70 py-4 sm:rounded-3xl sm:border sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="secondary" className="rounded-xl text-[10px] sm:text-sm">
                次に確認する
              </Badge>
              <h2 className="mt-2 text-base font-semibold tracking-tight sm:text-2xl">
                詳細は必要なページで確認できます
              </h2>
            </div>
            <p className="max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
              トップページでは要点だけを見せ、診断や料金は興味のある方がすぐ移動できる導線として整理しています。
            </p>
          </div>

          <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
            {ctaItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 border border-border/70 bg-background/80 p-3 transition hover:border-primary/40 hover:bg-background sm:rounded-2xl sm:p-4"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary sm:h-11 sm:w-11">
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold sm:text-base">{item.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground sm:text-sm">
                    {item.description}
                  </span>
                </span>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="hidden rounded-xl sm:inline-flex"
                >
                  <span>
                    {item.buttonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
                <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-0.5 sm:hidden" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
