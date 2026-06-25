import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { site } from "@/lib/site";
import { MainLayout } from "@/components/layout/main-layout";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { GaTracker } from "@/components/analytics/ga-tracker";
import { ChatWidgetScript } from "@/components/layout/chat-widget-script";

export const metadata: Metadata = {
  title: {
    default: site.searchName,
    template: `%s | ${site.searchName}`,
  },
  description: site.description,
  keywords: site.keywords,
  metadataBase: new URL(site.url),
  alternates: {
    canonical: "./",
  },
  applicationName: site.searchName,
  authors: [{ name: site.searchName, url: site.url }],
  creator: site.searchName,
  publisher: site.searchName,
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
    icon: "/images/logo-02_MIT-normal.png",
    shortcut: "/images/logo-02_MIT-normal.png",
    apple: "/images/logo-02_MIT-normal.png",
  },
  openGraph: {
    title: site.searchName,
    description: site.description,
    url: site.url,
    siteName: site.searchName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: site.ogImage ?? site.logo,
        width: 1200,
        height: 630,
        alt: site.searchName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.searchName,
    description: site.description,
    images: [site.ogImage ?? site.logo],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const logoUrl = new URL(site.logo, site.url).toString();
  const ogImageUrl = new URL(site.ogImage ?? site.logo, site.url).toString();
  const sameAs = Object.values(site.social).filter((value) => value);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#organization`,
    name: site.searchName,
    alternateName: site.alternateNames,
    url: site.url,
    logo: logoUrl,
    image: ogImageUrl,
    description: site.description,
    slogan: site.tagline,
    areaServed: [
      { "@type": "AdministrativeArea", name: "新潟県" },
      { "@type": "City", name: "新潟市" },
      { "@type": "City", name: "長岡市" },
      { "@type": "City", name: "上越市" },
      { "@type": "City", name: "三条市" },
      { "@type": "Country", name: "Japan" },
    ],
    serviceType: [
      "DX支援",
      "業務改善",
      "Web制作",
      "IT導入",
      "自動化", "アプリ開発",
      "LP制作",
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

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.searchName,
    url: site.url,
    alternateName: site.alternateNames,
  };

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        />
        <ChatWidgetScript />
        <ThemeProvider>
          <Suspense fallback={null}>
            <GaTracker />
          </Suspense>
          <MainLayout>{children}</MainLayout>
          <Toaster richColors closeButton />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
