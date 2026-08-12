'use client';

import React from 'react';

export const BrandBanner: React.FC = () => {
  return (
    <section id="brands" className="bg-black py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-between gap-8 sm:gap-12 text-white">
        <span className="font-serif font-black text-2xl sm:text-3xl tracking-widest hover:opacity-80 transition-opacity">
          VERSACE
        </span>
        <span className="font-sans font-black text-2xl sm:text-3xl tracking-tighter hover:opacity-80 transition-opacity">
          ZARA
        </span>
        <span className="font-serif font-bold text-2xl sm:text-3xl tracking-widest hover:opacity-80 transition-opacity">
          GUCCI
        </span>
        <span className="font-sans font-black text-2xl sm:text-3xl tracking-wider hover:opacity-80 transition-opacity">
          PRADA
        </span>
        <span className="font-sans font-semibold text-xl sm:text-2xl tracking-normal hover:opacity-80 transition-opacity">
          Calvin Klein
        </span>
      </div>
    </section>
  );
};
