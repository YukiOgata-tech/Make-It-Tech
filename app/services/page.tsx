import { Section } from "@/components/section";
import { ServiceCards } from "@/components/service-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServicesPage() {
  return (
    <>
      <Section
        eyebrow="サービス"
        title="Web制作から業務改善・DXまで"
        description="“作る”より先に“整理”。必要なものだけを実装して、現場で運用できる形にします。"
      >
        <ServiceCards />
      </Section>

      <Section
        eyebrow="進め方"
        title="最短で成果に近づく、シンプルなプロセス"
        description="状況により順序は前後しますが、基本はこの流れです。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "1. ヒアリング",
              d: "現状・課題・理想を整理し、必要な範囲と優先順位を決めます。",
            },
            {
              t: "2. 仕組み化",
              d: "LINE/フォーム/シート/自動化などで低コストに仕組みを作ります。",
            },
            {
              t: "3. 運用・改善",
              d: "使ってみて分かる課題を潰し、数字と現場の声で改善します。",
            },
          ].map((x) => (
            <Card key={x.t} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">{x.t}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {x.d}
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
