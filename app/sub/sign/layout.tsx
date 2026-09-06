import type { Metadata } from "next";
import { signSite } from "@/content/sign/site";

export const metadata: Metadata = {
  metadataBase: new URL(signSite.url),
  title: { default: signSite.name, template: `%s | ${signSite.name}` },
  description: "Make It Techから送付された契約書を安全に確認し、契約意思を記録するための専用ページです。",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function SignLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-slate-50 text-slate-950">{children}</div>;
}
