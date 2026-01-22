import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, ShieldCheck, Timer, Wrench } from "lucide-react";

type FAQ = {
  category: "サービス" | "料金" | "進め方" | "契約/注意事項";
  q: string;
  a: string;
};

const faqs: FAQ[] = [
  {
    category: "サービス",
    q: "Web制作だけでも依頼できますか？",
    a: "可能です。LP・店舗サイト・コーポレートなど、目的（集客/採用/告知）に合わせて構成から一緒に整理します。必要なら計測（GA等）や導線改善も対応します。",
  },
  {
    category: "サービス",
    q: "“ITのこと全部”って、どこまで対応できますか？",
    a: "IT領域全般を対象にしますが、対応範囲はヒアリングで明確にしてから進めます。無理に開発せず、既存ツールで解決できるなら“作らない”選択もします。",
  },
  {
    category: "料金",
    q: "プランがないのは不安です。料金はどう決まりますか？",
    a: "案件ごとに必要範囲が違うため、固定プランは置いていません。代わりに、よくある依頼の価格レンジを提示し、範囲（やる/やらない）を合意してから見積もります。",
  },
  {
    category: "進め方",
    q: "相談したら、必ず契約しないといけませんか？",
    a: "いいえ。無料相談では「現状」「理想」「制約」を整理し、最短の改善案を提案します。納得してから進めてください。",
  },
  {
    category: "進め方",
    q: "どれくらいで効果が出ますか？",
    a: "内容によりますが、まずは“最小構成”で2〜4週間程度で動く状態を作ることが多いです。そこから運用・改善で成果に寄せます。",
  },
  {
    category: "契約/注意事項",
    q: "修正は無制限ですか？",
    a: "無制限ではありません。対応範囲と修正の目安は最初に合意して進めます。仕様の追加や方針転換は、別途相談（見積もり）になります。",
  },
  {
    category: "契約/注意事項",
    q: "店舗の情報や顧客データなど、情報の取り扱いは大丈夫ですか？",
    a: "適切なアクセス制御・権限管理を行い、必要最小限の情報のみ扱います。取り扱い方針は個別契約やプライバシーポリシーにも明記します。",
  },
];

const categoryMeta = [
  { key: "サービス", icon: Wrench, desc: "できること/できないこと" },
  { key: "料金", icon: ShieldCheck, desc: "見積もりの考え方" },
  { key: "進め方", icon: Timer, desc: "スピード感と手順" },
  { key: "契約/注意事項", icon: ShieldCheck, desc: "トラブル防止のルール" },
] as const;

export function FAQSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-14 sm:py-18", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary/80">FAQ</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              不安になりやすいポイントを先に解消します
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              “何でもできます”の不透明さをなくすために、範囲・進め方・料金の考え方を明確にします。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/terms">注意事項</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/contact">
                無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {categoryMeta.map((c, index) => (
            <FadeIn key={c.key} delay={0.05 * index}>
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium">{c.key}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <Separator className="my-10" />

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, idx) => (
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

        {/* Bottom CTA */}
        <div className="mt-10 rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8">
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
                  無料相談へ <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/survey">事前アンケート</Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          ※ 内容は案件により異なります。対応範囲・費用・納期は事前に合意して進行します。
        </p>
      </div>
    </section>
  );
}
