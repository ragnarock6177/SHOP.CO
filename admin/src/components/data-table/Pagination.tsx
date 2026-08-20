"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/types/api";

export interface PaginationProps {
  pagination?: PaginationMeta;
  currentPage?: number;
  totalPages?: number;
  total?: number;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
  className?: string;
  showSummary?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage: propCurrentPage,
  totalPages: propTotalPages,
  total: propTotal,
  isLoading = false,
  onPageChange,
  className = "",
  showSummary = true,
}) => {
  const currentPage = propCurrentPage ?? pagination?.page ?? 1;
  const totalPages = propTotalPages ?? pagination?.totalPages ?? 1;
  const total = propTotal ?? pagination?.total ?? 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const siblingCount = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 1;

      if (!showLeftDots && showRightDots) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push("...", totalPages);
      } else if (showLeftDots && !showRightDots) {
        pages.push(1, "...");
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
    if (pagination && pagination.total <= 10) return null;
    return (
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-3.5 bg-slate-50/40 ${className}`}
      >
        <div className="h-3.5 w-48 rounded-md animate-shimmer bg-slate-100" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-xl animate-shimmer bg-slate-100 border border-slate-200/60" />
          <div className="h-8 w-36 rounded-xl animate-shimmer bg-slate-100 border border-slate-200/60" />
          <div className="h-8 w-16 rounded-xl animate-shimmer bg-slate-100 border border-slate-200/60" />
        </div>
      </div>
    );
  }

  // Only show pagination if total items > 10 and totalPages > 1
  if (totalPages <= 1 || (total > 0 && total <= 10)) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-3 bg-slate-50/40 text-xs text-slate-500 ${className}`}
    >
      {/* Summary Info */}
      {showSummary && (
        <div className="text-slate-500 font-medium">
          Showing page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
          <span className="font-bold text-slate-900">{totalPages}</span>
          {total > 0 && <span> ({total} total items)</span>}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="group flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-900 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Previous Page"
        >
          <div className="p-1.5 rounded-full border border-slate-200 bg-white group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
            <ChevronLeft
              size={13}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </div>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Numbers Container */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 shadow-2xs">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${index}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 font-bold text-[11px]"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = currentPage === pageNum;

            return (
              <button
                type="button"
                key={`page-${pageNum}-${index}`}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs scale-105 z-10"
                    : "text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-2xs"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="group flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-900 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <div className="p-1.5 rounded-full border border-slate-200 bg-white group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
            <ChevronRight
              size={13}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
