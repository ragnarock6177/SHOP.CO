"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/types/api";

export interface PaginationProps {
  pagination?: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, hasPrevPage, hasNextPage } = pagination;

  return (
    <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-xs text-zinc-400">
      <div>
        Showing page <span className="font-semibold text-zinc-200">{page}</span> of{" "}
        <span className="font-semibold text-zinc-200">{totalPages}</span> ({total} total items)
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-40"
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-40"
        >
          Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
