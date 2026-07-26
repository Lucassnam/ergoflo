import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BRAND, TAGLINE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND} — Active cooling backpack panel`,
    template: `%s · ${BRAND}`,
  },
  description: `${TAGLINE} Dual brushless fans and a tensioned spacer mesh panel that feels up to 25°F cooler against your back. 46-hour runtime, 26 dB, 168 g.`,
  applicationName: BRAND,
  openGraph: {
    title: `${BRAND} — Active cooling backpack panel`,
    description: TAGLINE,
    siteName: BRAND,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} — Active cooling backpack panel`,
    description: TAGLINE,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink text-fg">
        <a
          href="#main"
          className="glow-btn sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:px-5 focus:py-2.5 focus:text-sm"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
