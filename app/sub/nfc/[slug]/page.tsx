import type { Metadata } from "next";
import Link from "next/link";
import { NfcEmitter } from "../_components/nfc-emitter";
import { NfcRedirectLoader } from "../_components/nfc-redirect-loader";
import { getManagedNfcLink } from "@/lib/nfc-managed-links";
import { nfcHref } from "@/content/nfc/site";

export const metadata: Metadata = {
  title: "リンクを開いています",
  description: "NFCタグに設定されたページへ移動します。",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ManagedNfcRedirectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ManagedNfcRedirectPage({
  params,
}: ManagedNfcRedirectPageProps) {
  const { slug } = await params;

  let link = null;
  try {
    link = await getManagedNfcLink(slug);
  } catch {
    link = null;
  }

  if (link?.enabled) {
    return (
      <NfcRedirectLoader
        label={link.label}
        destinationUrl={link.destinationUrl}
      />
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-md text-center">
        <p className="nfc-label" style={{ color: "var(--nfc-alert)" }}>
          Link unavailable
        </p>
        <div className="mt-9 flex justify-center opacity-60">
          <NfcEmitter size="md" />
        </div>
        <h1 className="nfc-display mt-9 text-2xl">現在このリンクは利用できません</h1>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--nfc-dim)" }}>
          遷移先がまだ設定されていないか、一時的に停止されています。
        </p>
        <Link
          href={nfcHref("/")}
          className="nfc-display mt-9 inline-flex h-11 items-center px-6 text-sm"
          style={{ border: "1px solid var(--nfc-line-bright)" }}
        >
          NFCサイトへ戻る
        </Link>
        <p className="nfc-label mt-14">Make It Tech / NFC Field</p>
      </div>
    </main>
  );
}
