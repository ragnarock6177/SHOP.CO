import React from "react";
import "../globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { GhostScrollbar } from "@/components/common/GhostScrollbar";
import { ShopAuthGate } from "@/components/auth/ShopAuthGate";
import { getStorefrontSettingsApi } from "@/lib/settingsApi";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStorefrontSettingsApi();

  return (
    <CartProvider>
      <Header initialAnnouncement={settings?.header?.announcementBar} />
      <CartDrawer />
      <ShopAuthGate>
        <main className="flex-1 w-full mx-auto">{children}</main>
      </ShopAuthGate>
      <Footer />
      <GhostScrollbar />
    </CartProvider>
  );
}
