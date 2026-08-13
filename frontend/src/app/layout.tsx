import type { Metadata } from "next";
import { Inter, Montserrat, Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { CartDrawer } from "../components/layout/CartDrawer";
import { GhostScrollbar } from "../components/common/GhostScrollbar";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
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
        <CartProvider>
          <Header />
          <CartDrawer />
          <main className="flex-1 w-full mx-auto">{children}</main>
          <Footer />
          <GhostScrollbar />
        </CartProvider>
      </body>
    </html>
  );
}
