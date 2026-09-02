"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import { ColumnDef } from "@tanstack/react-table";
import { SlidersHorizontal, ArrowLeftRight } from "lucide-react";
import { useInventory, useAdjustInventory, InventoryItem } from "../../../hooks/queries/useInventory";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { SearchInput } from "../../../components/filters/SearchInput";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { StockAdjustModal } from "../../../components/forms/StockAdjustModal";
import { PermissionGate } from "../../../components/rbac/PermissionGate";
import { CustomSelect } from "@/components/ui/select";

export default function InventoryPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const { data, isPending, isFetching } = useInventory({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const adjustMutation = useAdjustInventory();

  const handleAdjustSubmit = (payload: any) => {
    adjustMutation.mutate(payload, {
      onSuccess: () => setSelectedItem(null),
    });
  };

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "sku",
      header: "SKU / Product",
      meta: { skeleton: "text-2lines" },
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-semibold text-slate-900">{row.original.sku}</span>
          <p className="text-[11px] text-slate-500">{row.original.productName}</p>
        </div>
      ),
    },
    {
      accessorKey: "quantityOnHand",
      header: "On Hand",
      meta: { skeleton: "text" },
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.quantityOnHand}</span>,
    },
    {
      accessorKey: "quantityReserved",
      header: "Reserved",
      meta: { skeleton: "text" },
      cell: ({ row }) => <span className="text-slate-500">{row.original.quantityReserved}</span>,
    },
    {
      accessorKey: "availableQuantity",
      header: "Available",
      meta: { skeleton: "text" },
      cell: ({ row }) => <span className="font-semibold text-emerald-400">{row.original.availableQuantity}</span>,
    },
    {
      accessorKey: "stockStatus",
      header: "Stock Status",
      meta: { skeleton: "badge" },
      cell: ({ row }) => <StatusBadge status={row.original.stockStatus} />,
    },
    {
      id: "actions",
      header: "Actions",
      meta: { skeleton: <div className="h-7 w-[68px] rounded animate-shimmer bg-slate-100 border border-slate-200/60" /> },
      cell: ({ row }) => (
        <PermissionGate permission="inventory:adjust">
          <button
            onClick={() => setSelectedItem(row.original)}
            className="flex items-center space-x-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>Adjust</span>
          </button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by SKU, barcode, or product name..."
          className="w-full sm:w-72"
        />
        <div className="flex items-center gap-3">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Stock Statuses" },
              { value: "IN_STOCK", label: "In Stock" },
              { value: "LOW_STOCK", label: "Low Stock" },
              { value: "OUT_OF_STOCK", label: "Out of Stock" },
            ]}
            triggerClassName="w-44 sm:w-48"
          />
          <Link
            href="/inventory/movements"
            className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 h-9"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Movements Log</span>
          </Link>
        </div>
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs">
        <DataTable columns={columns} data={data?.data || []} isLoading={isPending && !data} isFetching={isFetching} embedded />

        <div className="shrink-0">
          <Pagination pagination={data?.pagination} currentPage={page} isLoading={isPending && !data} isFetching={isFetching} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      <StockAdjustModal
        item={selectedItem}
        isOpen={!!selectedItem}
        isLoading={adjustMutation.isPending}
        onClose={() => setSelectedItem(null)}
        onSubmit={handleAdjustSubmit}
      />
    </div>
  );
}
