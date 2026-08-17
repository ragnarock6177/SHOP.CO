'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const siblingCount = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(
        currentPage + siblingCount,
        totalPages
      );

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 1;

      if (!showLeftDots && showRightDots) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push('...', totalPages);
      } else if (showLeftDots && !showRightDots) {
        pages.push(1, '...');
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 py-6 flex justify-center items-center border-t border-gray-200">
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Previous Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-black hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous Page"
        >
          <div className="p-2 rounded-full border border-gray-200 group-hover:border-black group-hover:bg-black group-hover:text-white transition-all">
            <ChevronLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </div>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Numbers Container */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F0F0F0] rounded-2xl border border-gray-200/80">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 font-bold text-xs"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = currentPage === pageNum;

            return (
              <button
                key={`page-${pageNum}-${index}`}
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-black text-white shadow-md shadow-black/20 scale-105 z-10'
                    : 'text-black hover:bg-white hover:text-black hover:shadow-sm'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-black hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <div className="p-2 rounded-full border border-gray-200 group-hover:border-black group-hover:bg-black group-hover:text-white transition-all">
            <ChevronRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </button>
      </div>
    </div>
  );
};
export default Pagination;
