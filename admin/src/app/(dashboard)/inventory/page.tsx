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

  const { data, isLoading } = useInventory({
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
      cell: ({ row }) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900">{row.original.sku}</span>
          <p className="text-[11px] text-slate-500">{row.original.productName}</p>
        </div>
      ),
    },
    {
      accessorKey: "quantityOnHand",
      header: "On Hand",
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.quantityOnHand}</span>,
    },
    {
      accessorKey: "quantityReserved",
      header: "Reserved",
      cell: ({ row }) => <span className="text-slate-500">{row.original.quantityReserved}</span>,
    },
    {
      accessorKey: "availableQuantity",
      header: "Available",
      cell: ({ row }) => <span className="font-semibold text-emerald-400">{row.original.availableQuantity}</span>,
    },
    {
      accessorKey: "stockStatus",
      header: "Stock Status",
      cell: ({ row }) => <StatusBadge status={row.original.stockStatus} />,
    },
    {
      id: "actions",
      header: "Actions",
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Inventory Balances</h1>
          <p className="text-xs text-slate-500">Monitor stock on hand, reservations, and execute balance adjustments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/inventory/movements"
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Movements Log</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by SKU, barcode, or product name..."
          className="w-full sm:w-72"
        />
        <div className="flex items-center space-x-2">
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
            triggerClassName="w-40"
          />
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />

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
