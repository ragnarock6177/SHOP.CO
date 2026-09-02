"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";

export function TableSkeletonRows<TData, TValue = unknown>({
  columns,
  rowCount = 6,
}: {
  columns: ColumnDef<TData, TValue>[];
  rowCount?: number;
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, idx) => (
        <tr key={idx} className="transition-colors">
          {columns.map((col, colIdx) => {
            const metaSkeleton = col.meta?.skeleton;

            if (React.isValidElement(metaSkeleton)) {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  {metaSkeleton}
                </td>
              );
            }

            if (metaSkeleton === "image-text") {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md animate-shimmer bg-slate-100 shrink-0 border border-slate-200/60" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="h-3.5 rounded-md animate-shimmer bg-slate-100 w-32" />
                      <div className="h-2.5 rounded-md animate-shimmer bg-slate-100 w-20" />
                    </div>
                  </div>
                </td>
              );
            }

            if (metaSkeleton === "avatar") {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full animate-shimmer bg-slate-100 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 rounded-md animate-shimmer bg-slate-100 w-24" />
                      <div className="h-2.5 rounded-md animate-shimmer bg-slate-100 w-16" />
                    </div>
                  </div>
                </td>
              );
            }

            if (metaSkeleton === "badge") {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="h-5 w-20 rounded-full animate-shimmer bg-slate-100 border border-slate-200/60" />
                </td>
              );
            }

            if (metaSkeleton === "actions-1") {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="h-7 w-7 rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
                </td>
              );
            }

            if (metaSkeleton === "actions-2") {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
                    <div className="h-7 w-7 rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
                  </div>
                </td>
              );
            }

            if (metaSkeleton === "numeric") {
              return (
                <td key={colIdx} className="px-3 py-3.5 text-right sm:px-4">
                  <div className="h-3.5 rounded-md animate-shimmer bg-slate-100 w-12 ml-auto" />
                </td>
              );
            }

            if (metaSkeleton === "text") {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="h-3.5 rounded-md animate-shimmer bg-slate-100 w-24" />
                </td>
              );
            }

            if (metaSkeleton === "text-2lines") {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="space-y-1.5">
                    <div className="h-3.5 rounded-md animate-shimmer bg-slate-100 w-32" />
                    <div className="h-2.5 rounded-md animate-shimmer bg-slate-100 w-20" />
                  </div>
                </td>
              );
            }

            const headerStr = typeof col.header === "string" ? col.header.toLowerCase() : "";
            const accessorKey = typeof (col as { accessorKey?: string }).accessorKey === "string"
              ? (col as { accessorKey: string }).accessorKey.toLowerCase()
              : "";
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
            const isAction = isLast && (headerStr.includes("action") || col.id === "actions");

            if (isFirst) {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md animate-shimmer bg-slate-100 shrink-0 border border-slate-200/60" />
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
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="h-5 w-20 rounded-full animate-shimmer bg-slate-100 border border-slate-200/60" />
                </td>
              );
            }

            if (isAction) {
              return (
                <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
                    <div className="h-7 w-7 rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
                  </div>
                </td>
              );
            }

            if (isNumeric) {
              return (
                <td key={colIdx} className="px-3 py-3.5 text-right sm:px-4">
                  <div
                    className="h-3.5 rounded-md animate-shimmer bg-slate-100 ml-auto"
                    style={{ width: `${Math.min(75, 45 + ((idx * 11) % 30))}px` }}
                  />
                </td>
              );
            }

            return (
              <td key={colIdx} className="px-3 py-3.5 sm:px-4">
                <div
                  className="h-3.5 rounded-md animate-shimmer bg-slate-100"
                  style={{ width: `${Math.min(130, 70 + (((idx + colIdx) * 17) % 55))}px` }}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
