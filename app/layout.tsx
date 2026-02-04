import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { MainLayout } from "@/components/layout/main-layout";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

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
    icon: "/images/logo-02_MIT-normal.png",
    shortcut: "/images/logo-02_MIT-normal.png",
    apple: "/images/logo-02_MIT-normal.png",
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
    name: `${site.name} | DX事業`,
    url: site.url,
    alternateName: ["Make It Tech", "MIT", "メイクイットテック"],
  };

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground font-sans antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        />
        <ThemeProvider>
          <MainLayout>{children}</MainLayout>
          <Toaster richColors closeButton />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
