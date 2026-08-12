'use client';

import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="space-y-3 animate-pulse bg-white p-2 sm:p-3 rounded-3xl border border-gray-100"
        >
          {/* Image Box Placeholder */}
          <div className="aspect-square bg-[#F0EEED] rounded-2xl w-full" />

          {/* Title Line Placeholder */}
          <div className="h-4 bg-gray-200 rounded-full w-3/4" />

          {/* Stars Placeholder */}
          <div className="flex items-center gap-2">
            <div className="h-3 bg-gray-200 rounded-full w-1/2" />
          </div>

          {/* Price Placeholder */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-5 bg-gray-200 rounded-full w-1/3" />
            <div className="h-4 bg-gray-200 rounded-full w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};
