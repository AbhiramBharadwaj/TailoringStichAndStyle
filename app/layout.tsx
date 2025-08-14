// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const site = "https://silaaighar.netlify.app";
const og = `${site}/custom-stitching-studio.png`; // make sure this URL returns 200

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Silaaighar - Premium Tailoring Services for Busy Women",
  description:
    "Professional tailoring, stitching, embroidery, and alterations with convenient pickup and delivery.",
  keywords:
    [
      "tailoring",
      "stitching",
      "embroidery",
      "alterations",
      "custom clothing",
      "saree work",
      "pickup delivery",
      "women tailoring services",
    ],
  authors: [{ name: "Silaaighar" }],
  openGraph: {
    type: "website",
    siteName: "Silaaighar",
    url: site,
    title: "Silaaighar - Premium Tailoring Services",
    description:
      "Professional tailoring services with pickup and delivery for busy women",
    images: [
      {
        url: og,
        secureUrl: og,
        width: 1200,
        height: 630,
        alt: "Silaaighar Premium Tailoring Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Silaaighar - Premium Tailoring Services",
    description:
      "Professional tailoring services with pickup and delivery for busy women",
    images: [og],
  },
  // optional, shows up as a meta tag
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Map Next Font variables to your CSS tokens and set default font */}
        <style>{`
          html {
            /* wire the google font vars to your own tokens */
            --font-serif: var(--font-playfair);
            --font-sans: var(--font-inter);
            /* default text font */
            font-family: var(--font-sans);
          }
        `}</style>
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
