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

export const metadata: Metadata = {
  title: "Stitch & Style - Premium Tailoring Services for Busy Women",
  description:
    "Professional tailoring, stitching, embroidery, and alterations with convenient pickup and delivery. Custom clothing creation, saree work, and repairs for busy working women.",
  keywords:
    "tailoring, stitching, embroidery, alterations, custom clothing, saree work, pickup delivery, women tailoring services",
  authors: [{ name: "Stitch & Style" }],
  openGraph: {
    title: "Stitch & Style - Premium Tailoring Services",
    description: "Professional tailoring services with pickup and delivery for busy women",
    type: "website",
  },
    generator: 'v0.app'
}

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
