"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No records found.",
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
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
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="transition-colors">
                  {columns.map((col: any, colIdx) => {
                    const headerStr = typeof col.header === "string" ? col.header.toLowerCase() : "";
                    const accessorKey = typeof col.accessorKey === "string" ? col.accessorKey.toLowerCase() : "";
                    const isFirst = colIdx === 0;
                    const isLast = colIdx === columns.length - 1;
                    const isBadge =
                      headerStr.includes("status") ||
                      headerStr.includes("verified") ||
                      headerStr.includes("published") ||
                      accessorKey.includes("status") ||
                      accessorKey.includes("verified") ||
                      accessorKey.includes("published");
                    const isNumeric =
                      headerStr.includes("price") ||
                      headerStr.includes("amount") ||
                      headerStr.includes("total") ||
                      headerStr.includes("inventory") ||
                      headerStr.includes("stock") ||
                      headerStr.includes("rating");
                    const isAction =
                      isLast && (headerStr.includes("action") || col.id === "actions");

                    if (isFirst) {
                      return (
                        <td key={colIdx} className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl animate-shimmer bg-slate-100 shrink-0 border border-slate-200/60" />
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div
                                className="h-3.5 rounded-md animate-shimmer bg-slate-100"
                                style={{ width: `${Math.min(160, 95 + ((idx * 19) % 65))}px` }}
                              />
                              <div
                                className="h-2.5 rounded-md animate-shimmer bg-slate-100"
                                style={{ width: `${Math.min(110, 60 + ((idx * 13) % 45))}px` }}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    }

                    if (isBadge) {
                      return (
                        <td key={colIdx} className="px-4 py-3.5">
                          <div className="h-5 w-20 rounded-full animate-shimmer bg-slate-100 border border-slate-200/60" />
                        </td>
                      );
                    }

                    if (isAction) {
                      return (
                        <td key={colIdx} className="px-4 py-3.5">
                          <div className="flex items-center space-x-2">
                            <div className="h-7 w-7 rounded-lg animate-shimmer bg-slate-100 border border-slate-200/60" />
                            <div className="h-7 w-7 rounded-lg animate-shimmer bg-slate-100 border border-slate-200/60" />
                          </div>
                        </td>
                      );
                    }

                    if (isNumeric) {
                      return (
                        <td key={colIdx} className="px-4 py-3.5 text-right">
                          <div
                            className="h-3.5 rounded-md animate-shimmer bg-slate-100 ml-auto"
                            style={{ width: `${Math.min(75, 45 + ((idx * 11) % 30))}px` }}
                          />
                        </td>
                      );
                    }

                    return (
                      <td key={colIdx} className="px-4 py-3.5">
                        <div
                          className="h-3.5 rounded-md animate-shimmer bg-slate-100"
                          style={{ width: `${Math.min(130, 70 + (((idx + colIdx) * 17) % 55))}px` }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-slate-50/70"
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
