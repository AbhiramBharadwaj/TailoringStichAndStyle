import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const site = "https://silaaighar.netlify.app";
const og = `${site}/custom-stitching-studio.png`; // ensure this URL 200s

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Silaaighar - Premium Tailoring Services for Busy Women",
  description:
    "Professional tailoring, stitching, embroidery, and alterations with convenient pickup and delivery.",
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
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <style>{`
html {
  font-family: ${inter.style.fontFamily};
  --font-serif: ${playfair.variable};
  --font-sans: ${inter.variable};
}
        `}</style>
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
