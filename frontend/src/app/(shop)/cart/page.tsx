'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Tag,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSizeSelection } from '@/context/SizeSelectionContext';
import { CartItemCard } from '@/components/shop/CartItemCard';
import { formatINR } from '@/lib/formatPrice';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, clearCart, cartCount, updateCartItemVariant } = useCart();
  const { requestCheckout } = useSizeSelection();
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'SUMMER2026' || promoCode.trim().toUpperCase() === 'LUMINA30') {
      setPromoDiscount(0.15);
      setPromoSuccess('Promo code applied! 15% discount added.');
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try SUMMER2026');
      setPromoSuccess('');
    }
  };

  const discountAmount = Math.round(cartSubtotal * promoDiscount * 100) / 100;
  const shippingCost = cartSubtotal > 1500 || cart.length === 0 ? 0 : 99;
  const estimatedTax = Math.round((cartSubtotal - discountAmount) * 0.08 * 100) / 100;
  const grandTotal = Math.round((cartSubtotal - discountAmount + shippingCost + estimatedTax) * 100) / 100;

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 py-4 sm:py-8 pb-16 font-be-vietnam-pro gpu-layer">
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-black font-semibold">Cart</span>
      </nav>

      <div className="flex flex-col gap-3 border-b border-gray-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black text-black uppercase tracking-tight">
              Your Cart
            </h1>
            <span className="rounded-full border border-black/10 bg-black/5 px-2.5 py-0.5 text-xs font-extrabold text-black">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500">
            Review your selected items and proceed to checkout when you are ready.
          </p>
        </div>

        <Link
          href="/product"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-black transition-colors hover:text-gray-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="mx-auto my-8 max-w-md space-y-4 rounded-3xl bg-[#F4F4F4] p-8 text-center sm:my-12 sm:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-2xs">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="font-be-vietnam-pro-black text-xl font-bold uppercase text-black">
            Your Cart is Empty
          </h2>
          <p className="text-xs font-medium leading-relaxed text-gray-500">
            Explore our curated collections and discover clothes matching your style.
          </p>
          <Link
            href="/product"
            className="inline-block rounded-full bg-black px-7 py-3 text-xs font-bold uppercase text-white shadow-md transition-all hover:bg-neutral-800"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-4 lg:col-span-7">
            {cart.map((item, idx) => (
              <CartItemCard
                key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}-${idx}`}
                item={item}
                onRemove={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                onIncrease={() =>
                  updateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)
                }
                onDecrease={() =>
                  updateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)
                }
                onSizeChange={(size, variantId) =>
                  updateCartItemVariant(idx, { size, variantId })
                }
              />
            ))}

            <div className="flex justify-between px-1">
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-red-500 transition-colors hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-5 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-7">
              <h3 className="border-b border-gray-100 pb-3.5 font-be-vietnam-pro-black text-lg font-black uppercase tracking-tight text-black sm:text-xl">
                Order Summary
              </h3>

              <div className="space-y-2.5 border-b border-gray-100 pb-4 text-xs font-medium text-gray-500 sm:text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">{formatINR(cartSubtotal)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between font-bold text-red-600">
                    <span>Discount (15%)</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black">
                    {shippingCost === 0 ? (
                      <span className="font-extrabold text-green-600">FREE</span>
                    ) : (
                      formatINR(shippingCost)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-black">{formatINR(estimatedTax)}</span>
                </div>

                <div className="flex justify-between border-t border-gray-100 pt-2.5 text-base font-black text-black sm:text-lg">
                  <span>Total</span>
                  <span>{formatINR(grandTotal)}</span>
                </div>
              </div>

              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full rounded-full bg-[#F4F4F4] py-2.5 pl-9 pr-3 text-xs font-bold uppercase text-black placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-neutral-800"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="flex items-center gap-1 pt-0.5 text-[11px] font-semibold text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {promoSuccess}
                  </p>
                )}
                {promoError && (
                  <p className="pt-0.5 text-[11px] font-semibold text-red-500">{promoError}</p>
                )}
              </form>

              <button
                type="button"
                onClick={requestCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-xs font-extrabold uppercase text-white shadow-md transition-all hover:bg-neutral-800 sm:text-sm"
              >
                Go to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[11px] font-medium text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                Secure SSL Encrypted Checkout
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
