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

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    skeleton?: React.ReactNode | "image-text" | "text" | "text-2lines" | "badge" | "actions-1" | "actions-2" | "numeric" | "avatar";
  }
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isFetching?: boolean;
  emptyMessage?: string;
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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3.5 font-bold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showInitialSkeleton ? (
              <TableSkeletonRows<TData, TValue> columns={columns} />
            ) : table.getRowModel().rows?.length ? (
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
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 align-middle text-slate-700 font-medium">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-xs font-medium text-slate-400"
                >
                  {emptyMessage}
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
