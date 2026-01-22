import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Outfit, Zen_Kaku_Gothic_New } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const zen = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  metadataBase: new URL(site.url),
  icons: {
    icon: site.logo,
    shortcut: site.logo,
    apple: site.logo,
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: site.ogImage ?? site.logo,
        width: 768,
        height: 768,
        alt: site.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [site.ogImage ?? site.logo],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${outfit.variable} ${zen.variable} min-h-dvh bg-background text-foreground font-sans antialiased`}>
        <ThemeProvider>
          <SiteHeader />
          <main className="min-h-[calc(100dvh-64px)]">{children}</main>
          <SiteFooter />
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
