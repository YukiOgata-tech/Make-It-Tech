import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "ライト",
    price: "¥29,800/月〜",
    badge: "おすすめ",
    desc: "小さく始めたい方向け。業務整理＋ツール導入の伴走。",
    features: [
      "月1回の定例（オンライン）",
      "チャット相談（平日）",
      "フォーム/シート整備",
      "軽微な修正対応",
    ],
  },
  {
    name: "スタンダード",
    price: "¥59,800/月〜",
    desc: "改善PDCAを回す。数値/導線/運用の最適化。",
    features: [
      "月2回の定例",
      "KPI設計・改善案の提示",
      "自動化（Zap/Apps Script等）",
      "Web更新/導線改善",
    ],
  },
  {
    name: "プロ",
    price: "要相談",
    desc: "実装込み。小規模システムや管理画面の構築まで。",
    features: [
      "要件整理・設計",
      "簡易システム開発",
      "運用監視・改善",
      "成果報酬の相談可",
    ],
  },
];

export function PricingTable() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((p) => (
        <Card key={p.name} className="rounded-3xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{p.name}</CardTitle>
              {p.badge && (
                <Badge className="rounded-xl" variant="secondary">
                  {p.badge}
                </Badge>
              )}
            </div>
            <p className="text-2xl font-semibold tracking-tight">{p.price}</p>
            <p className="text-sm text-muted-foreground">{p.desc}</p>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground">
              ※ 料金は内容・期間・工数により変動します。初期費用は別途相談。
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
