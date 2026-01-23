import type { Metadata } from "next";
import Link from "next/link";
import { termsContent } from "@/content/terms";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "注意事項（利用規約）",
  description: "Make It Tech の注意事項（利用規約）を掲載しています。",
  keywords: [
    "利用規約",
    "注意事項",
    "新潟",
    "DX",
    "IT",
  ],
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  if (!y || !m || !d) return iso;
  return `${y}年${m}月${d}日`;
}

export default function TermsPage() {
  const c = termsContent;

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="secondary" className="rounded-xl">
            注意事項（利用規約）
          </Badge>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {c.title}
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            制定日：{formatDate(c.effectiveDate)}
          </p>
        </div>

        {/* Intro */}
        <section className="space-y-4 text-sm leading-relaxed">
          {c.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <Separator className="my-10" />

        {/* Optional: TOC */}
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <p className="text-sm font-medium">目次</p>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              {c.sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="hover:underline">
                  {s.title}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator className="my-10" />

        {/* Sections */}
        <div className="space-y-10">
          {c.sections.map((s) => (
            <section key={s.id} id={s.id} className="space-y-3">
              <h2 className="text-base font-medium">{s.title}</h2>

              {s.body?.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}

              {s.bullets?.length ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}

              {s.id === "contact" ? (
                <p className="text-sm text-muted-foreground">
                  <Link
                    href={c.contact.formPath}
                    className="underline underline-offset-2"
                  >
                    お問い合わせページ
                  </Link>
                  よりご連絡ください。
                  {c.contact.email ? <>（メール：{c.contact.email}）</> : null}
                </p>
              ) : null}
            </section>
          ))}
        </div>

        <Separator className="my-10" />

        <p className="text-xs text-muted-foreground">
          ※ 本ページの文言は必要に応じて更新されます。個別契約がある場合は、その内容が優先されます。
        </p>
      </div>
    </div>
  );
}
