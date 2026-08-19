'use client';

import React from 'react';
import { Truck, Clock } from 'lucide-react';

export default function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8 text-black font-be-vietnam-pro gpu-layer">
      <div className="text-center space-y-2">
        <h1 className="font-be-vietnam-pro-black text-2xl sm:text-4xl font-black uppercase text-black tracking-tight">
          DELIVERY & SHIPPING DETAILS
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto font-medium">
          Fast, reliable, and trackable worldwide shipping on all fashion apparel orders.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="bg-[#F4F4F4] rounded-3xl p-5 sm:p-8 space-y-2.5 shadow-2xs">
          <Truck className="w-7 h-7 text-black" />
          <h3 className="font-bold text-base sm:text-lg text-black">Standard Shipping</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Delivered in 3-5 business days. Free for all orders over $150 ($15 flat rate for orders under $150).
          </p>
        </div>

        <div className="bg-[#F4F4F4] rounded-3xl p-5 sm:p-8 space-y-2.5 shadow-2xs">
          <Clock className="w-7 h-7 text-black" />
          <h3 className="font-bold text-base sm:text-lg text-black">Express Delivery</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Delivered in 1-2 business days with priority order processing and real-time SMS tracking updates.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-8 space-y-3 shadow-2xs">
        <h3 className="font-be-vietnam-pro-black text-base sm:text-xl font-black text-black border-b border-gray-100 pb-3 uppercase tracking-tight">
          INTERNATIONAL SHIPPING & DUTIES
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
          We ship to over 100+ countries worldwide. Customs duties and taxes are calculated transparently during checkout so there are no unexpected fees upon arrival.
        </p>
      </div>
    </div>
  );
}
