import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminRefreshButton } from "@/components/admin/admin-refresh-button";

export const metadata: Metadata = {
  title: "管理トップ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminConsoleIndexPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="secondary" className="rounded-xl">
            Admin Console
          </Badge>
          <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-3xl">
            管理トップ
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            管理メニューを選択してください。新しい管理機能もここに追加していきます。
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
        <Card className="rounded-2xl gap-2 py-3 sm:col-span-2 sm:rounded-3xl sm:gap-4 sm:py-5">
          <CardHeader>
            <CardTitle className="text-base">最新情報の反映</CardTitle>
            <p className="text-xs text-muted-foreground">
              管理画面の一覧・詳細はキャッシュ表示です。必要なときだけ更新してください。
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              更新ボタンで最新データを取得します。
            </span>
            <AdminRefreshButton />
          </CardContent>
        </Card>

        <Card className="rounded-2xl gap-2 py-3 sm:rounded-3xl sm:gap-4 sm:py-5">
          <CardHeader>
            <CardTitle className="text-base">業務診断 回答一覧</CardTitle>
            <p className="text-xs text-muted-foreground">
              相談内容の確認・ステータス更新はこちら。
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              最新100件まで表示
            </span>
            <Button asChild className="rounded-xl">
              <Link href="/sub/admin-console/results">開く</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl gap-2 py-3 sm:rounded-3xl sm:gap-4 sm:py-5">
          <CardHeader>
            <CardTitle className="text-base">お知らせ 投稿管理</CardTitle>
            <p className="text-xs text-muted-foreground">
              企業のお知らせ・メディア・実績を投稿します。
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              公開ページに反映
            </span>
            <Button asChild className="rounded-xl">
              <Link href="/sub/admin-console/news">開く</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl gap-2 py-3 sm:rounded-3xl sm:gap-4 sm:py-5">
          <CardHeader>
            <CardTitle className="text-base">ブログ 投稿管理</CardTitle>
            <p className="text-xs text-muted-foreground">
              事業所の課題解決に役立つ記事を作成します。
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              SEO/GEO向けコンテンツ
            </span>
            <Button asChild className="rounded-xl">
              <Link href="/sub/admin-console/blog">開く</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl gap-2 py-3 sm:rounded-3xl sm:gap-4 sm:py-5">
          <CardHeader>
            <CardTitle className="text-base">My Life 設定</CardTitle>
            <p className="text-xs text-muted-foreground">
              /this-is-my-life に表示するメッセージと画像を設定します。
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              プライベートページ向け
            </span>
            <Button asChild className="rounded-xl">
              <Link href="/sub/admin-console/my-life">開く</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl gap-2 border-dashed py-3 sm:rounded-3xl sm:gap-4 sm:py-5">
          <CardHeader>
            <CardTitle className="text-base">レポート・分析</CardTitle>
            <p className="text-xs text-muted-foreground">
              案件数や対応状況の集計を追加予定です。
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
              近日追加
            </Badge>
            <Button type="button" variant="outline" className="rounded-xl" disabled>
              準備中
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl gap-2 border-dashed py-3 sm:rounded-3xl sm:gap-4 sm:py-5">
          <CardHeader>
            <CardTitle className="text-base">運用設定</CardTitle>
            <p className="text-xs text-muted-foreground">
              通知設定や管理者の権限管理を追加予定です。
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline" className="rounded-xl border-primary/30 text-primary">
              近日追加
            </Badge>
            <Button type="button" variant="outline" className="rounded-xl" disabled>
              準備中
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
