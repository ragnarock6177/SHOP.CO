"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/types/api";

export interface PaginationProps {
  pagination?: PaginationMeta;
  currentPage: number;
  totalPages?: number;
  total?: number;
  isLoading?: boolean;
  isFetching?: boolean;
  onPageChange: (newPage: number) => void;
  className?: string;
  showSummary?: boolean;
}

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    if (!pages.includes(i)) pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  if (!pages.includes(total)) pages.push(total);

  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage: currentPageProp,
  totalPages: totalPagesProp,
  total: totalProp,
  isLoading = false,
  isFetching = false,
  onPageChange,
  className = "",
  showSummary = true,
}) => {
  const currentPage = Math.max(1, Number(currentPageProp) || 1);
  const totalPages = Math.max(1, totalPagesProp ?? pagination?.totalPages ?? 1);
  const total = totalProp ?? pagination?.total ?? 0;

  const goToPage = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPages));
    onPageChange(next);
  };

  if (isLoading && total === 0) {
    return (
      <div
        className={`flex items-center justify-between border-t border-slate-200/80 px-4 py-3 bg-slate-50/40 ${className}`}
      >
        <div className="h-3.5 w-48 rounded-md animate-shimmer bg-slate-100" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-8 rounded-md animate-shimmer bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-3 bg-slate-50/40 text-xs transition-opacity duration-300 ease-in-out ${className}`}
    >
      {showSummary && (
        <p className="text-slate-500 font-medium">
          Showing page <strong className="text-slate-900">{currentPage}</strong> of{" "}
          <strong className="text-slate-900">{totalPages}</strong>
          {total > 0 && <span> ({total} total items)</span>}
        </p>
      )}

      <nav className="flex items-center gap-2" aria-label="Pagination">
        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            goToPage(currentPage - 1);
          }}
          className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-100/80 p-1">
          {visiblePages.map((page, idx) =>
            page === "..." ? (
              <span
                key={`dots-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-slate-400 text-[11px] font-bold"
              >
                …
              </span>
            ) : (
              <button
                key={`page-${page}`}
                type="button"
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToPage(page);
                }}
                className={`relative flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-all duration-200 ease-out cursor-pointer ${
                  currentPage === page
                    ? "bg-slate-900 text-white shadow-sm scale-100"
                    : "text-slate-700 hover:bg-white hover:scale-105 active:scale-95"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            goToPage(currentPage + 1);
          }}
          className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
