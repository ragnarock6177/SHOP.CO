"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
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
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  isFetching = false,
  emptyMessage = "No records found.",
  skeletonRowCount = DEFAULT_TABLE_SKELETON_ROWS,
  onRowClick,
  embedded = false,
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

  const showInitialSkeleton = isLoading && data.length === 0;
  const showPageChangeSpinner = isFetching && !showInitialSkeleton && data.length > 0;
  const hasRows = table.getRowModel().rows.length > 0;

  return (
    <div
      className={
        embedded
          ? "w-full relative"
          : "w-full overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs relative"
      }
    >
      {showPageChangeSpinner && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" aria-label="Loading" />
        </div>
      )}

      <div className="w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[36rem] table-auto text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                      className={`px-3 py-3.5 font-bold sm:px-4 ${hideClass} ${meta?.className ?? ""}`}
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
            {showInitialSkeleton ? (
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
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <div
                    className={`flex items-center justify-center px-4 text-center text-xs font-medium text-slate-400 ${TABLE_EMPTY_MIN_HEIGHT_CLASS}`}
                  >
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
