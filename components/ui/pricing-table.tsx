import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pricingPlans } from "@/content/ui/pricing-table";
import { Check } from "lucide-react";

export function PricingTable() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {pricingPlans.map((p) => (
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
