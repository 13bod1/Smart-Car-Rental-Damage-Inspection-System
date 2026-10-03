import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoRent AI — Smart Car Rental Platform",
  description:
    "AI-powered car rental platform with automatic damage assessment and vehicle valuation. Rent smarter, return safer.",
  keywords: ["car rental", "AI damage detection", "vehicle valuation", "Egypt"],
  openGraph: {
    title: "AutoRent AI — Smart Car Rental Platform",
    description: "AI-powered car rental with automatic damage assessment.",
    type: "website",
  },
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
      </head>
      <body>{children}</body>
    </html>
  );
}
