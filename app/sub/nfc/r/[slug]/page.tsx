import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { findNfcLink, resolveTarget } from "@/content/nfc/redirects";
import { NfcAppLauncher } from "../../_components/nfc-app-launcher";

/**
 * NFCタグに書き込む中間URL（nfc.make-it-tech.com/r/{slug}）。
 *
 * かざされた時点で行き先を決めるため、キャッシュせずに毎回評価する。
 * タグ自体は書き換えないので、行き先の変更はこのアプリ側だけで完結する。
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type PageProps = {
  params?: Promise<{ slug: string }>;
};

export default async function NfcRedirectPage({ params }: PageProps) {
  const { slug } = (await params) ?? { slug: "" };
  const link = findNfcLink(slug);

  if (!link) {
    notFound();
  }

  const target = resolveTarget(link);

  // 通常のURLはサーバー側でそのまま飛ばす（中間ページを見せない）
  if (target.kind === "url") {
    redirect(target.url);
  }

  // アプリを開く場合は、インストール有無を端末側でしか判定できないため
  // クライアントコンポーネントに委ねる
  return (
    <NfcAppLauncher
      label={target.label}
      appUrl={target.appUrl}
      webUrl={target.webUrl}
    />
  );
}
