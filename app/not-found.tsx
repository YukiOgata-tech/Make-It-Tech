import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFoundLinks } from "@/content/pages/not-found";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  description:
    "指定されたページは見つかりませんでした。トップや主要ページへの導線をご案内します。",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <Section
      eyebrow="404"
      title="ページが見つかりません"
      description="URLが間違っているか、ページが移動した可能性があります。目的に近いページへご案内します。"
    >
      <div className="grid gap-4 sm:gap-6">
        <div className="rounded-3xl border border-primary/20 bg-secondary/40 p-3 sm:p-8">
          <p className="text-sm font-medium">お探しの内容はどれですか？</p>
          <p className="mt-2 text-sm text-muted-foreground">
            「現状の困りごと･理想･制約」を共有で、改善案をご提案！
          </p>
          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/contact">お問い合わせへ</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/">トップへ戻る</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {notFoundLinks.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-xl">
                  {item.label}
                </Badge>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full sm:hidden"
                    >
                      <Link href={item.href} aria-label={`${item.title}へ移動`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Button asChild variant="outline" className="hidden rounded-xl sm:inline-flex">
                <Link href={item.href}>このページへ</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
