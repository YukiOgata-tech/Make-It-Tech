import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "管理用サブドメイン",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSubdomainPage() {
  return (
    <Section
      eyebrow="管理用サブドメイン"
      title="admin.make-it-tech.com の雛形"
      description="管理画面や運用ツールの入口として利用する想定です。"
    >
      <div className="flex flex-wrap gap-3">
        <Button asChild className="rounded-xl">
          <Link href="/">トップへ戻る</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/contact">お問い合わせ</Link>
        </Button>
      </div>
    </Section>
  );
}
