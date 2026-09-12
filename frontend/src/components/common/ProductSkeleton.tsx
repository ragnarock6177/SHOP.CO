'use client';

import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm"
        >
          <div className="aspect-[3/4] bg-[#F3F2F0]" />
          <div className="space-y-3 px-4 py-4">
            <div className="h-2.5 w-16 rounded-full bg-neutral-200" />
            <div className="h-4 w-4/5 rounded-full bg-neutral-200" />
            <div className="h-3 w-1/2 rounded-full bg-neutral-200" />
            <div className="h-5 w-1/3 rounded-full bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
};
