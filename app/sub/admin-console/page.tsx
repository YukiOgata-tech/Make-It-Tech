import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  ClipboardList,
  FileSignature,
  Heart,
  Mail,
  Newspaper,
  RadioTower,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminRefreshButton } from "@/components/admin/admin-refresh-button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "管理トップ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const contentLinks = [
  {
    href: "/sub/admin-console/news",
    label: "お知らせ",
    description: "企業のお知らせ・メディア・実績",
    icon: Newspaper,
    iconClassName: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  {
    href: "/sub/admin-console/blog",
    label: "ブログ",
    description: "課題解決記事・SEOコンテンツ",
    icon: BookOpenText,
    iconClassName: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
] as const;

const utilityLinks = [
  {
    href: "/sub/admin-console/nfc-links",
    label: "NFCリンク設定",
    description: "固定URLの遷移先を変更",
    icon: RadioTower,
    iconClassName: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
  },
  {
    href: "/sub/admin-console/my-life",
    label: "My Life 設定",
    description: "メッセージと画像を編集",
    icon: Heart,
    iconClassName: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },
] as const;

export default async function AdminConsoleIndexPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="secondary" className="rounded-lg">
            Admin Console
          </Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">管理トップ</h1>
          <p className="mt-2 text-sm text-muted-foreground">よく使う業務から順にまとめています。</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">表示中のデータを再取得</span>
          <AdminRefreshButton />
        </div>
      </header>

      <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-card to-amber-50 p-6 dark:border-orange-900/70 dark:from-orange-950/50 dark:via-card dark:to-amber-950/30 sm:p-8">
        <div className="absolute -right-10 -top-12 size-48 rounded-full bg-orange-200/35 blur-2xl dark:bg-orange-500/10" aria-hidden="true" />
        <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm shadow-orange-200 dark:bg-orange-500 dark:shadow-orange-950">
              <FileSignature className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-orange-700 dark:text-orange-300">CONTRACTS</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">電子契約管理</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                テンプレートからの契約書作成、PDF原本の登録、署名依頼、締結状況と証跡の確認を行います。
              </p>
            </div>
          </div>
          <Link
            href="/sub/admin-console/contracts"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-orange-500 dark:hover:bg-orange-400"
          >
            契約管理を開く
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">日々の業務</h2>
            <span className="text-xs text-muted-foreground">問い合わせ対応</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/sub/admin-console/results"
              className="group min-h-48 rounded-3xl bg-slate-950 p-5 text-white transition hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-slate-900 dark:ring-1 dark:ring-inset dark:ring-slate-800 dark:hover:bg-slate-800"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
                    <ClipboardList className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="truncate font-semibold">業務診断 回答一覧</h3>
                </div>
                <ArrowUpRight className="size-5 text-slate-500 transition group-hover:text-white" aria-hidden="true" />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-slate-400">相談内容の確認と対応ステータスの更新</p>
              <p className="mt-4 text-xs font-medium text-sky-300">最新100件まで表示</p>
            </Link>

            <Link
              href="/sub/admin-console/create-email"
              className="group min-h-48 rounded-3xl bg-violet-50 p-5 text-slate-950 ring-1 ring-inset ring-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-100/70 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-violet-950/40 dark:text-violet-50 dark:ring-violet-900 dark:hover:bg-violet-950/60"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
                    <Mail className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="truncate font-semibold">メール送信</h3>
                </div>
                <ArrowUpRight className="size-5 text-violet-400 transition group-hover:text-violet-700 dark:text-violet-500 dark:group-hover:text-violet-300" aria-hidden="true" />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-violet-200/70">問い合わせ返信・営業メールを個別送信</p>
              <p className="mt-4 text-xs font-medium text-violet-700 dark:text-violet-300">ブランドデザイン適用</p>
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border bg-card p-5 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">コンテンツ管理</h2>
              <p className="mt-1 text-xs text-muted-foreground">公開サイトの情報を更新</p>
            </div>
            <Badge variant="outline" className="rounded-lg">2項目</Badge>
          </div>
          <div className="mt-5 divide-y">
            {contentLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.iconClassName}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/50 transition group-hover:text-foreground" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-8 border-t pt-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <h2 className="text-sm font-semibold text-foreground">その他の設定</h2>
          {utilityLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group flex min-w-56 items-center gap-3 rounded-2xl p-2 transition hover:bg-muted/60">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${item.iconClassName}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">{item.description}</span>
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground/50 transition group-hover:text-foreground" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
