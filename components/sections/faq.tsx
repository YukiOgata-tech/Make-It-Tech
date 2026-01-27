import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    q: "Web制作だけでも依頼できますか？",
    a: "可能です。LP/店舗サイト/簡易な更新運用まで対応します。業務改善とセットでの依頼も歓迎です。",
  },
  {
    q: "何でも対応できますか？",
    a: "IT領域全般を対象にしますが、対応範囲は事前ヒアリングで決めます。無理に開発せず、最小コストで効果が出る手段を優先します。",
  },
  {
    q: "契約・注意事項はありますか？",
    a: "あります。対応時間、修正回数の目安、免責・情報取り扱い等を明記します。詳細は「利用条件・注意事項」を参照してください。",
  },
];

export function FAQ() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {faqs.map((f) => (
        <Card key={f.q} className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base">{f.q}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {f.a}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
