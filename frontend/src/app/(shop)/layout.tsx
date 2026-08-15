import type { Metadata } from "next";
import { Inter, Montserrat, Geist } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { GhostScrollbar } from "@/components/common/GhostScrollbar";
import { cn } from "@/lib/utils";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Header />
      <CartDrawer />
      <main className="flex-1 w-full mx-auto">{children}</main>
      <Footer />
      <GhostScrollbar />
    </CartProvider>
  );
}
