'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    clearCart
  } = useCart();

  const shippingCost = cartSubtotal > 150 || cart.length === 0 ? 0 : 15;
  const estimatedTax = Math.round(cartSubtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((cartSubtotal + shippingCost + estimatedTax) * 100) / 100;

  return (
    <div
      className={`fixed inset-0 h-[100dvh] z-50 overflow-hidden transition-all duration-300 ${
        isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop overlay with smooth fade */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 h-[100dvh]">
        {/* Right drawer panel with smooth spring slide animation */}
        <div
          className={`w-screen max-w-md h-[100dvh] bg-white text-black flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="font-be-vietnam-pro-black text-lg font-black tracking-tight">Your Cart</h2>
              <span className="bg-black text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-[#F0F0F0] flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black">Your cart is empty</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Explore our latest clothing collections and add items to your cart.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium text-xs rounded-full transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}-${idx}`}
                  className="flex gap-4 p-3 bg-[#F0F0F0] rounded-2xl relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden relative shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-black line-clamp-1">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center bg-white rounded-full px-2 py-0.5 border border-gray-200">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.selectedColor,
                              item.selectedSize
                            )
                          }
                          className="p-1 text-black hover:text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.selectedColor,
                              item.selectedSize
                            )
                          }
                          className="p-1 text-black hover:text-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-extrabold text-black">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-black pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Secure SSL Encrypted Checkout</span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-4 rounded-full bg-black hover:bg-gray-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  Go to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={clearCart}
                  className="w-full py-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
