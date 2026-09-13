import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function CheckoutEmptyCart() {
  return (
    <div className="bg-[#F4F4F4] rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto my-8">
      <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
      <h2 className="font-be-vietnam-pro-black text-lg font-bold text-black uppercase">
        Your Cart is Empty
      </h2>
      <Link
        href="/product"
        className="inline-block px-7 py-3 bg-black text-white font-extrabold text-xs uppercase rounded-full"
      >
        Browse Collections
      </Link>
    </div>
  );
}
