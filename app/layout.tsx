import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BRAND, SITE_URL, TAGLINE } from "@/lib/site";

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

/* Headlines only. Baskerville is a text serif — at UI sizes it reads
   heavy and dated, so body copy stays on Geist. */
const libreBaskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  /* Without metadataBase, OG and Twitter image URLs resolve relative and
     break the moment anyone shares a link. Swap SITE_URL in lib/site.ts for
     the real domain before launch. */
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND}: Active cooling backpack panel`,
    template: `%s · ${BRAND}`,
  },
  /* Targets, flagged as targets — this string is quoted verbatim in search
     results, which makes it exactly the wrong place for an unqualified claim. */
  description: `${TAGLINE} A single brushless fan and a tensioned spacer mesh panel, in development. Design targets: 9–12 hour runtime, 26 dB, 168 g. Not yet built, tested, or for sale.`,
  applicationName: BRAND,
  openGraph: {
    title: `${BRAND}: Active cooling backpack panel`,
    description: TAGLINE,
    siteName: BRAND,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND}: Active cooling backpack panel`,
    description: TAGLINE,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
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
      className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      {/* Grammarly and similar extensions inject attributes onto <body>
          before React hydrates (data-gr-ext-installed, ...), which React
          reports as a mismatch. Scoped to this element only. */}
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-ink text-fg"
      >
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
