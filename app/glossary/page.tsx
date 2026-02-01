import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import {
  glossaryDiagnosisDeliverables,
  glossaryDiagnosisSteps,
  glossaryGroups,
} from "@/content/pages/glossary";
import { ArrowRight, BookOpen, CheckCircle2, FileSearch } from "lucide-react";

export const metadata: Metadata = {
  title: "用語集",
  description:
    "非エンジニア向けに、業務改善・DX・Web制作・IT導入でよく出る用語を整理した簡易辞書です。",
  keywords: [
    "用語集",
    "業務改善",
    "DX",
    "IT",
    "Web制作",
    "新潟",
    "非エンジニア",
    "業務診断",
  ],
};

export default function GlossaryPage() {
  const lineUrl = site.line?.surveyUrl ?? "https://lin.ee/8uHdH0Y";

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-xl">
            用語集
          </Badge>
          <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
            非エンジニア向け
          </Badge>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          まずは“言葉の壁”をなくすために
        </h1>
        <p className="mt-3 max-w-3xl text-base text-muted-foreground">
          相談の場でよく出る言葉を、現場目線でわかりやすく整理しています。
          必要に応じて増やしていけるよう、カテゴリ別にまとめています。
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Navigation */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">目次</CardTitle>
                <p className="text-sm text-muted-foreground">
                  目的の言葉にすぐ移動できます。
                </p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="hidden md:grid md:gap-4">
                  <Link href="#business-diagnosis" className="hover:underline">
                    業務診断とは
                  </Link>
                  {glossaryGroups.map((group) => (
                    <div key={group.id} className="grid gap-2">
                      <Link href={`#${group.id}`} className="font-medium hover:underline">
                        {group.title}
                      </Link>
                      <div className="grid gap-1 text-xs text-muted-foreground">
                        {group.terms.map((term) => (
                          <Link key={term.id} href={`#${term.id}`} className="hover:underline">
                            {term.term}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="md:hidden">
                  <MobileDisclosure summary="目次を開く">
                    <div className="grid gap-4">
                      <Link href="#business-diagnosis" className="hover:underline">
                        業務診断とは
                      </Link>
                      {glossaryGroups.map((group) => (
                        <div key={group.id} className="grid gap-2">
                          <Link href={`#${group.id}`} className="font-medium hover:underline">
                            {group.title}
                          </Link>
                          <div className="grid gap-1 text-xs text-muted-foreground">
                            {group.terms.map((term) => (
                              <Link key={term.id} href={`#${term.id}`} className="hover:underline">
                                {term.term}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </MobileDisclosure>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <p className="text-sm font-medium">業務診断もこちら</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  現状把握から推奨IT・見積まで行う診断型の支援です。
                </p>
                <div className="mt-4 grid gap-3">
                  <LineButton href={lineUrl} size="sm" target="_blank" rel="noreferrer">
                    LINEで相談 <ArrowRight className="ml-2 h-4 w-4" />
                  </LineButton>
                  <Button asChild size="sm" variant="outline" className="rounded-xl">
                    <Link href="/contact">お問い合わせ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Content */}
          <main className="space-y-12">
            <section id="business-diagnosis" className="scroll-mt-24 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-xl">
                    業務診断
                  </Badge>
                  <Badge variant="outline" className="rounded-xl">
                    条件により無料
                  </Badge>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  お問い合わせとは違う“診断”の位置づけ
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  業務診断は、現状の詳細把握・推奨ITの提案・概算見積まで行うものです。
                  相談やヒアリングだけで終わらず、改善に向けた具体案を整理します。
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-base">お問い合わせ・無料相談</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="grid gap-2">
                      {["困りごとの共有", "目的や制約の整理", "進め方の提案"].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-base">業務診断</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="grid gap-2">
                      {[
                        "現状の詳細把握（フロー/担当/ツール）",
                        "課題の構造化と優先順位",
                        "推奨ITと概算見積の提示",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-base">診断で行うこと</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="grid gap-2">
                      {glossaryDiagnosisSteps.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <FileSearch className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-base">成果物（例）</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="grid gap-2">
                      {glossaryDiagnosisDeliverables.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs text-muted-foreground">
                      ※ 無料になる条件は案件規模・支援前提・実施形式により異なります。
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8">
                <div className="grid gap-4 md:grid-cols-3 md:items-center">
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium">診断の相談はLINEが最速</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      現状の困りごとを共有いただければ、診断の進め方をご案内します。
                    </p>
                  </div>
                <div className="flex flex-wrap gap-3 md:justify-end">
                  <LineButton href={lineUrl} target="_blank" rel="noreferrer">
                    LINEで相談 <ArrowRight className="ml-2 h-4 w-4" />
                  </LineButton>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/contact">お問い合わせ</Link>
                  </Button>
                </div>
                </div>
              </div>
            </section>

            <Separator />

            {glossaryGroups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{group.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{group.desc}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {group.terms.map((term) => (
                    <Card key={term.id} id={term.id} className="rounded-3xl scroll-mt-24">
                      <CardHeader className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">{term.term}</CardTitle>
                          {term.reading ? (
                            <span className="text-xs text-muted-foreground">
                              {term.reading}
                            </span>
                          ) : null}
                        </div>
                        {term.tags?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {term.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="rounded-xl">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>{term.desc}</p>
                        {term.details?.length ? (
                          <ul className="mt-3 grid gap-2">
                            {term.details.map((detail) => (
                              <li key={detail} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
