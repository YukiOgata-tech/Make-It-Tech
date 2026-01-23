import Link from "next/link";
import { site } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, BookOpen, CheckCircle2, FileSearch } from "lucide-react";

type GlossaryTerm = {
  id: string;
  term: string;
  reading?: string;
  desc: string;
  details?: string[];
  tags?: string[];
};

type GlossaryGroup = {
  id: string;
  title: string;
  desc: string;
  terms: GlossaryTerm[];
};

const glossaryGroups: GlossaryGroup[] = [
  {
    id: "operations",
    title: "業務・改善まわり",
    desc: "現場の課題整理や改善でよく出る言葉です。",
    terms: [
      {
        id: "workflow",
        term: "業務フロー",
        reading: "ぎょうむふろー",
        desc: "業務が「誰から誰へ、どの順番で進むか」を整理した流れ図。",
        details: ["手戻りや抜け漏れを見つけやすくなります。"],
        tags: ["整理", "見える化"],
      },
      {
        id: "personalization",
        term: "属人化",
        reading: "ぞくじんか",
        desc: "特定の人しか分からない状態で、引き継ぎや改善が難しいこと。",
        details: ["業務フローと入力ルールの標準化で解消します。"],
        tags: ["リスク", "改善"],
      },
      {
        id: "bottleneck",
        term: "ボトルネック",
        reading: "ぼとるねっく",
        desc: "作業が滞りやすい工程。ここを改善すると全体が速くなります。",
        tags: ["課題", "改善"],
      },
      {
        id: "kpi",
        term: "KPI",
        reading: "けーぴーあい",
        desc: "重要な指標。例：問い合わせ数、予約完了率、対応時間など。",
        details: ["改善の優先順位を決める基準になります。"],
        tags: ["指標"],
      },
      {
        id: "pdca",
        term: "PDCA",
        reading: "ぴーでぃーしーえー",
        desc: "計画→実行→確認→改善の繰り返し。小さく試して改善します。",
        tags: ["改善"],
      },
    ],
  },
  {
    id: "web",
    title: "Web・集客・導線",
    desc: "Web制作や問い合わせ導線で頻出する言葉です。",
    terms: [
      {
        id: "lp",
        term: "LP（ランディングページ）",
        reading: "えるぴー",
        desc: "1ページで目的を伝えるページ。問い合わせや採用に使われます。",
        tags: ["Web"],
      },
      {
        id: "cta",
        term: "CTA",
        reading: "しーてぃーえー",
        desc: "「問い合わせはこちら」などの行動ボタン。導線の要です。",
        tags: ["導線"],
      },
      {
        id: "conversion",
        term: "コンバージョン",
        reading: "こんばーじょん",
        desc: "問い合わせや予約など、目的の行動が完了した状態。",
        tags: ["成果"],
      },
      {
        id: "seo",
        term: "SEO",
        reading: "えすいーおー",
        desc: "検索結果で見つけてもらうための対策。構成と情報整理が重要。",
        tags: ["集客"],
      },
      {
        id: "analytics",
        term: "アクセス解析（GA4など）",
        reading: "あくせすかいせき",
        desc: "どこから来て、どのページで離脱したかを把握する仕組み。",
        tags: ["計測"],
      },
      {
        id: "form",
        term: "フォーム",
        reading: "ふぉーむ",
        desc: "問い合わせや予約の入力画面。項目設計で精度が変わります。",
        tags: ["導線", "入力"],
      },
    ],
  },
  {
    id: "tech",
    title: "IT・ツール・システム",
    desc: "導入や自動化でよく出る言葉です。",
    terms: [
      {
        id: "saas",
        term: "SaaS",
        reading: "さーす",
        desc: "クラウドで使うソフト。月額で使えるツールが多いです。",
        tags: ["ツール"],
      },
      {
        id: "api",
        term: "API連携",
        reading: "えーぴーあい",
        desc: "異なるサービス同士をつなげて、自動で情報をやり取りする仕組み。",
        tags: ["連携"],
      },
      {
        id: "rpa",
        term: "RPA",
        reading: "あーるぴーえー",
        desc: "人がやっている定型作業を自動化する仕組み。",
        tags: ["自動化"],
      },
      {
        id: "crm",
        term: "CRM",
        reading: "しーあーるえむ",
        desc: "顧客情報を管理し、対応履歴を一元化する仕組み。",
        tags: ["管理"],
      },
      {
        id: "cms",
        term: "CMS",
        reading: "しーえむえす",
        desc: "Webサイトを専門知識なしで更新できる仕組み。",
        tags: ["更新"],
      },
      {
        id: "requirements",
        term: "要件定義",
        reading: "ようけんていぎ",
        desc: "何を作るか、何を作らないかを決める工程。",
        tags: ["設計"],
      },
      {
        id: "estimate",
        term: "概算見積",
        reading: "がいさんみつもり",
        desc: "範囲と前提を決めた上での費用の目安。詳細見積の前段階です。",
        tags: ["費用"],
      },
    ],
  },
];

const diagnosisSteps = [
  "現状の業務フロー・担当・利用ツールの棚卸し",
  "詰まりポイントや二重入力などの課題整理",
  "推奨ITの選定理由と導線設計の提示",
  "概算見積・進行スケジュールの提示",
];

const diagnosisDeliverables = [
  "診断サマリー（現状/課題/優先順位）",
  "改善案と推奨ITの一覧",
  "概算見積・進行プラン",
  "次のアクションの提案",
];

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
                  <Button asChild size="sm" className="rounded-xl">
                    <Link href={lineUrl} target="_blank" rel="noreferrer">
                      LINEで相談 <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
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
                      {diagnosisSteps.map((item) => (
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
                      {diagnosisDeliverables.map((item) => (
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
                    <Button asChild className="rounded-xl">
                      <Link href={lineUrl} target="_blank" rel="noreferrer">
                        LINEで診断を相談 <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
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
