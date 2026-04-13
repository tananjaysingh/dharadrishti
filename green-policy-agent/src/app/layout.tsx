import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dharadrishti.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "DharaDrishti | धरादृष्टि — Smart Environmental Policy Mapping Platform",
    template: "%s | DharaDrishti"
  },
  description: "DharaDrishti (धरादृष्टि) — India's Smart Environmental Policy Mapping Platform. Understand land status, environmental risks, protected zones, and government policies through interactive GIS dashboards. Built for citizens, farmers, NGOs, and legal professionals.",
  keywords: [
    "DharaDrishti", "धरादृष्टि", "Land Ownership India", "Environmental Policy",
    "GIS Dashboard", "Land Rights", "Smart Mapping", "Protected Zones",
    "Government Land Portal", "भूमि अधिकार", "पर्यावरण नीति", "स्मार्ट मैपिंग"
  ],
  authors: [{ name: "DharaDrishti Team" }],
  creator: "DharaDrishti",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    title: "DharaDrishti — Smart Environmental Policy Mapping Platform",
    description: "India's Smart Environmental Policy Mapping Platform. Access land records, environmental risk zones, and government schemes through interactive maps.",
    siteName: "DharaDrishti | धरादृष्टि",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "DharaDrishti — Smart Environmental Policy Mapping Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DharaDrishti — धरादृष्टि",
    description: "Smart Environmental Policy Mapping Platform for India. Explore land zones, track policies, and monitor environmental risks.",
    images: [`${SITE_URL}/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
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
    // Add your Google Search Console verification code here
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-foreground",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
