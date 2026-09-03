import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-be-vietnam-pro",
});

const siteBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://frontend-beta-murex-33.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: "AIRAVÉ — High-Fashion Streetwear & Contemporary Apparel",
    template: "%s | AIRAVÉ",
  },
  description:
    "Discover minimalist luxury streetwear, heavyweight oversized tailoring, and contemporary monochrome apparel.",
  keywords: [
    "AIRAVÉ",
    "streetwear",
    "luxury fashion",
    "oversized t-shirts",
    "linen shirts",
    "pleated trousers",
    "monochrome apparel",
  ],
  authors: [{ name: "Janak Katariya" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteBaseUrl,
    siteName: "AIRAVÉ",
    title: "AIRAVÉ — High-Fashion Streetwear & Contemporary Apparel",
    description:
      "Discover minimalist luxury streetwear, heavyweight oversized tailoring, and contemporary monochrome apparel.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "AIRAVÉ Luxury Fashion & Streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIRAVÉ — High-Fashion Streetwear & Contemporary Apparel",
    description:
      "Discover minimalist luxury streetwear, heavyweight oversized tailoring, and contemporary monochrome apparel.",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200",
    ],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        beVietnamPro.variable,
        "font-be-vietnam-pro",
      )}
    >
      <head>
        {/* Preconnect to external origins used for images and API — reduces critical path latency */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://nnuzjdapofveowjrxtkp.supabase.co" />
        <link rel="dns-prefetch" href="https://backend-rho-umber-75.vercel.app" />
      </head>
      <body
        className={`${beVietnamPro.className} font-be-vietnam-pro bg-white text-black min-h-dvh flex flex-col antialiased selection:bg-black selection:text-white`}
      >
        <Toaster position="top-right" richColors />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
