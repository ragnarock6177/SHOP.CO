'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShoppingBag, 
  Tag, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'SUMMER2026' || promoCode.trim().toUpperCase() === 'LUMINA30') {
      setPromoDiscount(0.15); // 15% discount
      setPromoSuccess('Promo code applied! 15% discount added.');
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try SUMMER2026');
      setPromoSuccess('');
    }
  };

  const discountAmount = Math.round(cartSubtotal * promoDiscount * 100) / 100;
  const shippingCost = cartSubtotal > 150 || cart.length === 0 ? 0 : 15;
  const estimatedTax = Math.round((cartSubtotal - discountAmount) * 0.08 * 100) / 100;
  const grandTotal = Math.round((cartSubtotal - discountAmount + shippingCost + estimatedTax) * 100) / 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6 pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black text-black">
            YOUR CART
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review your selected fashion items and proceed to checkout.
          </p>
        </div>

        <Link
          href="/product"
          className="text-xs text-black hover:text-gray-600 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-[#F0F0F0] rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-white text-gray-400 flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-be-vietnam-pro-black text-xl font-bold text-black">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Explore our curated collections and discover clothes matching your style.
          </p>
          <Link
            href="/product"
            className="inline-block px-8 py-3.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-full transition-all shadow-md"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 7 Columns: Cart Items Box */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="divide-y divide-gray-200">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="py-4 flex gap-4 items-center justify-between"
                  >
                    {/* Image & Details */}
                    <div className="flex gap-4 items-center">
                      <div className="w-24 h-24 bg-[#F0EEED] rounded-2xl overflow-hidden relative shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <Link href={`/product/${item.product.id}`}>
                          <h4 className="font-bold text-sm text-black hover:text-gray-600 transition-colors line-clamp-1">
                            {item.product.title}
                          </h4>
                        </Link>
                        <div className="text-xs text-gray-500 space-x-2">
                          {item.selectedColor && <span>Size: {item.selectedSize || 'M'}</span>}
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        </div>
                        <div className="font-extrabold text-base text-black pt-1">
                          ${item.product.price}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Trash */}
                    <div className="flex flex-col items-end gap-4">
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center bg-[#F0F0F0] rounded-full px-3 py-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                          className="p-1 text-black hover:text-gray-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                          className="p-1 text-black hover:text-gray-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center px-2">
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Right 5 Columns: Order Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="font-be-vietnam-pro-black text-xl font-black text-black border-b border-gray-200 pb-4">
                Order Summary
              </h3>

              {/* Breakdown */}
              <div className="space-y-3 text-sm text-gray-500 border-b border-gray-200 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">${cartSubtotal.toFixed(2)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-red-500 font-bold">
                    <span>Discount (15%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black">
                    {shippingCost === 0 ? <span className="text-green-600">FREE</span> : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-black">${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-black text-black pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Add promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-[#F0F0F0] rounded-full pl-10 pr-4 py-3 text-xs text-black placeholder-gray-400 focus:outline-none uppercase font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="text-xs text-green-600 flex items-center gap-1 font-medium pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {promoSuccess}
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-red-500 font-medium pt-1">{promoError}</p>
                )}
              </form>

              {/* Checkout Action Link */}
              <Link
                href="/checkout"
                className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                Go to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>256-bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
