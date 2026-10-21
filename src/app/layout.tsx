import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AIChatWidget } from "@/components/AIChatWidget";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LanguageProvider } from "@/lib/LanguageContext";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";

export const metadata: Metadata = {
  title: {
    default: "AutoRent AI — Smart Car Rental Egypt | تأجير سيارات ذكي",
    template: "%s | AutoRent AI",
  },
  description:
    "Egypt's premier AI-powered car rental platform. Rent verified cars in Cairo, Giza, Aswan, Alexandria & Hurghada with instant AI damage inspection, fair deposits, and zero dispute return. احجز سيارتك الآن بأفضل الأسعار وبدون تعقيدات.",
  keywords: [
    // English keywords
    "car rental egypt",
    "rent a car cairo",
    "aswan car rental",
    "car rental alexandria",
    "hurghada car hire",
    "cheap car rental egypt",
    "luxury car rental egypt",
    "suv rental cairo",
    "monthly car rental egypt",
    "airport car rental egypt",
    "ai damage detection",
    "smart car rental",
    "AutoRent AI",
    "rent car online egypt",
    "cairo car hire",
    "roadtrip planner egypt",
    // Arabic keywords (high search volume in Egypt)
    "تأجير سيارات مصر",
    "ايجار سيارات القاهرة",
    "تاجير سيارات اسوان",
    "ايجار سيارات الاسكندرية",
    "مكتب تأجير سيارات",
    "حجز سيارة اونلاين",
    "ارخص ايجار سيارات مصر",
    "ايجار سيارات مرسيدس",
    "ايجار سيارات بالسائق وبدون",
    "سيارات للايجار في مصر",
    "ايجار سيارات مطار القاهرة",
    "فحص السيارات بالذكاء الاصطناعي",
  ],
  authors: [{ name: "AutoRent AI" }],
  creator: "AutoRent AI",
  publisher: "AutoRent AI",
  metadataBase: new URL("https://web-omega-weld-89.vercel.app"),
  alternates: {
    canonical: "https://web-omega-weld-89.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "i-nXWh1VLkN_9Q0zTQd6rmvXA5S_zgRsLkzOn0Jq5Yc",
  },
  // Step 14: Don't expose framework/version info
  other: {
    "X-Powered-By": "",
  },
  openGraph: {
    title: "AutoRent AI — Smart Car Rental Platform Egypt",
    description: "Rent verified cars with AI damage detection and transparent instant booking across Egypt.",
    url: "https://web-omega-weld-89.vercel.app",
    siteName: "AutoRent AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoRent AI — Smart Car Rental Platform",
    description: "Egypt's premier AI-powered car rental platform. Rent smarter, return safer.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AutoRental",
      "@id": "https://web-omega-weld-89.vercel.app/#autorental",
      name: "AutoRent AI",
      alternateName: "أوتورنت لتأجير السيارات",
      description: "AI-powered car rental platform with automated damage assessment, instant booking, and transparent deposit settlement across Egypt.",
      url: "https://web-omega-weld-89.vercel.app",
      logo: "https://web-omega-weld-89.vercel.app/favicon.ico",
      priceRange: "$$",
      currenciesAccepted: "EGP, USD",
      paymentAccepted: "Cash, Credit Card, Debit Card, Online Payment",
      areaServed: [
        { "@type": "Country", name: "Egypt" },
        { "@type": "City", name: "Cairo" },
        { "@type": "City", name: "Giza" },
        { "@type": "City", name: "Aswan" },
        { "@type": "City", name: "Alexandria" },
        { "@type": "City", name: "Hurghada" },
        { "@type": "City", name: "Sharm El Sheikh" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Car Rental Fleet",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Car",
              name: "Economy & Daily Commuter Cars",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Car",
              name: "Executive & Luxury SUVs",
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://web-omega-weld-89.vercel.app/#website",
      url: "https://web-omega-weld-89.vercel.app",
      name: "AutoRent AI",
      inLanguage: ["en", "ar"],
      potentialAction: {
        "@type": "SearchAction",
        target: "https://web-omega-weld-89.vercel.app/fleet?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Step 2: Canonical HTTPS URL */}
        <link rel="canonical" href="https://web-omega-weld-89.vercel.app" />
        <meta name="google-site-verification" content="i-nXWh1VLkN_9Q0zTQd6rmvXA5S_zgRsLkzOn0Jq5Yc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Step 14: Wrap entire app in error boundary — no raw errors shown to users */}
        <LanguageProvider>
          <ErrorBoundary>
            {children}
            {/* Global AI Chat Advisor — available on every page */}
            <AIChatWidget />
            {/* Instant WhatsApp Support Widget */}
            <WhatsAppSupport />
            <SpeedInsights />
          </ErrorBoundary>
        </LanguageProvider>
      </body>
    </html>
  );
}
