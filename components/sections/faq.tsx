import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { miniFaqs } from "@/content/sections/faq";

export function FAQ() {
  return (
    <div className="grid gap-2 sm:gap-4 md:grid-cols-3">
      {miniFaqs.map((f) => (
        <Card key={f.q} className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg sm:text-base">{f.q}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-muted-foreground">
            {f.a}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
