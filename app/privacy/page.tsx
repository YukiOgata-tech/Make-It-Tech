import type { Metadata } from "next";
import Link from "next/link";
import { privacyContent } from "@/content/privacy";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { MobileTocList } from "@/components/navigation/mobile-toc";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "Make It Tech のプライバシーポリシーを掲載しています。",
  keywords: [
    "プライバシーポリシー", "個人情報", "新潟", "DX", "IT", "業務改善", "Web制作",
    "LP制作", "信頼", "情報保護", "データ管理", "セキュリティ", "利用規約", "niigata",
  ],
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  if (!y || !m || !d) return iso;
  return `${y}年${m}月${d}日`;
}

export default function PrivacyPolicyPage() {
  const c = privacyContent;
  const tocItems = c.sections.map((s) => ({ id: s.id, title: s.title }));
  const toc = (
    <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
      {tocItems.map((s) => (
        <li key={s.id}>
          <Link href={`#${s.id}`} className="hover:text-foreground hover:underline">
            {s.title}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="py-6 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
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

        <Separator className="my-8 sm:my-10" />

        {/* TOC */}
        <div className="hidden md:block">
          <p className="text-sm font-medium">内容一覧</p>
          <div className="mt-3">{toc}</div>
        </div>
        <div className="md:hidden">
          <MobileDisclosure summary="内容一覧">
            <MobileTocList items={tocItems} className="sm:grid-cols-2" />
          </MobileDisclosure>
        </div>

        <Separator className="my-8 sm:my-10" />

        {/* Sections */}
        <div className="hidden space-y-8 md:block">
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
                </p>
              ) : null}
            </section>
          ))}
        </div>

        <div className="grid gap-3 md:hidden">
          {c.sections.map((s) => (
            <div key={s.id}>
              <MobileDisclosure id={s.id} summary={s.title} openOnHash>
                <div className="grid gap-3">
                  {s.body?.map((p, i) => (
                    <p key={i} className="text-xs leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}

                  {s.bullets?.length ? (
                    <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                      {s.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}

                  {s.id === "contact" ? (
                    <p className="text-sm text-muted-foreground pb-1">
                      <Link href={c.contact.formPath} className="underline underline-offset-2">
                        お問い合わせページ
                      </Link>
                    </p>
                  ) : null}
                </div>
              </MobileDisclosure>
            </div>
          ))}
        </div>

        <Separator className="my-8 sm:my-10" />

        {/* Footnote */}
        <p className="text-xs text-muted-foreground">
          ※ 本ページの文言は必要に応じて更新されます。
        </p>
      </div>
    </div>
  );
}
