import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { ContactForm } from "@/components/contact-form";
import { Button } from "@/components/ui/button";
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
            <CardTitle className="text-base">対応目安</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{site.contact.responseHours}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" className="rounded-xl">
                <Link
                  href={site.line?.surveyUrl ?? "https://lin.ee/8uHdH0Y"}
                  target="_blank"
                  rel="noreferrer"
                >
                  LINEで相談
                </Link>
              </Button>
              <span className="text-xs text-muted-foreground">
                返信が早い場合があります
              </span>
            </div>
            <p className="mt-4 text-xs">
              ※ 連絡はフォームからお願いします。今後、LINE公式/カレンダー予約なども追加できます。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
