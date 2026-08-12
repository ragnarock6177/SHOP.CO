'use client';

import React from 'react';
import { Truck, Clock, ShieldCheck, RefreshCw } from 'lucide-react';

export default function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-black">
      <div className="text-center space-y-2">
        <h1 className="font-integral text-3xl sm:text-4xl font-black uppercase text-black">
          DELIVERY & SHIPPING DETAILS
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
          Fast, reliable, and trackable worldwide shipping on all fashion apparel orders.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
        <div className="bg-[#F0F0F0] rounded-3xl p-6 sm:p-8 space-y-3">
          <Truck className="w-8 h-8 text-black" />
          <h3 className="font-bold text-lg text-black">Standard Shipping</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Delivered in 3-5 business days. Free for all orders over $150 ($15 flat rate for orders under $150).
          </p>
        </div>

        <div className="bg-[#F0F0F0] rounded-3xl p-6 sm:p-8 space-y-3">
          <Clock className="w-8 h-8 text-black" />
          <h3 className="font-bold text-lg text-black">Express Delivery</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Delivered in 1-2 business days with priority order processing and real-time SMS tracking updates.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="font-integral text-xl font-black text-black border-b border-gray-200 pb-4 uppercase">
          INTERNATIONAL SHIPPING & DUTIES
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          We ship to over 100+ countries worldwide. Customs duties and taxes are calculated transparently during checkout so there are no unexpected fees upon arrival.
        </p>
      </div>
    </div>
  );
}
