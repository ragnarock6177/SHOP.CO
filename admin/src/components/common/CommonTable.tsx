'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Loader2, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CommonTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchKey?: string;
  isLoading?: boolean;
  emptyText?: string;
  pageSize?: number;
  toolbarExtra?: React.ReactNode;
  className?: string;
}

import { TableSkeletonRows } from '@/components/data-table/TableSkeletonRows';
import { TableEmptyState } from '@/components/data-table/TableEmptyState';

export function CommonTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchKey,
  isLoading = false,
  emptyText = 'No data available',
  pageSize = 10,
  toolbarExtra,
  className,
}: CommonTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={cn('w-full flex-1 min-h-0 flex flex-col bg-white rounded-md border border-slate-200/80 shadow-xs overflow-hidden', className)}>
      {/* Toolbar / Search Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-slate-200/80 bg-slate-50/50">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 h-9 bg-white shadow-2xs border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 rounded-md"
          />
        </div>
        {toolbarExtra && <div className="flex items-center gap-2">{toolbarExtra}</div>}
      </div>

      {/* Table Container */}
      <div className="relative w-full flex-1 min-h-0 overflow-auto overscroll-contain table-scrollbar flex flex-col">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-200/80 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-500 bg-slate-50 font-bold text-[11px] uppercase tracking-wider py-3.5 px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={columns} rowCount={6} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5 px-4 text-xs text-slate-700 font-medium">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : null}
          </TableBody>
        </Table>

        {!isLoading && !table.getRowModel().rows?.length && (
          <div className="flex-1 flex items-center justify-center min-h-65 w-full">
            <TableEmptyState
              title={emptyText}
              description="No records found. Try adjusting your filters or search keywords."
            />
          </div>
        )}
      </div>

      {/* Pagination Footer - Only shown when more than 10 rows */}
      {table.getFilteredRowModel().rows.length > 10 && (
        <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/80 bg-slate-50/40 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-900">{table.getRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0}</span> to{' '}
            <span className="font-bold text-slate-900">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{' '}
            of <span className="font-bold text-slate-900">{table.getFilteredRowModel().rows.length}</span> entries
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Previous Button */}
            <button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="group flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-900 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              aria-label="Previous Page"
            >
              <div className="p-1.5 rounded-full border border-slate-200 bg-white group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
                <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Indicator */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-md border border-slate-200/70 shadow-2xs">
              <span className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-white rounded-md shadow-2xs">
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span className="px-1 text-xs font-bold text-slate-400">/</span>
              <span className="px-2 py-1 text-xs font-bold text-slate-600">
                {table.getPageCount() || 1}
              </span>
            </div>

            {/* Next Button */}
            <button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className="group flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-900 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              aria-label="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <div className="p-1.5 rounded-full border border-slate-200 bg-white group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
