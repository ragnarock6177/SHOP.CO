import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const beVietnamPro = Be_Vietnam_Pro({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "AIRAVÉ | Find Clothes That Matches Your Style",
  description:
    "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.",
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
        "font-sans",
        geist.variable,
      )}
    >
      <body
        className={`${beVietnamPro.className} font-be-vietnam-pro bg-white text-black min-h-screen flex flex-col antialiased selection:bg-black selection:text-white`}
      >
        <Toaster position="top-right" richColors />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

