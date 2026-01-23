import type { Metadata } from "next";
import { Section } from "@/components/section";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "新潟のDX・IT支援の相談窓口。現状整理から丁寧に対応し、必要最小限の改善提案を行います。",
  keywords: [
    "新潟",
    "DX",
    "IT",
    "お問い合わせ",
    "業務改善",
    "丁寧",
    "信頼",
  ],
};

export default function ContactPage() {
  return (
    <Section
      eyebrow="お問い合わせ"
      title="まずは現状を聞かせてください"
      description="相談内容が固まっていなくてもOK。課題の言語化から一緒にやります。"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base">連絡先（仮）</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>メール: {site.contact.email}</p>
            <p className="mt-2">対応目安: {site.contact.responseHours}</p>
            <p className="mt-4 text-xs">
              ※ 今後、LINE公式/カレンダー予約などもここに追加できます。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
