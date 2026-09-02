"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table";
import { TableSkeletonRows } from "./TableSkeletonRows";
import {
  DEFAULT_TABLE_SKELETON_ROWS,
  TABLE_EMPTY_MIN_HEIGHT_CLASS,
} from "./tableConstants";

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    skeleton?: React.ReactNode | "image-text" | "text" | "text-2lines" | "badge" | "actions-1" | "actions-2" | "numeric" | "avatar";
    /** Hide column below this breakpoint (optional) */
    hideBelow?: "sm" | "md" | "lg";
    className?: string;
  }
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isFetching?: boolean;
  emptyMessage?: string;
  skeletonRowCount?: number;
  onRowClick?: (row: TData) => void;
  /** When true, renders without outer card border (for use inside a parent card with pagination). */
  embedded?: boolean;
  className?: string;
  containerClassName?: string;
}

import { TableEmptyState } from "./TableEmptyState";

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  isFetching = false,
  emptyMessage = "No records found.",
  skeletonRowCount = DEFAULT_TABLE_SKELETON_ROWS,
  onRowClick,
  embedded = false,
  className = "",
  containerClassName = "",
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => {
      const record = row as { id?: string };
      return record.id ?? `row-${index}`;
    },
  });

  const showSkeleton = isLoading || (isFetching && data.length === 0);
  const isTransitioningPage = isFetching && data.length > 0;
  const hasRows = table.getRowModel().rows.length > 0;

  return (
    <div
      className={
        embedded
          ? `w-full flex-1 min-h-0 flex flex-col relative ${containerClassName}`
          : `w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs relative ${containerClassName}`
      }
    >
      <div className="w-full flex-1 min-h-0 overflow-auto overscroll-contain table-scrollbar flex flex-col">
        <table className={`w-full min-w-[36rem] table-auto text-left text-xs text-slate-700 ${className}`}>
          <thead className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const hideClass =
                    meta?.hideBelow === "lg"
                      ? "hidden lg:table-cell"
                      : meta?.hideBelow === "md"
                        ? "hidden md:table-cell"
                        : meta?.hideBelow === "sm"
                          ? "hidden sm:table-cell"
                          : "";

                  return (
                    <th
                      key={header.id}
                      className={`px-3 py-3.5 font-bold sm:px-4 bg-slate-50 ${hideClass} ${meta?.className ?? ""}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showSkeleton || isTransitioningPage ? (
              <TableSkeletonRows<TData, TValue> columns={columns} rowCount={skeletonRowCount} />
            ) : hasRows ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={(e) => {
                    if (!onRowClick) return;
                    const target = e.target as HTMLElement;
                    if (target.closest("button, a, input, select, textarea, [role='button']")) {
                      return;
                    }
                    onRowClick(row.original);
                  }}
                  className={`transition-colors hover:bg-slate-50/70 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    const hideClass =
                      meta?.hideBelow === "lg"
                        ? "hidden lg:table-cell"
                        : meta?.hideBelow === "md"
                          ? "hidden md:table-cell"
                          : meta?.hideBelow === "sm"
                            ? "hidden sm:table-cell"
                            : "";

                    return (
                      <td
                        key={cell.id}
                        className={`px-3 py-3.5 align-middle text-slate-700 font-medium sm:px-4 ${hideClass} ${meta?.className ?? ""}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : null}
          </tbody>
        </table>

        {!showSkeleton && !isTransitioningPage && !hasRows && (
          <div className="flex-1 flex items-center justify-center min-h-[260px] w-full">
            <TableEmptyState
              title={emptyMessage}
              description="No entries found in this table. Try clearing your filters or check back later."
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
