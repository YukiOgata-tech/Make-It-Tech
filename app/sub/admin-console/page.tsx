import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  ClipboardList,
  FileSignature,
  Heart,
  Mail,
  Newspaper,
  RadioTower,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminRefreshButton } from "@/components/admin/admin-refresh-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "管理トップ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const primaryActions = [
  {
    href: "/sub/admin-console/results",
    label: "問い合わせを確認",
    description: "届いた相談内容を確認し、対応状況を更新します。",
    icon: ClipboardList,
    accent: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    href: "/sub/admin-console/contracts",
    label: "契約を管理",
    description: "契約書の作成から署名、締結後の管理まで行います。",
    icon: FileSignature,
    accent: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    href: "/sub/admin-console/expenses",
    label: "経費を登録",
    description: "領収書画像と経費情報を登録・整理します。",
    icon: ReceiptText,
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    href: "/sub/admin-console/create-email",
    label: "メールを送信",
    description: "Make It Techのデザインで個別メールを送信します。",
    icon: Mail,
    accent: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
] as const;

const managementGroups = [
  {
    title: "公開コンテンツ",
    description: "Webサイトに掲載する情報",
    items: [
      {
        href: "/sub/admin-console/news",
        label: "お知らせ",
        description: "企業情報・実績・メディア掲載",
        icon: Newspaper,
      },
      {
        href: "/sub/admin-console/blog",
        label: "ブログ",
        description: "課題解決記事・SEOコンテンツ",
        icon: BookOpenText,
      },
    ],
  },
  {
    title: "サービス設定",
    description: "提供中サービスの表示内容",
    items: [
      {
        href: "/sub/admin-console/nfc-links",
        label: "NFCリンク",
        description: "固定URLの遷移先を変更",
        icon: RadioTower,
      },
      {
        href: "/sub/admin-console/my-life",
        label: "My Life",
        description: "メッセージと画像を編集",
        icon: Heart,
      },
    ],
  },
] as const;

export default async function AdminConsoleIndexPage() {
  const session = await requireAdmin();

  return (
    <AdminPage>
      <section className="admin-surface overflow-hidden">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div>
              <Badge variant="secondary" className="mb-3 rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">
                Business Console
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                業務管理へようこそ
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                問い合わせ対応、契約、メール、コンテンツ更新など、日々の業務をここから進められます。
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                ログイン中: {session.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-muted/35 px-4 py-3">
            <div>
              <p className="text-xs font-semibold">最新データを取得</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">表示中のキャッシュを更新します</p>
            </div>
            <AdminRefreshButton />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-base font-semibold">すぐに始める</h2>
          <p className="mt-1 text-xs text-muted-foreground">日常的に使う業務メニュー</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="admin-surface group flex min-h-36 flex-col p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", action.accent)}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="min-w-0 flex-1 text-sm font-semibold leading-5">{action.label}</h3>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
                </div>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        {managementGroups.map((group) => (
          <div key={group.title} className="admin-surface p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">{group.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{group.description}</p>
              </div>
              <Badge variant="outline" className="rounded-md text-[10px]">
                {group.items.length}項目
              </Badge>
            </div>
            <div className="mt-5 divide-y divide-border">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </AdminPage>
  );
}
