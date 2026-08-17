import type { Metadata } from "next";
import { Inter, Montserrat, Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-integral-cf",
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
        inter.variable,
        montserrat.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body
        className={`${inter.className} font-satoshi bg-white text-black min-h-screen flex flex-col antialiased selection:bg-black selection:text-white`}
      >
        <Toaster position="top-right" richColors />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

