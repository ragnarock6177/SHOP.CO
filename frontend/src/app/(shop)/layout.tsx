import React from "react";
import "../globals.css";
import { ShopProviders } from "@/components/providers/ShopProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
    <ShopProviders>
      <Header initialAnnouncement={settings?.header?.announcementBar} />
      <ShopAuthGate>
        <main className="flex-1 w-full mx-auto">{children}</main>
      </ShopAuthGate>
      <Footer />
      <GhostScrollbar />
    </ShopProviders>
  );
}
