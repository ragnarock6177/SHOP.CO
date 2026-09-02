"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-shimmer rounded-md bg-slate-100 ${className}`}
      {...props}
    />
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-md border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-full mt-3" />
      </div>
    </div>
  );
};

export const WidgetSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <Skeleton className="h-3.5 w-14 rounded-md" />
      </div>

      {/* Rows */}
      <div className="mt-2 divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3.5 px-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-2.5 w-20 rounded-md" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-md" />
          <Skeleton className="h-3.5 w-72 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* 2 Widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WidgetSkeleton rows={4} />
        <WidgetSkeleton rows={4} />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 6,
  columns = 5,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs animate-fade-in-up">
      {/* Table Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-slate-200/80 bg-slate-50/50">
        <Skeleton className="h-9 w-72 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Table Header & Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3.5">
                  <Skeleton
                    className="h-3 rounded-md"
                    style={{ width: `${Math.min(100, 50 + (i * 15))}px` }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx}>
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="px-4 py-3.5">
                    {cIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <Skeleton
                            className="h-3.5 rounded-md"
                            style={{ width: `${Math.min(140, 85 + ((rIdx * 19) % 55))}px` }}
                          />
                          <Skeleton
                            className="h-2.5 rounded-md"
                            style={{ width: `${Math.min(90, 50 + ((rIdx * 13) % 40))}px` }}
                          />
                        </div>
                      </div>
                    ) : cIdx === columns - 1 ? (
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    ) : (
                      <Skeleton
                        className="h-3.5 rounded-md"
                        style={{ width: `${Math.min(110, 60 + (((rIdx + cIdx) * 17) % 50))}px` }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-3 bg-slate-50/40">
        <Skeleton className="h-3.5 w-48 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
