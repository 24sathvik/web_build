import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Exo, Roboto_Mono } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL, SOCIALS } from "@/lib/site";
import { siteContent } from "@/content/site";
import { DebugOverlay } from "@/components/dom/DebugOverlay";

const exo = Exo({
  variable: "--font-exo",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const allowIndexing = process.env.ALLOW_INDEXING === "true";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ZYXEN – Digital Solutions & Creative Agency",
    template: "%s | ZYXEN",
  },
  description:
    "ZYXEN builds high-performance digital products, websites, branding, and solutions with modern design and smooth user experience.",
  keywords: [
    "Zyxen", "Zyxen Agency", "Creative Agency", "Web Development", "Digital Solutions",
    "software solutions", "AI solutions", "website development", "custom software development",
    "business automation", "AI integration services", "digital transformation",
    "web application development", "enterprise software", "scalable architecture",
    "AI Development Company", "Automation Solutions", "Cloud Engineering",
  ],
  robots: allowIndexing ? "index, follow" : "noindex, nofollow",
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-IN": SITE_URL,
    },
    types: {
      "application/rss+xml": `${SITE_URL}/blogs/feed.xml`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: (process.env.NEXT_PUBLIC_BING_VERIFICATION || process.env.BING_VERIFICATION)
      ? { "msvalidate.01": (process.env.NEXT_PUBLIC_BING_VERIFICATION || process.env.BING_VERIFICATION)! }
      : undefined,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: { siteName: SITE_NAME, locale: "en_IN", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/previews/logo.png` },
      sameAs: SOCIALS,
      telephone: siteContent.contact.phones,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteContent.contact.address,
        addressLocality: siteContent.contact.city,
        addressRegion: siteContent.contact.state,
        addressCountry: "IN",
      },
      areaServed: "India",
      contactPoint: siteContent.contact.phones.map((phone) => ({
        "@type": "ContactPoint",
        telephone: phone,
        email: CONTACT_EMAIL,
        contactType: "customer service",
        areaServed: "India",
      })),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": ["ProfessionalService", "LocalBusiness"],
      "@id": `${SITE_URL}/#localbusiness`,
      name: SITE_NAME,
      url: SITE_URL,
      email: CONTACT_EMAIL,
      telephone: siteContent.contact.phones,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteContent.contact.address,
        addressLocality: siteContent.contact.city,
        addressRegion: siteContent.contact.state,
        addressCountry: "IN",
      },
      areaServed: "India",
      sameAs: SOCIALS,
      contactPoint: siteContent.contact.phones.map((phone) => ({
        "@type": "ContactPoint",
        telephone: phone,
        email: CONTACT_EMAIL,
        contactType: "customer service",
        areaServed: "India",
      })),
      description:
        "ZYXEN is a digital solutions and creative agency building high-performance websites, branding, and software products.",
      image: `${SITE_URL}/previews/og-image.png`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={clsx(
        exo.variable,
        robotoMono.variable,
        "h-full antialiased dark" // Force dark mode as it's a cinematic dark experience
      )}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-white overflow-x-hidden selection:bg-[#00D9FF] selection:text-black">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <DebugOverlay />
        {children}
      </body>
    </html>
  );
}
