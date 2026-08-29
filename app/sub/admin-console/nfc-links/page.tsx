import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NfcLinkForm } from "@/components/admin/nfc-link-form";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getManagedNfcLink,
  getManagedNfcPublicUrl,
  NFC_TEST_SLUG,
} from "@/lib/nfc-managed-links";

export const metadata: Metadata = {
  title: "NFCリンク設定",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminNfcLinksPage() {
  await requireAdmin();

  let link = null;
  let loadError = false;
  try {
    link = await getManagedNfcLink(NFC_TEST_SLUG);
  } catch {
    loadError = true;
  }

  const publicUrl = getManagedNfcPublicUrl(NFC_TEST_SLUG);

  return (
    <div className="mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="secondary" className="rounded-xl">
            Developer Preview
          </Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            NFCリンク設定
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            NFCタグの固定URLは変えず、ここで最終的な遷移先だけを切り替えます。
          </p>
        </div>
        <Badge
          variant="outline"
          className={`rounded-xl ${
            link?.enabled
              ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
              : "border-amber-500/40 text-amber-700 dark:text-amber-300"
          }`}
        >
          {link?.enabled ? "有効" : "未設定 / 停止中"}
        </Badge>
      </div>

      <Card className="mt-8 rounded-3xl">
        <CardHeader>
          <CardTitle>custom-test</CardTitle>
          <CardDescription>
            開発者確認用の最初のリンクです。将来は同じ仕組みで契約者ごとのリンクを追加します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Firebaseから現在の設定を取得できませんでした。接続設定を確認してください。
            </p>
          ) : (
            <NfcLinkForm
              slug={NFC_TEST_SLUG}
              publicUrl={publicUrl}
              initialLabel={link?.label ?? "リンク先を開いています"}
              initialDestinationUrl={link?.destinationUrl ?? ""}
              initialEnabled={link?.enabled ?? true}
            />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-3xl border-dashed">
        <CardHeader>
          <CardTitle className="text-base">将来の契約者提供に向けたデータ構造</CardTitle>
          <CardDescription>
            リンクIDに加えて所有者と組織を保持できる構造にしてあります。今回のテスト設定は管理者のみ編集できます。
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
