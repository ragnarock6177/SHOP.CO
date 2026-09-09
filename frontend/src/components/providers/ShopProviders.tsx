"use client";

import { CartProvider } from "@/context/CartContext";
import { SizeSelectionProvider } from "@/context/SizeSelectionContext";

export function ShopProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SizeSelectionProvider>{children}</SizeSelectionProvider>
    </CartProvider>
  );
}
