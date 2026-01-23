import type { Metadata } from "next";
import Link from "next/link";
import { privacyContent } from "@/content/privacy";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "Make It Tech のプライバシーポリシーを掲載しています。",
  keywords: [
    "プライバシーポリシー",
    "個人情報",
    "新潟",
    "DX",
    "IT",
  ],
};

function formatDate(iso: string) {
  // iso: YYYY-MM-DD
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  if (!y || !m || !d) return iso;
  return `${y}年${m}月${d}日`;
}

export default function PrivacyPolicyPage() {
  const c = privacyContent;

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="secondary" className="rounded-xl">
            プライバシーポリシー
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

              {/* Contact section enhancement */}
              {s.id === "contact" ? (
                <p className="text-sm text-muted-foreground">
                  <Link href={c.contact.formPath} className="underline underline-offset-2">
                    お問い合わせページ
                  </Link>
                  よりご連絡ください。
                  {c.contact.email ? (
                    <>
                      {" "}（メール：{c.contact.email}）
                    </>
                  ) : null}
                </p>
              ) : null}
            </section>
          ))}
        </div>

        <Separator className="my-10" />

        {/* Footnote */}
        <p className="text-xs text-muted-foreground">
          ※ 本ページの文言は必要に応じて更新されます。
        </p>
      </div>
    </div>
  );
}
