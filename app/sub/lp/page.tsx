import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "LPサブドメイン",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LpSubdomainPage() {
  return (
    <Section
      eyebrow="LPサブドメイン"
      title="lp.make-it-tech.com の雛形"
      description="ここにLP専用の構成を追加していきます。"
    >
      <div className="flex flex-wrap gap-3">
        <Button asChild className="rounded-xl">
          <Link href="/contact">お問い合わせへ</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">トップへ戻る</Link>
        </Button>
      </div>
    </Section>
  );
}
