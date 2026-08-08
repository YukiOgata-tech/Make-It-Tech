import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "送信完了",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function IntakeCompletePage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams?.id ?? "";

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Badge variant="secondary" className="rounded-xl">
          送信完了
        </Badge>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
          受付が完了しました
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          内容を確認のうえ、ご連絡します。控えとして回答IDを保存してください。
        </p>

        <div className="mt-6 rounded-3xl border border-primary/20 bg-secondary/40 p-5 sm:p-8">
          <p className="text-xs text-muted-foreground">回答ID</p>
          <p className="mt-2 text-xl font-semibold tracking-widest">
            {id || "IDを確認できませんでした"}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            ※ 自動返信メールにも記載されます。
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl">
            <Link href="/">トップへ戻る</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/contact">お問い合わせ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
