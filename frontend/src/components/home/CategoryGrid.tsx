'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DRESS_STYLES } from '../../data/mockData';

export const CategoryGrid: React.FC = () => {
  return (
    <section className="bg-[#F0F0F0] rounded-3xl p-6 sm:p-12 mx-4 sm:mx-6 lg:mx-8 my-12">
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Heavy Display Title */}
        <h2 className="font-integral text-3xl sm:text-4xl lg:text-5xl font-black text-black text-center tracking-tight">
          BROWSE BY DRESS STYLE
        </h2>

        {/* Dress Style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DRESS_STYLES.map((style) => (
            <Link
              key={style.id}
              href={`/shop?category=${style.slug}`}
              className={`group relative h-60 sm:h-72 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 ${style.gridSpan}`}
            >
              {/* Background Image */}
              <Image
                src={style.image}
                alt={style.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* White Fade Overlay for text readability */}
              <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/30 to-transparent p-6 sm:p-8 flex items-start">
                <h3 className="font-bold text-2xl sm:text-3xl text-black">
                  {style.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
