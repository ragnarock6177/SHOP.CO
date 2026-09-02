import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/Toaster";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "AIRAVÉ | Admin Panel",
  description: "E-Commerce Admin Panel for AIRAVE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${beVietnamPro.variable} h-full overflow-hidden antialiased`}
    >
      <body className="h-full w-full overflow-hidden flex flex-col font-sans bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
