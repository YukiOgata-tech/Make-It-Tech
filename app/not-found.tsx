import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  description:
    "指定されたページは見つかりませんでした。トップや主要ページへの導線をご案内します。",
  robots: {
    index: false,
    follow: true,
  },
};

const links = [
  {
    title: "サービスを見る",
    desc: "対応範囲と支援スタイルを確認できます。",
    href: "/services",
    label: "サービス",
  },
  {
    title: "料金の目安",
    desc: "価格レンジと見積もりの考え方を紹介します。",
    href: "/pricing",
    label: "料金",
  },
  {
    title: "業務診断",
    desc: "条件により無料の業務診断をご案内します。",
    href: "/#diagnosis",
    label: "業務診断",
  },
  {
    title: "お問い合わせ",
    desc: "現状の共有から丁寧に進めます。",
    href: "/contact",
    label: "相談",
  },
  {
    title: "事前アンケート",
    desc: "LINEで現状を整理し、提案を速くします。",
    href: "/survey",
    label: "アンケート",
  },
  {
    title: "用語集",
    desc: "非エンジニア向けの簡易辞書ページです。",
    href: "/glossary",
    label: "用語",
  },
];

export default function NotFound() {
  return (
    <Section
      eyebrow="404"
      title="ページが見つかりません"
      description="URLが間違っているか、ページが移動した可能性があります。目的に近いページへご案内します。"
    >
      <div className="grid gap-6">
        <div className="rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8">
          <p className="text-sm font-medium">お探しの内容はどれですか？</p>
          <p className="mt-2 text-sm text-muted-foreground">
            「現状の困りごと」「理想」「制約」を共有いただければ、最短の改善案をご提案します。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/contact">お問い合わせへ</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/">トップへ戻る</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => (
            <Card key={item.title} className="rounded-3xl">
              <CardHeader className="space-y-2">
                <Badge variant="secondary" className="rounded-xl">
                  {item.label}
                </Badge>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href={item.href}>このページへ</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
