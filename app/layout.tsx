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
  keywords: site.keywords,
  metadataBase: new URL(site.url),
  alternates: {
    canonical: "./",
  },
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  verification: {
    google: "google-site-verification=CODE_TO_REPLACE",
  },
  category: "business",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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

import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const logoUrl = new URL(site.logo, site.url).toString();
  const ogImageUrl = new URL(site.ogImage ?? site.logo, site.url).toString();
  const sameAs = Object.values(site.social).filter((value) => value);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: site.url,
    logo: logoUrl,
    image: ogImageUrl,
    description: site.description,
    slogan: site.tagline,
    areaServed: [
      { "@type": "AdministrativeArea", name: "新潟県" },
      { "@type": "Country", name: "Japan" },
    ],
    serviceType: [
      "DX支援",
      "業務改善",
      "Web制作",
      "IT導入",
      "自動化",
      "簡易システム構築",
    ],
    keywords: site.keywords,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${site.url}/contact`,
      availableLanguage: ["ja"],
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${outfit.variable} ${zen.variable} min-h-dvh bg-background text-foreground font-sans antialiased`}>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ThemeProvider>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <SiteBreadcrumbs />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
