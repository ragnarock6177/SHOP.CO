'use client';

import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="space-y-2 animate-pulse bg-white p-1.5 sm:p-2 rounded-2xl border border-gray-100"
        >
          {/* Image Box Placeholder matching 3:4 aspect ratio */}
          <div className="aspect-3/4 bg-[#F0EEED] rounded-xl w-full" />

          {/* Title Line Placeholder */}
          <div className="h-3 bg-gray-200 rounded-full w-3/4" />

          {/* Stars Placeholder */}
          <div className="flex items-center gap-1">
            <div className="h-2.5 bg-gray-200 rounded-full w-1/2" />
          </div>

          {/* Price Placeholder */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="h-3.5 bg-gray-200 rounded-full w-1/3" />
            <div className="h-2.5 bg-gray-200 rounded-full w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};
