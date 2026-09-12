"use client";

import React from "react";
import { Star, Check } from "lucide-react";

export const CustomerReviews: React.FC = () => {
  return (
    <section className="w-full py-12 sm:py-16 my-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 mb-8 sm:mb-12 text-center">
        <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-black/50 uppercase block mb-1.5 font-be-vietnam-pro">
          VERIFIED CUSTOMER TESTIMONIALS
        </span>
        <h2 className="font-be-vietnam-pro-black text-2xl sm:text-4xl lg:text-5xl font-black text-black uppercase tracking-tight">
          OUR HAPPY CUSTOMERS
        </h2>
        <p className="mt-4 text-sm text-gray-500 font-be-vietnam-pro">
          Customer reviews from verified AIRAVÉ purchases will appear here.
        </p>
      </div>

      <div className="max-w-xl mx-auto rounded-3xl border border-dashed border-gray-200 bg-[#FAFAFA] px-6 py-10 text-center">
        <div className="mx-auto mb-4 flex items-center justify-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star key={index} className="h-4 w-4 fill-black text-black" />
          ))}
        </div>
        <p className="font-be-vietnam-pro text-sm text-gray-600">
          Be the first to share your experience after purchasing from AIRAVÉ.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
          <Check className="h-3.5 w-3.5" />
          Reviews powered by live orders
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
